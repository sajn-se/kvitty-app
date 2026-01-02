import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, workspaceProcedure } from "../init";
import { employees, payrollEntries, payrollRuns } from "@/lib/db/schema";
import { eq, and, like, sql } from "drizzle-orm";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "@/lib/validations/employee";
import { encrypt, decrypt } from "@/lib/utils/encryption";

export const employeesRouter = router({
  list: workspaceProcedure
    .input(
      z.object({
        includeInactive: z.boolean().optional().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const employeeList = await ctx.db.query.employees.findMany({
        where: input.includeInactive
          ? eq(employees.workspaceId, ctx.workspaceId)
          : and(
              eq(employees.workspaceId, ctx.workspaceId),
              eq(employees.isActive, true)
            ),
        orderBy: (emp, { asc }) => [asc(emp.lastName), asc(emp.firstName)],
      });

      return employeeList.map((emp) => ({
        ...emp,
        personalNumber: decrypt(emp.personalNumber),
      }));
    }),

  get: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const employee = await ctx.db.query.employees.findFirst({
        where: and(
          eq(employees.id, input.id),
          eq(employees.workspaceId, ctx.workspaceId)
        ),
        with: {
          payrollEntries: {
            orderBy: (entries, { desc }) => [desc(entries.createdAt)],
            limit: 10,
            with: {
              payrollRun: true,
            },
          },
        },
      });

      if (!employee) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        ...employee,
        personalNumber: decrypt(employee.personalNumber),
      };
    }),

  create: workspaceProcedure
    .input(createEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      // Check employee limit (max 25 active employees)
      const activeEmployeeCount = await ctx.db.query.employees.findMany({
        where: and(
          eq(employees.workspaceId, ctx.workspaceId),
          eq(employees.isActive, true)
        ),
      });

      if (activeEmployeeCount.length >= 25) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Maximalt 25 anställda tillåtna",
        });
      }

      // Normalize personal number to 12 digits
      let personalNumber = input.personalNumber.replace(/\D/g, "");
      if (personalNumber.length === 10) {
        const yearPart = parseInt(personalNumber.substring(0, 2), 10);
        const currentYear = new Date().getFullYear();
        const currentCentury = Math.floor(currentYear / 100);
        if (yearPart + currentCentury * 100 > currentYear) {
          personalNumber = `${currentCentury - 1}${personalNumber}`;
        } else {
          personalNumber = `${currentCentury}${personalNumber}`;
        }
      }

      // Check for duplicate personal number
      // Since we can't compare encrypted values directly, we need to decrypt all employees
      const allEmployees = await ctx.db.query.employees.findMany({
        where: eq(employees.workspaceId, ctx.workspaceId),
      });

      const duplicate = allEmployees.find((emp) => {
        const decrypted = decrypt(emp.personalNumber);
        return decrypted === personalNumber;
      });

      if (duplicate) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "En anställd med detta personnummer finns redan",
        });
      }

      const [employee] = await ctx.db
        .insert(employees)
        .values({
          workspaceId: ctx.workspaceId,
          personalNumber: encrypt(personalNumber),
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email || null,
          phone: input.phone || null,
          address: input.address || null,
          postalCode: input.postalCode || null,
          city: input.city || null,
          employmentStartDate: input.employmentStartDate || null,
          taxTable: input.taxTable || null,
          taxColumn: input.taxColumn || null,
        })
        .returning();

      return {
        ...employee,
        personalNumber: decrypt(employee.personalNumber),
      };
    }),

  update: workspaceProcedure
    .input(updateEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const employee = await ctx.db.query.employees.findFirst({
        where: and(
          eq(employees.id, input.id),
          eq(employees.workspaceId, ctx.workspaceId)
        ),
      });

      if (!employee) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [updated] = await ctx.db
        .update(employees)
        .set({
          ...(input.firstName && { firstName: input.firstName }),
          ...(input.lastName && { lastName: input.lastName }),
          ...(input.email !== undefined && { email: input.email || null }),
          ...(input.phone !== undefined && { phone: input.phone || null }),
          ...(input.address !== undefined && { address: input.address || null }),
          ...(input.postalCode !== undefined && { postalCode: input.postalCode || null }),
          ...(input.city !== undefined && { city: input.city || null }),
          ...(input.employmentStartDate !== undefined && {
            employmentStartDate: input.employmentStartDate || null,
          }),
          ...(input.employmentEndDate !== undefined && {
            employmentEndDate: input.employmentEndDate || null,
          }),
          ...(input.taxTable !== undefined && { taxTable: input.taxTable || null }),
          ...(input.taxColumn !== undefined && { taxColumn: input.taxColumn || null }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
          updatedAt: new Date(),
        })
        .where(eq(employees.id, input.id))
        .returning();

      return {
        ...updated,
        personalNumber: decrypt(updated.personalNumber),
      };
    }),

  archive: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const employee = await ctx.db.query.employees.findFirst({
        where: and(
          eq(employees.id, input.id),
          eq(employees.workspaceId, ctx.workspaceId)
        ),
      });

      if (!employee) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [updated] = await ctx.db
        .update(employees)
        .set({
          isActive: false,
          employmentEndDate: new Date().toISOString().split("T")[0],
          updatedAt: new Date(),
        })
        .where(eq(employees.id, input.id))
        .returning();

      return {
        ...updated,
        personalNumber: decrypt(updated.personalNumber),
      };
    }),

  getPayrollEntries: workspaceProcedure
    .input(
      z.object({
        employeeId: z.string(),
        year: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const employee = await ctx.db.query.employees.findFirst({
        where: and(
          eq(employees.id, input.employeeId),
          eq(employees.workspaceId, ctx.workspaceId)
        ),
      });

      if (!employee) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const allEntries = await ctx.db.query.payrollEntries.findMany({
        where: eq(payrollEntries.employeeId, input.employeeId),
        with: {
          payrollRun: {
            with: {
              fiscalPeriod: true,
            },
          },
        },
      });

      const sortedEntries = allEntries.sort((a, b) => {
        const periodCompare = b.payrollRun.period.localeCompare(a.payrollRun.period);
        if (periodCompare !== 0) return periodCompare;
        return b.payrollRun.runNumber - a.payrollRun.runNumber;
      });

      if (input.year) {
        return sortedEntries.filter((entry) =>
          entry.payrollRun.period.startsWith(input.year!)
        );
      }

      return sortedEntries;
    }),

  getPayrollStats: workspaceProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const employee = await ctx.db.query.employees.findFirst({
        where: and(
          eq(employees.id, input.employeeId),
          eq(employees.workspaceId, ctx.workspaceId)
        ),
      });

      if (!employee) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const stats = await ctx.db
        .select({
          year: sql<string>`SUBSTRING(${payrollRuns.period}, 1, 4)`,
          totalGross: sql<string>`COALESCE(SUM(${payrollEntries.grossSalary}), 0)`,
          totalNet: sql<string>`COALESCE(SUM(${payrollEntries.netSalary}), 0)`,
          totalTax: sql<string>`COALESCE(SUM(${payrollEntries.taxDeduction}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(payrollEntries)
        .innerJoin(payrollRuns, eq(payrollEntries.payrollRunId, payrollRuns.id))
        .where(eq(payrollEntries.employeeId, input.employeeId))
        .groupBy(sql`SUBSTRING(${payrollRuns.period}, 1, 4)`)
        .orderBy(sql`SUBSTRING(${payrollRuns.period}, 1, 4) DESC`);

      return stats;
    }),
});
