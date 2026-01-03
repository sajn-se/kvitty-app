import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, workspaceProcedure, publicProcedure } from "../init";
import {
  invoices,
  invoiceLines,
  customers,
  products,
  journalEntries,
  journalEntryLines,
  fiscalPeriods,
} from "@/lib/db/schema";
import { eq, and, sql, desc, lte, gte, lt, asc } from "drizzle-orm";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  addInvoiceLineSchema,
  updateInvoiceLineSchema,
  updateLineOrderSchema,
  updateInvoiceMetadataSchema,
} from "@/lib/validations/invoice";
import { sendInvoiceEmailWithPdf, sendInvoiceEmailWithLink } from "@/lib/email/send-invoice";
import { sendReminderEmailWithPdf } from "@/lib/email/send-reminder";
import { createCuid } from "@/lib/utils/cuid";
import { workspaces, invoiceOpenLogs } from "@/lib/db/schema";

// Helper to recalculate invoice totals
async function recalculateInvoiceTotals(
  db: Parameters<Parameters<typeof workspaceProcedure.query>[0]>[0]["ctx"]["db"],
  invoiceId: string
) {
  const lines = await db.query.invoiceLines.findMany({
    where: eq(invoiceLines.invoiceId, invoiceId),
  });

  let subtotal = 0;
  let vatAmount = 0;

  for (const line of lines) {
    const lineAmount = Number(line.amount);
    subtotal += lineAmount;
    vatAmount += lineAmount * (line.vatRate / 100);
  }

  const total = subtotal + vatAmount;

  await db
    .update(invoices)
    .set({
      subtotal: subtotal.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: total.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));
}

// Helper to calculate invoice breakdown by product type and VAT rate
// Returns amounts for journal entry creation
interface InvoiceBreakdown {
  totalInclVat: number;        // Total including VAT (for 1510 debit)
  serviceAmount: number;       // Tjänster subtotal excl VAT (for 3010 credit)
  goodsAmount: number;         // Varor subtotal excl VAT (for 3040 credit)
  vat25: number;               // 25% VAT amount (for 2610 credit)
  vat12: number;               // 12% VAT amount (for 2620 credit)
  vat6: number;                // 6% VAT amount (for 2630 credit)
}

function calculateInvoiceBreakdown(
  lines: Array<{
    lineType: string;
    productType: string | null;
    amount: string;
    vatRate: number;
  }>
): InvoiceBreakdown {
  let serviceAmount = 0;
  let goodsAmount = 0;
  let vat25 = 0;
  let vat12 = 0;
  let vat6 = 0;

  for (const line of lines) {
    // Skip text lines - they don't generate revenue
    if (line.lineType === "text") continue;

    const amount = Number(line.amount);
    const vatAmount = amount * (line.vatRate / 100);

    // Determine product type: use stored type, default to T (tjänst) if not set
    const productType = line.productType || "T";

    // Add to appropriate revenue account
    if (productType === "V") {
      goodsAmount += amount;
    } else {
      serviceAmount += amount;
    }

    // Add to appropriate VAT account
    if (line.vatRate === 25) {
      vat25 += vatAmount;
    } else if (line.vatRate === 12) {
      vat12 += vatAmount;
    } else if (line.vatRate === 6) {
      vat6 += vatAmount;
    }
    // 0% VAT doesn't need an entry
  }

  const totalInclVat = serviceAmount + goodsAmount + vat25 + vat12 + vat6;

  return {
    totalInclVat,
    serviceAmount,
    goodsAmount,
    vat25,
    vat12,
    vat6,
  };
}

export const invoicesRouter = router({
  list: workspaceProcedure
    .input(
      z.object({
        status: z.enum(["draft", "sent", "paid"]).optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const invoiceList = await ctx.db.query.invoices.findMany({
        where: input.status
          ? and(
              eq(invoices.workspaceId, ctx.workspaceId),
              eq(invoices.status, input.status)
            )
          : eq(invoices.workspaceId, ctx.workspaceId),
        with: {
          customer: true,
          lines: {
            orderBy: (l, { asc }) => [asc(l.sortOrder)],
          },
        },
        orderBy: [desc(invoices.invoiceDate), desc(invoices.invoiceNumber)],
        limit: input.limit,
      });

      return invoiceList;
    }),

  get: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.id),
          eq(invoices.workspaceId, ctx.workspaceId)
        ),
        with: {
          customer: true,
          lines: {
            orderBy: (l, { asc }) => [asc(l.sortOrder)],
            with: {
              product: true,
            },
          },
          fiscalPeriod: true,
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return invoice;
    }),

  getNextNumber: workspaceProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ maxNumber: sql<number>`COALESCE(MAX(${invoices.invoiceNumber}), 0)` })
      .from(invoices)
      .where(eq(invoices.workspaceId, ctx.workspaceId));

    return (result[0]?.maxNumber || 0) + 1;
  }),

  // Simplified create - no lines required (add them on detail page)
  create: workspaceProcedure
    .input(createInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify customer belongs to workspace
      const customer = await ctx.db.query.customers.findFirst({
        where: and(
          eq(customers.id, input.customerId),
          eq(customers.workspaceId, ctx.workspaceId)
        ),
      });

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Kund hittades inte" });
      }

      // Get next invoice number
      const result = await ctx.db
        .select({ maxNumber: sql<number>`COALESCE(MAX(${invoices.invoiceNumber}), 0)` })
        .from(invoices)
        .where(eq(invoices.workspaceId, ctx.workspaceId));

      const invoiceNumber = (result[0]?.maxNumber || 0) + 1;

      // Create invoice with zero totals (will be updated when lines are added)
      const [invoice] = await ctx.db
        .insert(invoices)
        .values({
          workspaceId: ctx.workspaceId,
          customerId: input.customerId,
          fiscalPeriodId: input.fiscalPeriodId || null,
          invoiceNumber,
          invoiceDate: input.invoiceDate,
          dueDate: input.dueDate,
          reference: input.reference || null,
          subtotal: "0.00",
          vatAmount: "0.00",
          total: "0.00",
          status: "draft",
        })
        .returning();

      return invoice;
    }),

  // Full update with lines (replaces all lines)
  update: workspaceProcedure
    .input(updateInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.id),
          eq(invoices.workspaceId, ctx.workspaceId)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existing.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kan endast redigera utkast",
        });
      }

      // Calculate totals
      let subtotal = 0;
      let vatAmount = 0;

      for (const line of input.lines) {
        const lineAmount = line.quantity * line.unitPrice;
        subtotal += lineAmount;
        vatAmount += lineAmount * (line.vatRate / 100);
      }

      const total = subtotal + vatAmount;

      // Update invoice
      const [updated] = await ctx.db
        .update(invoices)
        .set({
          customerId: input.customerId,
          fiscalPeriodId: input.fiscalPeriodId || null,
          invoiceDate: input.invoiceDate,
          dueDate: input.dueDate,
          reference: input.reference || null,
          subtotal: subtotal.toFixed(2),
          vatAmount: vatAmount.toFixed(2),
          total: total.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.id))
        .returning();

      // Delete old lines and create new ones
      await ctx.db.delete(invoiceLines).where(eq(invoiceLines.invoiceId, input.id));

      for (let i = 0; i < input.lines.length; i++) {
        const line = input.lines[i];
        const lineAmount = line.quantity * line.unitPrice;

        await ctx.db.insert(invoiceLines).values({
          invoiceId: input.id,
          productId: line.productId || null,
          lineType: line.lineType,
          description: line.description,
          quantity: line.quantity.toString(),
          unit: line.unit || null,
          unitPrice: line.unitPrice.toFixed(2),
          vatRate: line.vatRate,
          amount: lineAmount.toFixed(2),
          sortOrder: i,
        });
      }

      return updated;
    }),

  // Update invoice metadata (customer, dates, reference)
  updateMetadata: workspaceProcedure
    .input(updateInvoiceMetadataSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.id),
          eq(invoices.workspaceId, ctx.workspaceId)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existing.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kan endast redigera utkast",
        });
      }

      // Verify customer if provided
      if (input.customerId) {
        const customer = await ctx.db.query.customers.findFirst({
          where: and(
            eq(customers.id, input.customerId),
            eq(customers.workspaceId, ctx.workspaceId)
          ),
        });

        if (!customer) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Kund hittades inte" });
        }
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.customerId !== undefined) updateData.customerId = input.customerId;
      if (input.invoiceDate !== undefined) updateData.invoiceDate = input.invoiceDate;
      if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
      if (input.reference !== undefined) updateData.reference = input.reference || null;

      const [updated] = await ctx.db
        .update(invoices)
        .set(updateData)
        .where(eq(invoices.id, input.id))
        .returning();

      return updated;
    }),

  // Add a single line to invoice
  addLine: workspaceProcedure
    .input(addInvoiceLineSchema)
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.workspaceId, ctx.workspaceId)
        ),
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (invoice.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kan endast redigera utkast",
        });
      }

      // Look up product to get productType if productId is provided
      let productType: "V" | "T" | null = null;
      if (input.productId) {
        const product = await ctx.db.query.products.findFirst({
          where: and(
            eq(products.id, input.productId),
            eq(products.workspaceId, ctx.workspaceId)
          ),
        });
        if (product) {
          productType = product.type;
        }
      }

      // Get max sortOrder
      const maxOrderResult = await ctx.db
        .select({ maxOrder: sql<number>`COALESCE(MAX(${invoiceLines.sortOrder}), -1)` })
        .from(invoiceLines)
        .where(eq(invoiceLines.invoiceId, input.invoiceId));

      const newSortOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;
      const lineAmount = input.quantity * input.unitPrice;

      const [line] = await ctx.db
        .insert(invoiceLines)
        .values({
          invoiceId: input.invoiceId,
          productId: input.productId || null,
          lineType: input.lineType,
          description: input.description,
          quantity: input.quantity.toString(),
          unit: input.unit || null,
          unitPrice: input.unitPrice.toFixed(2),
          vatRate: input.vatRate,
          productType: productType,
          amount: lineAmount.toFixed(2),
          sortOrder: newSortOrder,
        })
        .returning();

      // Recalculate totals
      await recalculateInvoiceTotals(ctx.db, input.invoiceId);

      return line;
    }),

  // Update a single line
  updateLine: workspaceProcedure
    .input(updateInvoiceLineSchema)
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.workspaceId, ctx.workspaceId)
        ),
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (invoice.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kan endast redigera utkast",
        });
      }

      const existingLine = await ctx.db.query.invoiceLines.findFirst({
        where: and(
          eq(invoiceLines.id, input.lineId),
          eq(invoiceLines.invoiceId, input.invoiceId)
        ),
      });

      if (!existingLine) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Rad hittades inte" });
      }

      const updateData: Record<string, unknown> = {};

      if (input.description !== undefined) updateData.description = input.description;
      if (input.quantity !== undefined) updateData.quantity = input.quantity.toString();
      if (input.unit !== undefined) updateData.unit = input.unit;
      if (input.unitPrice !== undefined) updateData.unitPrice = input.unitPrice.toFixed(2);
      if (input.vatRate !== undefined) updateData.vatRate = input.vatRate;

      // Recalculate line amount if quantity or price changed
      const quantity = input.quantity ?? Number(existingLine.quantity);
      const unitPrice = input.unitPrice ?? Number(existingLine.unitPrice);
      updateData.amount = (quantity * unitPrice).toFixed(2);

      const [updated] = await ctx.db
        .update(invoiceLines)
        .set(updateData)
        .where(eq(invoiceLines.id, input.lineId))
        .returning();

      // Recalculate totals
      await recalculateInvoiceTotals(ctx.db, input.invoiceId);

      return updated;
    }),

  // Delete a line
  deleteLine: workspaceProcedure
    .input(z.object({ lineId: z.string(), invoiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.workspaceId, ctx.workspaceId)
        ),
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (invoice.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kan endast redigera utkast",
        });
      }

      await ctx.db
        .delete(invoiceLines)
        .where(
          and(
            eq(invoiceLines.id, input.lineId),
            eq(invoiceLines.invoiceId, input.invoiceId)
          )
        );

      // Recalculate totals
      await recalculateInvoiceTotals(ctx.db, input.invoiceId);

      return { success: true };
    }),

  // Reorder lines (drag and drop)
  reorderLines: workspaceProcedure
    .input(updateLineOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.workspaceId, ctx.workspaceId)
        ),
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (invoice.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kan endast redigera utkast",
        });
      }

      // Update sortOrder for each line
      for (let i = 0; i < input.lineIds.length; i++) {
        await ctx.db
          .update(invoiceLines)
          .set({ sortOrder: i })
          .where(
            and(
              eq(invoiceLines.id, input.lineIds[i]),
              eq(invoiceLines.invoiceId, input.invoiceId)
            )
          );
      }

      return { success: true };
    }),

  delete: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.id),
          eq(invoices.workspaceId, ctx.workspaceId)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existing.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kan endast ta bort utkast",
        });
      }

      // Lines are deleted by cascade
      await ctx.db.delete(invoices).where(eq(invoices.id, input.id));

      return { success: true };
    }),

  markAsSent: workspaceProcedure
    .input(
      z.object({
        id: z.string(),
        createVerification: z.boolean().default(false), // User prompted in UI
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.id),
          eq(invoices.workspaceId, ctx.workspaceId)
        ),
        with: {
          customer: true,
          lines: true,
        },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existing.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Fakturan är redan skickad",
        });
      }

      let sentJournalEntryId: string | null = null;

      // Create verification/journal entry if requested
      if (input.createVerification) {
        // Find the fiscal period for the invoice date
        const period = await ctx.db.query.fiscalPeriods.findFirst({
          where: and(
            eq(fiscalPeriods.workspaceId, ctx.workspaceId),
            lte(fiscalPeriods.startDate, existing.invoiceDate),
            gte(fiscalPeriods.endDate, existing.invoiceDate)
          ),
        });

        if (period) {
          // Calculate breakdown for journal entry
          const breakdown = calculateInvoiceBreakdown(existing.lines);

          // Only create verification if there's actual revenue
          if (breakdown.totalInclVat > 0) {
            // Get next verification number for this period
            const maxVerifResult = await ctx.db
              .select({
                maxNum: sql<number>`COALESCE(MAX(${journalEntries.verificationNumber}), 0)`,
              })
              .from(journalEntries)
              .where(eq(journalEntries.fiscalPeriodId, period.id));

            const nextVerifNumber = (maxVerifResult[0]?.maxNum || 0) + 1;

            // Create the journal entry
            const [entry] = await ctx.db
              .insert(journalEntries)
              .values({
                workspaceId: ctx.workspaceId,
                fiscalPeriodId: period.id,
                verificationNumber: nextVerifNumber,
                entryDate: existing.invoiceDate,
                description: `Faktura #${existing.invoiceNumber} - ${existing.customer.name}`,
                entryType: "inkomst",
                sourceType: "invoice_sent",
                createdBy: ctx.session!.session.userId,
              })
              .returning();

            sentJournalEntryId = entry.id;

            // Build journal entry lines
            const entryLines: Array<{
              journalEntryId: string;
              accountNumber: number;
              accountName: string;
              debit: string | null;
              credit: string | null;
              description: string;
              sortOrder: number;
            }> = [];

            let sortOrder = 0;

            // Debit 1510 (Kundfordringar) with total amount incl VAT
            entryLines.push({
              journalEntryId: entry.id,
              accountNumber: 1510,
              accountName: "Kundfordringar",
              debit: breakdown.totalInclVat.toFixed(2),
              credit: null,
              description: `Faktura #${existing.invoiceNumber}`,
              sortOrder: sortOrder++,
            });

            // Credit 3010 (Försäljning tjänster) if there are services
            if (breakdown.serviceAmount > 0) {
              entryLines.push({
                journalEntryId: entry.id,
                accountNumber: 3010,
                accountName: "Försäljning tjänster",
                debit: null,
                credit: breakdown.serviceAmount.toFixed(2),
                description: "Tjänster",
                sortOrder: sortOrder++,
              });
            }

            // Credit 3040 (Försäljning varor) if there are goods
            if (breakdown.goodsAmount > 0) {
              entryLines.push({
                journalEntryId: entry.id,
                accountNumber: 3040,
                accountName: "Försäljning varor",
                debit: null,
                credit: breakdown.goodsAmount.toFixed(2),
                description: "Varor",
                sortOrder: sortOrder++,
              });
            }

            // Credit 2610 (Utgående moms 25%) if there's 25% VAT
            if (breakdown.vat25 > 0) {
              entryLines.push({
                journalEntryId: entry.id,
                accountNumber: 2610,
                accountName: "Utgående moms 25%",
                debit: null,
                credit: breakdown.vat25.toFixed(2),
                description: "Moms 25%",
                sortOrder: sortOrder++,
              });
            }

            // Credit 2620 (Utgående moms 12%) if there's 12% VAT
            if (breakdown.vat12 > 0) {
              entryLines.push({
                journalEntryId: entry.id,
                accountNumber: 2620,
                accountName: "Utgående moms 12%",
                debit: null,
                credit: breakdown.vat12.toFixed(2),
                description: "Moms 12%",
                sortOrder: sortOrder++,
              });
            }

            // Credit 2630 (Utgående moms 6%) if there's 6% VAT
            if (breakdown.vat6 > 0) {
              entryLines.push({
                journalEntryId: entry.id,
                accountNumber: 2630,
                accountName: "Utgående moms 6%",
                debit: null,
                credit: breakdown.vat6.toFixed(2),
                description: "Moms 6%",
                sortOrder: sortOrder++,
              });
            }

            // Insert all journal entry lines
            await ctx.db.insert(journalEntryLines).values(entryLines);
          }
        }
      }

      const [updated] = await ctx.db
        .update(invoices)
        .set({
          status: "sent",
          sentAt: new Date(),
          sentJournalEntryId,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.id))
        .returning();

      return updated;
    }),

  markAsPaid: workspaceProcedure
    .input(
      z.object({
        id: z.string(),
        paidDate: z.string().date().optional(),
        paidAmount: z.number().optional(), // Actual amount received
        createVerification: z.boolean().default(false), // User prompted in UI
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.id),
          eq(invoices.workspaceId, ctx.workspaceId)
        ),
        with: {
          customer: true,
          lines: true,
        },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Validate invoice is sent first
      if (existing.status !== "sent") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: existing.status === "draft"
            ? "Fakturan måste publiceras innan den kan markeras som betald"
            : "Fakturan är redan betald",
        });
      }

      const paidDate = input.paidDate || new Date().toISOString().split("T")[0];
      const paidAmount = input.paidAmount ?? Number(existing.total);

      let journalEntryId: string | null = null;

      // Create verification/journal entry if requested
      if (input.createVerification) {
        // Find the fiscal period for this date
        const period = await ctx.db.query.fiscalPeriods.findFirst({
          where: and(
            eq(fiscalPeriods.workspaceId, ctx.workspaceId),
            lte(fiscalPeriods.startDate, paidDate),
            gte(fiscalPeriods.endDate, paidDate)
          ),
        });

        if (period) {
          // Get next verification number for this period
          const maxVerifResult = await ctx.db
            .select({
              maxNum: sql<number>`COALESCE(MAX(${journalEntries.verificationNumber}), 0)`,
            })
            .from(journalEntries)
            .where(eq(journalEntries.fiscalPeriodId, period.id));

          const nextVerifNumber = (maxVerifResult[0]?.maxNum || 0) + 1;

          // Create the journal entry
          const [entry] = await ctx.db
            .insert(journalEntries)
            .values({
              workspaceId: ctx.workspaceId,
              fiscalPeriodId: period.id,
              verificationNumber: nextVerifNumber,
              entryDate: paidDate,
              description: `Betalning faktura #${existing.invoiceNumber} - ${existing.customer.name}`,
              entryType: "inkomst",
              sourceType: "invoice_payment",
              createdBy: ctx.session!.session.userId,
            })
            .returning();

          journalEntryId = entry.id;

          // Create journal entry lines:
          // Debit 1930 (Företagskonto) - the bank account
          // Credit 1510 (Kundfordringar) - accounts receivable

          await ctx.db.insert(journalEntryLines).values([
            {
              journalEntryId: entry.id,
              accountNumber: 1930,
              accountName: "Företagskonto",
              debit: paidAmount.toFixed(2),
              credit: null,
              description: `Betalning faktura #${existing.invoiceNumber}`,
              sortOrder: 0,
            },
            {
              journalEntryId: entry.id,
              accountNumber: 1510,
              accountName: "Kundfordringar",
              debit: null,
              credit: paidAmount.toFixed(2),
              description: `Faktura #${existing.invoiceNumber} betald`,
              sortOrder: 1,
            },
          ]);
        }
      }

      const [updated] = await ctx.db
        .update(invoices)
        .set({
          status: "paid",
          paidDate,
          paidAmount: paidAmount.toFixed(2),
          journalEntryId,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.id))
        .returning();

      return updated;
    }),

  // Create sent verification after the fact (if user skipped it initially)
  createSentVerification: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.id),
          eq(invoices.workspaceId, ctx.workspaceId)
        ),
        with: {
          customer: true,
          lines: true,
        },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Must be sent (or paid) to create verification
      if (existing.status === "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Fakturan måste publiceras först",
        });
      }

      // Cannot create duplicate verification
      if (existing.sentJournalEntryId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Fakturan har redan en bokföringspost för publicering",
        });
      }

      // Find the fiscal period for the invoice date
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.workspaceId, ctx.workspaceId),
          lte(fiscalPeriods.startDate, existing.invoiceDate),
          gte(fiscalPeriods.endDate, existing.invoiceDate)
        ),
      });

      if (!period) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ingen räkenskapsperiod hittades för fakturadatumet",
        });
      }

      // Calculate breakdown for journal entry
      const breakdown = calculateInvoiceBreakdown(existing.lines);

      if (breakdown.totalInclVat <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Fakturan har inget belopp att bokföra",
        });
      }

      // Get next verification number for this period
      const maxVerifResult = await ctx.db
        .select({
          maxNum: sql<number>`COALESCE(MAX(${journalEntries.verificationNumber}), 0)`,
        })
        .from(journalEntries)
        .where(eq(journalEntries.fiscalPeriodId, period.id));

      const nextVerifNumber = (maxVerifResult[0]?.maxNum || 0) + 1;

      // Create the journal entry
      const [entry] = await ctx.db
        .insert(journalEntries)
        .values({
          workspaceId: ctx.workspaceId,
          fiscalPeriodId: period.id,
          verificationNumber: nextVerifNumber,
          entryDate: existing.invoiceDate,
          description: `Faktura #${existing.invoiceNumber} - ${existing.customer.name}`,
          entryType: "inkomst",
          sourceType: "invoice_sent",
          createdBy: ctx.session!.session.userId,
        })
        .returning();

      // Build journal entry lines
      const entryLines: Array<{
        journalEntryId: string;
        accountNumber: number;
        accountName: string;
        debit: string | null;
        credit: string | null;
        description: string;
        sortOrder: number;
      }> = [];

      let sortOrder = 0;

      // Debit 1510 (Kundfordringar) with total amount incl VAT
      entryLines.push({
        journalEntryId: entry.id,
        accountNumber: 1510,
        accountName: "Kundfordringar",
        debit: breakdown.totalInclVat.toFixed(2),
        credit: null,
        description: `Faktura #${existing.invoiceNumber}`,
        sortOrder: sortOrder++,
      });

      // Credit 3010 (Försäljning tjänster) if there are services
      if (breakdown.serviceAmount > 0) {
        entryLines.push({
          journalEntryId: entry.id,
          accountNumber: 3010,
          accountName: "Försäljning tjänster",
          debit: null,
          credit: breakdown.serviceAmount.toFixed(2),
          description: "Tjänster",
          sortOrder: sortOrder++,
        });
      }

      // Credit 3040 (Försäljning varor) if there are goods
      if (breakdown.goodsAmount > 0) {
        entryLines.push({
          journalEntryId: entry.id,
          accountNumber: 3040,
          accountName: "Försäljning varor",
          debit: null,
          credit: breakdown.goodsAmount.toFixed(2),
          description: "Varor",
          sortOrder: sortOrder++,
        });
      }

      // Credit 2610 (Utgående moms 25%) if there's 25% VAT
      if (breakdown.vat25 > 0) {
        entryLines.push({
          journalEntryId: entry.id,
          accountNumber: 2610,
          accountName: "Utgående moms 25%",
          debit: null,
          credit: breakdown.vat25.toFixed(2),
          description: "Moms 25%",
          sortOrder: sortOrder++,
        });
      }

      // Credit 2620 (Utgående moms 12%) if there's 12% VAT
      if (breakdown.vat12 > 0) {
        entryLines.push({
          journalEntryId: entry.id,
          accountNumber: 2620,
          accountName: "Utgående moms 12%",
          debit: null,
          credit: breakdown.vat12.toFixed(2),
          description: "Moms 12%",
          sortOrder: sortOrder++,
        });
      }

      // Credit 2630 (Utgående moms 6%) if there's 6% VAT
      if (breakdown.vat6 > 0) {
        entryLines.push({
          journalEntryId: entry.id,
          accountNumber: 2630,
          accountName: "Utgående moms 6%",
          debit: null,
          credit: breakdown.vat6.toFixed(2),
          description: "Moms 6%",
          sortOrder: sortOrder++,
        });
      }

      // Insert all journal entry lines
      await ctx.db.insert(journalEntryLines).values(entryLines);

      // Update invoice with sentJournalEntryId
      const [updated] = await ctx.db
        .update(invoices)
        .set({
          sentJournalEntryId: entry.id,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.id))
        .returning();

      return updated;
    }),

  // Create paid verification after the fact (if user skipped it initially)
  createPaidVerification: workspaceProcedure
    .input(
      z.object({
        id: z.string(),
        paidAmount: z.number().optional(), // Override if different from paidAmount stored
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.id),
          eq(invoices.workspaceId, ctx.workspaceId)
        ),
        with: {
          customer: true,
        },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Must be paid to create payment verification
      if (existing.status !== "paid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Fakturan måste vara markerad som betald först",
        });
      }

      // Cannot create duplicate verification
      if (existing.journalEntryId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Fakturan har redan en bokföringspost för betalning",
        });
      }

      const paidDate = existing.paidDate || new Date().toISOString().split("T")[0];
      const paidAmount = input.paidAmount ?? Number(existing.paidAmount || existing.total);

      // Find the fiscal period for this date
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.workspaceId, ctx.workspaceId),
          lte(fiscalPeriods.startDate, paidDate),
          gte(fiscalPeriods.endDate, paidDate)
        ),
      });

      if (!period) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ingen räkenskapsperiod hittades för betalningsdatumet",
        });
      }

      // Get next verification number for this period
      const maxVerifResult = await ctx.db
        .select({
          maxNum: sql<number>`COALESCE(MAX(${journalEntries.verificationNumber}), 0)`,
        })
        .from(journalEntries)
        .where(eq(journalEntries.fiscalPeriodId, period.id));

      const nextVerifNumber = (maxVerifResult[0]?.maxNum || 0) + 1;

      // Create the journal entry
      const [entry] = await ctx.db
        .insert(journalEntries)
        .values({
          workspaceId: ctx.workspaceId,
          fiscalPeriodId: period.id,
          verificationNumber: nextVerifNumber,
          entryDate: paidDate,
          description: `Betalning faktura #${existing.invoiceNumber} - ${existing.customer.name}`,
          entryType: "inkomst",
          sourceType: "invoice_payment",
          createdBy: ctx.session!.session.userId,
        })
        .returning();

      // Create journal entry lines:
      // Debit 1930 (Företagskonto) - the bank account
      // Credit 1510 (Kundfordringar) - accounts receivable
      await ctx.db.insert(journalEntryLines).values([
        {
          journalEntryId: entry.id,
          accountNumber: 1930,
          accountName: "Företagskonto",
          debit: paidAmount.toFixed(2),
          credit: null,
          description: `Betalning faktura #${existing.invoiceNumber}`,
          sortOrder: 0,
        },
        {
          journalEntryId: entry.id,
          accountNumber: 1510,
          accountName: "Kundfordringar",
          debit: null,
          credit: paidAmount.toFixed(2),
          description: `Faktura #${existing.invoiceNumber} betald`,
          sortOrder: 1,
        },
      ]);

      // Update invoice with journalEntryId
      const [updated] = await ctx.db
        .update(invoices)
        .set({
          journalEntryId: entry.id,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.id))
        .returning();

      return updated;
    }),

  sendInvoice: workspaceProcedure
    .input(
      z.object({
        id: z.string(),
        sendMethod: z.enum(["pdf", "link"]),
        email: z.string().email(),
        subject: z.string().optional(),
        message: z.string().optional(),
        createVerification: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const existing = await ctx.db.query.invoices.findFirst({
          where: and(
            eq(invoices.id, input.id),
            eq(invoices.workspaceId, ctx.workspaceId)
          ),
          with: {
            customer: true,
            lines: true,
          },
        });

        if (!existing) {
          console.error("[Invoice sendInvoice] Invoice not found", {
            invoiceId: input.id,
            workspaceId: ctx.workspaceId,
            timestamp: new Date().toISOString(),
          });
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (existing.status !== "draft") {
          console.error("[Invoice sendInvoice] Invoice already sent", {
            invoiceId: input.id,
            invoiceNumber: existing.invoiceNumber,
            currentStatus: existing.status,
            workspaceId: ctx.workspaceId,
            timestamp: new Date().toISOString(),
          });
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Fakturan är redan skickad",
          });
        }

      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, ctx.workspaceId),
      });

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      let shareToken: string | null = null;
      if (input.sendMethod === "link") {
        shareToken = createCuid();
      }

      let sentJournalEntryId: string | null = null;

      if (input.createVerification) {
        const period = await ctx.db.query.fiscalPeriods.findFirst({
          where: and(
            eq(fiscalPeriods.workspaceId, ctx.workspaceId),
            lte(fiscalPeriods.startDate, existing.invoiceDate),
            gte(fiscalPeriods.endDate, existing.invoiceDate)
          ),
        });

        if (period) {
          const breakdown = calculateInvoiceBreakdown(existing.lines);

          if (breakdown.totalInclVat > 0) {
            const maxVerifResult = await ctx.db
              .select({
                maxNum: sql<number>`COALESCE(MAX(${journalEntries.verificationNumber}), 0)`,
              })
              .from(journalEntries)
              .where(eq(journalEntries.fiscalPeriodId, period.id));

            const nextVerifNumber = (maxVerifResult[0]?.maxNum || 0) + 1;

            const [entry] = await ctx.db
              .insert(journalEntries)
              .values({
                workspaceId: ctx.workspaceId,
                fiscalPeriodId: period.id,
                verificationNumber: nextVerifNumber,
                entryDate: existing.invoiceDate,
                description: `Faktura #${existing.invoiceNumber} - ${existing.customer.name}`,
                entryType: "inkomst",
                sourceType: "invoice_sent",
                createdBy: ctx.session!.session.userId,
              })
              .returning();

            sentJournalEntryId = entry.id;

            const entryLines: Array<{
              journalEntryId: string;
              accountNumber: number;
              accountName: string;
              debit: string | null;
              credit: string | null;
              description: string;
              sortOrder: number;
            }> = [];

            let sortOrder = 0;

            entryLines.push({
              journalEntryId: entry.id,
              accountNumber: 1510,
              accountName: "Kundfordringar",
              debit: breakdown.totalInclVat.toFixed(2),
              credit: null,
              description: `Faktura #${existing.invoiceNumber}`,
              sortOrder: sortOrder++,
            });

            if (breakdown.serviceAmount > 0) {
              entryLines.push({
                journalEntryId: entry.id,
                accountNumber: 3010,
                accountName: "Försäljning tjänster",
                debit: null,
                credit: breakdown.serviceAmount.toFixed(2),
                description: "Tjänster",
                sortOrder: sortOrder++,
              });
            }

            if (breakdown.goodsAmount > 0) {
              entryLines.push({
                journalEntryId: entry.id,
                accountNumber: 3040,
                accountName: "Försäljning varor",
                debit: null,
                credit: breakdown.goodsAmount.toFixed(2),
                description: "Varor",
                sortOrder: sortOrder++,
              });
            }

            if (breakdown.vat25 > 0) {
              entryLines.push({
                journalEntryId: entry.id,
                accountNumber: 2610,
                accountName: "Utgående moms 25%",
                debit: null,
                credit: breakdown.vat25.toFixed(2),
                description: "Moms 25%",
                sortOrder: sortOrder++,
              });
            }

            if (breakdown.vat12 > 0) {
              entryLines.push({
                journalEntryId: entry.id,
                accountNumber: 2620,
                accountName: "Utgående moms 12%",
                debit: null,
                credit: breakdown.vat12.toFixed(2),
                description: "Moms 12%",
                sortOrder: sortOrder++,
              });
            }

            if (breakdown.vat6 > 0) {
              entryLines.push({
                journalEntryId: entry.id,
                accountNumber: 2630,
                accountName: "Utgående moms 6%",
                debit: null,
                credit: breakdown.vat6.toFixed(2),
                description: "Moms 6%",
                sortOrder: sortOrder++,
              });
            }

            await ctx.db.insert(journalEntryLines).values(entryLines);
          }
        }
      }

      const invoiceUrl = input.sendMethod === "link" && shareToken
        ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/faktura/${existing.id}?token=${shareToken}`
        : undefined;

      try {
        if (input.sendMethod === "pdf") {
          await sendInvoiceEmailWithPdf({
            to: input.email,
            invoice: existing,
            customer: existing.customer,
            workspace,
            invoiceLines: existing.lines.map((line) => ({
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              vatRate: line.vatRate,
              amount: line.amount,
            })),
          });
        } else {
          await sendInvoiceEmailWithLink({
            to: input.email,
            invoice: existing,
            customer: existing.customer,
            workspace,
            invoiceLines: existing.lines.map((line) => ({
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              vatRate: line.vatRate,
              amount: line.amount,
            })),
            invoiceUrl,
          });
        }
      } catch (error) {
        console.error("[Invoice sendInvoice] Email sending failed", {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          invoiceId: input.id,
          invoiceNumber: existing.invoiceNumber,
          workspaceId: ctx.workspaceId,
          sendMethod: input.sendMethod,
          recipientEmail: input.email,
          timestamp: new Date().toISOString(),
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Kunde inte skicka e-post",
        });
      }

        const [updated] = await ctx.db
          .update(invoices)
          .set({
            status: "sent",
            sentAt: new Date(),
            sentMethod: input.sendMethod === "pdf" ? "email_pdf" : "email_link",
            shareToken,
            sentJournalEntryId,
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, input.id))
          .returning();

        return updated;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[Invoice sendInvoice] Unexpected error", {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          invoiceId: input.id,
          workspaceId: ctx.workspaceId,
          sendMethod: input.sendMethod,
          recipientEmail: input.email,
          timestamp: new Date().toISOString(),
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ett oväntat fel uppstod vid skickande av faktura",
        });
      }
    }),

  getByToken: publicProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        token: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const invoice = await ctx.db.query.invoices.findFirst({
          where: and(
            eq(invoices.id, input.invoiceId),
            eq(invoices.shareToken, input.token)
          ),
          with: {
            customer: true,
            lines: {
              orderBy: (l, { asc }) => [asc(l.sortOrder)],
              with: {
                product: true,
              },
            },
            workspace: {
              columns: {
                id: true,
                name: true,
                orgName: true,
                orgNumber: true,
                address: true,
                postalCode: true,
                city: true,
                contactEmail: true,
                contactPhone: true,
                bankgiro: true,
                plusgiro: true,
                iban: true,
                bic: true,
                swishNumber: true,
                invoiceNotes: true,
              },
            },
          },
        });

        if (!invoice) {
          console.error("[Invoice getByToken] Invoice not found", {
            invoiceId: input.invoiceId,
            token: input.token.substring(0, 8) + "...",
            timestamp: new Date().toISOString(),
          });
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return invoice;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[Invoice getByToken] Database error", {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          invoiceId: input.invoiceId,
          token: input.token.substring(0, 8) + "...",
          timestamp: new Date().toISOString(),
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kunde inte hämta faktura",
        });
      }
    }),

  trackOpen: publicProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        token: z.string(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        referer: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const invoice = await ctx.db.query.invoices.findFirst({
          where: and(
            eq(invoices.id, input.invoiceId),
            eq(invoices.shareToken, input.token)
          ),
        });

        if (!invoice) {
          console.error("[Invoice trackOpen] Invoice not found", {
            invoiceId: input.invoiceId,
            token: input.token.substring(0, 8) + "...",
            ipAddress: input.ipAddress,
            timestamp: new Date().toISOString(),
          });
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const now = new Date();
        const isFirstOpen = !invoice.openedAt;

        // Insert log entry first
        await ctx.db.insert(invoiceOpenLogs).values({
          invoiceId: input.invoiceId,
          ipAddress: input.ipAddress || null,
          userAgent: input.userAgent || null,
          referer: input.referer || null,
        });

        // Update invoice counters atomically to avoid race conditions
        await ctx.db
          .update(invoices)
          .set({
            openedAt: isFirstOpen ? now : invoice.openedAt,
            openedCount: sql`${invoices.openedCount} + 1`, // Use SQL increment to avoid race conditions
            lastOpenedAt: now,
            updatedAt: now,
          })
          .where(eq(invoices.id, input.invoiceId));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[Invoice trackOpen] Database error", {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          invoiceId: input.invoiceId,
          token: input.token.substring(0, 8) + "...",
          ipAddress: input.ipAddress,
          timestamp: new Date().toISOString(),
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kunde inte spåra öppning",
        });
      }
    }),

  // List overdue invoices (sent but past due date)
  listOverdue: workspaceProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const today = new Date().toISOString().split("T")[0];

      const overdueInvoices = await ctx.db.query.invoices.findMany({
        where: and(
          eq(invoices.workspaceId, ctx.workspaceId),
          eq(invoices.status, "sent"),
          lt(invoices.dueDate, today)
        ),
        with: {
          customer: true,
          lines: {
            orderBy: (l, { asc }) => [asc(l.sortOrder)],
          },
        },
        orderBy: [asc(invoices.dueDate)],
        limit: input.limit,
      });

      // Calculate days overdue for each invoice
      return overdueInvoices.map((invoice) => {
        const dueDate = new Date(invoice.dueDate);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - dueDate.getTime();
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...invoice,
          daysOverdue,
        };
      });
    }),

  // Send payment reminder for overdue invoice
  sendReminder: workspaceProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        email: z.string().email().optional(),
        customMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const today = new Date().toISOString().split("T")[0];

      // Get the invoice with customer and lines
      const invoice = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.workspaceId, ctx.workspaceId)
        ),
        with: {
          customer: true,
          lines: {
            orderBy: (l, { asc }) => [asc(l.sortOrder)],
          },
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Fakturan hittades inte" });
      }

      // Verify invoice is sent (not draft or paid)
      if (invoice.status !== "sent") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: invoice.status === "draft"
            ? "Fakturan måste skickas innan en påminnelse kan skickas"
            : "Fakturan är redan betald",
        });
      }

      // Verify invoice is overdue
      if (invoice.dueDate >= today) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Fakturan är inte förfallen ännu",
        });
      }

      // Calculate days overdue
      const dueDate = new Date(invoice.dueDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - dueDate.getTime();
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Determine recipient email
      const recipientEmail = input.email || invoice.customer.email;
      if (!recipientEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ingen e-postadress angiven och kunden har ingen registrerad e-post",
        });
      }

      // Get workspace info
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, ctx.workspaceId),
      });

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Arbetsyta hittades inte" });
      }

      // Calculate new reminder number
      const newReminderCount = invoice.reminderCount + 1;

      // Send the reminder email
      try {
        await sendReminderEmailWithPdf({
          to: recipientEmail,
          invoice,
          customer: invoice.customer,
          workspace,
          invoiceLines: invoice.lines.map((line) => ({
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            vatRate: line.vatRate,
            amount: line.amount,
          })),
          daysOverdue,
          reminderNumber: newReminderCount,
          customMessage: input.customMessage,
        });
      } catch (error) {
        console.error("[Invoice sendReminder] Email sending failed", {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          invoiceId: input.invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          workspaceId: ctx.workspaceId,
          recipientEmail,
          timestamp: new Date().toISOString(),
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Kunde inte skicka påminnelse",
        });
      }

      // Update invoice with reminder tracking
      const now = new Date();
      const [updated] = await ctx.db
        .update(invoices)
        .set({
          reminderCount: newReminderCount,
          lastReminderSentAt: now,
          emailSentCount: sql`${invoices.emailSentCount} + 1`,
          updatedAt: now,
        })
        .where(eq(invoices.id, input.invoiceId))
        .returning();

      return {
        success: true,
        invoice: updated,
        reminderNumber: newReminderCount,
        daysOverdue,
        sentTo: recipientEmail,
      };
    }),
});
