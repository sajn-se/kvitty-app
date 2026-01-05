import { config } from "dotenv";
import { resolve } from "path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/db/schema";
import { encrypt } from "@/lib/utils/encryption";
import { defaultBankAccounts } from "@/lib/consts/default-bank-accounts";
import {
  calculateEmployerContributions,
  extractBirthYear,
} from "@/lib/consts/employer-contribution-rates";
import { createCuid } from "@/lib/utils/cuid";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

// Verify required environment variables
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  process.exit(1);
}

if (!process.env.ENCRYPTION_KEY) {
  console.error("❌ ENCRYPTION_KEY environment variable is not set!");
  process.exit(1);
}

// Create database connection after env vars are loaded
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

const USER_ID = "GILHLarOWoU4HYcwBRkN4y3EVj8dUklo";

// Check for workspace ID argument
const WORKSPACE_ID = process.argv[2];

// ============================================
// Swedish Data Constants
// ============================================

// Generate random 4-character slug
function generateRandomSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 4; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

const DEMO_WORKSPACE = {
  name: "Demo Företag AB",
  slug: generateRandomSlug(),
  mode: "full_bookkeeping" as const,
  businessType: "aktiebolag" as const,
  orgNumber: "556123-4567",
  orgName: "Demo Företag AB",
  contactName: "Anna Karlsson",
  contactPhone: "08-123 456 78",
  contactEmail: "info@demoforetag.se",
  address: "Drottninggatan 95A",
  postalCode: "11360",
  city: "Stockholm",
  bankgiro: "123-4567",
  plusgiro: "12 34 56-7",
  iban: "SE35 5000 0000 0549 1000 0003",
  bic: "ESSESESS",
  paymentTermsDays: 30,
  invoiceNotes: "Betalning sker till bankgiro 123-4567. Vänligen ange fakturanummer som referens.",
  // Invoice defaults
  deliveryTerms: "Fritt vårt lager, Stockholm",
  latePaymentInterest: "12.00",
  defaultPaymentMethod: "bankgiro",
  addOcrNumber: true,
};

const DEMO_CUSTOMERS = [
  {
    name: "Nordisk Handel AB",
    contactPerson: "Lars Nordström",
    orgNumber: "556234-5678",
    email: "lars@nordiskhandel.se",
    phone: "08-234 567 89",
    address: "Sveavägen 123",
    postalCode: "11349",
    city: "Stockholm",
    preferredDeliveryMethod: "email_pdf" as const,
  },
  {
    name: "Västra Konsult HB",
    contactPerson: "Maria Andersson",
    orgNumber: "916345-6789",
    email: "maria@vastrakonsult.se",
    phone: "031-345 678 90",
    address: "Kungsportsavenyn 45",
    postalCode: "41136",
    city: "Göteborg",
    preferredDeliveryMethod: "email_link" as const,
  },
  {
    name: "Sydkust Design AB",
    contactPerson: "Erik Malmberg",
    orgNumber: "556456-7890",
    email: "erik@sydkustdesign.se",
    phone: "040-456 789 01",
    address: "Stortorget 12",
    postalCode: "21143",
    city: "Malmö",
    preferredDeliveryMethod: "e_invoice" as const,
    einvoiceAddress: "0007:5564567890",
  },
  {
    name: "Mellansverige IT AB",
    contactPerson: "Sofia Uppström",
    orgNumber: "556567-8901",
    email: "sofia@mellansverigeIT.se",
    phone: "018-567 890 12",
    address: "Sankt Olofsgatan 7",
    postalCode: "75310",
    city: "Uppsala",
    preferredDeliveryMethod: "email_pdf" as const,
  },
  {
    name: "Norrland Services AB",
    contactPerson: "Johan Norberg",
    orgNumber: "556678-9012",
    email: "johan@norrlandservices.se",
    phone: "090-678 901 23",
    address: "Storgatan 56",
    postalCode: "90327",
    city: "Umeå",
    preferredDeliveryMethod: "manual" as const,
  },
];

const DEMO_PRODUCTS = [
  {
    name: "Webbutveckling",
    description: "Utveckling av webbapplikationer och hemsidor",
    type: "T" as const,
    unit: "timmar" as const,
    unitPrice: "950.00",
    vatRate: 25,
    defaultQuantity: "8",
  },
  {
    name: "Konsulttjänst",
    description: "Allmän konsultation och rådgivning",
    type: "T" as const,
    unit: "timmar" as const,
    unitPrice: "1200.00",
    vatRate: 25,
    defaultQuantity: "4",
  },
  {
    name: "Månadsprenumeration",
    description: "Månatlig prenumeration på tjänster",
    type: "T" as const,
    unit: "manader" as const,
    unitPrice: "2500.00",
    vatRate: 25,
    defaultQuantity: "1",
  },
  {
    name: "Digital Licens",
    description: "Licens för digital programvara",
    type: "V" as const,
    unit: "styck" as const,
    unitPrice: "5000.00",
    vatRate: 25,
    defaultQuantity: "1",
  },
  {
    name: "Utbildning",
    description: "Utbildning och kurser",
    type: "T" as const,
    unit: "dagar" as const,
    unitPrice: "4500.00",
    vatRate: 6, // Reduced VAT for education
    defaultQuantity: "1",
  },
  {
    name: "Böcker",
    description: "Trycksaker och böcker",
    type: "V" as const,
    unit: "styck" as const,
    unitPrice: "350.00",
    vatRate: 6, // Reduced VAT for books
    defaultQuantity: "5",
  },
  {
    name: "Livsmedel",
    description: "Livsmedelsvaror",
    type: "V" as const,
    unit: "kilogram" as const,
    unitPrice: "120.00",
    vatRate: 12, // Reduced VAT for food
    defaultQuantity: "10",
  },
  {
    name: "Export Service",
    description: "Tjänster för export (momsfritt)",
    type: "T" as const,
    unit: "timmar" as const,
    unitPrice: "850.00",
    vatRate: 0, // No VAT for export
    defaultQuantity: "10",
  },
];

const DEMO_EMPLOYEES = [
  {
    personalNumber: "199001155678",
    firstName: "Anna",
    lastName: "Andersson",
    email: "anna.andersson@demoforetag.se",
    phone: "070-123 456 78",
    address: "Vasagatan 12",
    postalCode: "11120",
    city: "Stockholm",
    employmentStartDate: "2023-01-15",
    taxTable: 30,
    taxColumn: 1,
    monthlySalary: 35000,
  },
  {
    personalNumber: "198506207890",
    firstName: "Erik",
    lastName: "Eriksson",
    email: "erik.eriksson@demoforetag.se",
    phone: "070-234 567 89",
    address: "Kungsgatan 45",
    postalCode: "11356",
    city: "Stockholm",
    employmentStartDate: "2022-03-01",
    taxTable: 30,
    taxColumn: 1,
    monthlySalary: 42000,
  },
  {
    personalNumber: "197803128901",
    firstName: "Maria",
    lastName: "Svensson",
    email: "maria.svensson@demoforetag.se",
    phone: "070-345 678 90",
    address: "Birger Jarlsgatan 23",
    postalCode: "11434",
    city: "Stockholm",
    employmentStartDate: "2021-06-01",
    taxTable: 30,
    taxColumn: 2,
    monthlySalary: 38000,
  },
];

// ============================================
// Validation Helpers
// ============================================

function validateJournalEntryBalance(
  lines: Array<{ debit?: string; credit?: string }>
): boolean {
  const totalDebit = lines.reduce(
    (sum, l) => sum + (l.debit ? parseFloat(l.debit) : 0),
    0
  );
  const totalCredit = lines.reduce(
    (sum, l) => sum + (l.credit ? parseFloat(l.credit) : 0),
    0
  );
  return Math.abs(totalDebit - totalCredit) < 0.01;
}

function calculateInvoiceTotals(
  lines: Array<{ quantity: string; unitPrice: string; vatRate: number }>
): { subtotal: string; vatAmount: string; total: string } {
  let subtotal = 0;
  let vatAmount = 0;

  for (const line of lines) {
    const lineAmount = parseFloat(line.quantity) * parseFloat(line.unitPrice);
    subtotal += lineAmount;
    vatAmount += lineAmount * (line.vatRate / 100);
  }

  return {
    subtotal: subtotal.toFixed(2),
    vatAmount: vatAmount.toFixed(2),
    total: (subtotal + vatAmount).toFixed(2),
  };
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// Generate OCR number with Luhn check digit
function generateOcrNumber(invoiceNumber: number): string {
  const base = invoiceNumber.toString().padStart(9, '0');
  const digits = base.split('').reverse();
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = parseInt(digits[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return `${base}${checkDigit}`;
}

// ============================================
// Entity Generators
// ============================================

async function createWorkspace(userId: string) {
  console.log("  Creating workspace...");
  const [workspace] = await db
    .insert(schema.workspaces)
    .values({
      ...DEMO_WORKSPACE,
      createdBy: userId,
    })
    .returning();

  console.log(`  ✓ Workspace created: ${workspace.name} (${workspace.slug})`);
  return workspace;
}

async function createWorkspaceMember(workspaceId: string, userId: string) {
  console.log("  Adding user to workspace...");
  const [member] = await db
    .insert(schema.workspaceMembers)
    .values({
      workspaceId,
      userId,
    })
    .returning();

  console.log(`  ✓ User added to workspace`);
  return member;
}

async function createFiscalPeriods(workspaceId: string) {
  console.log("  Creating fiscal periods...");
  const periods = await db
    .insert(schema.fiscalPeriods)
    .values([
      {
        workspaceId,
        label: "Räkenskapsår 2025",
        urlSlug: "2025",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        fiscalYearType: "calendar",
      },
      {
        workspaceId,
        label: "Räkenskapsår 2026",
        urlSlug: "2026",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        fiscalYearType: "calendar",
      },
    ])
    .returning();

  console.log(`  ✓ Created ${periods.length} fiscal periods`);
  return periods;
}

async function createBankAccounts(workspaceId: string) {
  console.log("  Creating bank accounts...");
  const accounts = await db
    .insert(schema.bankAccounts)
    .values(
      defaultBankAccounts.map((account) => ({
        workspaceId,
        accountNumber: account.accountNumber,
        name: account.name,
        description: account.description,
        isDefault: account.isDefault,
        sortOrder: account.sortOrder,
      }))
    )
    .returning();

  console.log(`  ✓ Created ${accounts.length} bank accounts`);
  return accounts;
}

async function createCustomers(workspaceId: string) {
  console.log("  Creating customers...");
  const customers = await db
    .insert(schema.customers)
    .values(
      DEMO_CUSTOMERS.map((customer) => ({
        workspaceId,
        ...customer,
      }))
    )
    .returning();

  console.log(`  ✓ Created ${customers.length} customers`);
  return customers;
}

async function createProducts(workspaceId: string) {
  console.log("  Creating products...");
  const products = await db
    .insert(schema.products)
    .values(
      DEMO_PRODUCTS.map((product) => ({
        workspaceId,
        ...product,
      }))
    )
    .returning();

  console.log(`  ✓ Created ${products.length} products`);
  return products;
}

async function createEmployees(workspaceId: string, userId: string) {
  console.log("  Creating employees (with encryption)...");
  const employees = await db
    .insert(schema.employees)
    .values(
      DEMO_EMPLOYEES.map((employee) => ({
        workspaceId,
        personalNumber: encrypt(employee.personalNumber),
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        postalCode: employee.postalCode,
        city: employee.city,
        employmentStartDate: employee.employmentStartDate,
        taxTable: employee.taxTable,
        taxColumn: employee.taxColumn,
        isActive: true,
      }))
    )
    .returning();

  console.log(`  ✓ Created ${employees.length} employees`);
  return employees;
}

async function createInvoices(
  workspaceId: string,
  period2025Id: string,
  period2026Id: string,
  customers: typeof schema.customers.$inferSelect[],
  products: typeof schema.products.$inferSelect[]
) {
  console.log("  Creating invoices with lines...");

  // Generate 120 invoices spread across 2025 and early 2026
  const invoiceDates: Date[] = [];
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2026-01-15");

  // Generate dates throughout the period
  for (let i = 0; i < 120; i++) {
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    invoiceDates.push(new Date(randomTime));
  }

  // Sort by date
  invoiceDates.sort((a, b) => a.getTime() - b.getTime());

  const invoices: any[] = [];
  let invoiceNumber = 1001;

  for (let i = 0; i < invoiceDates.length; i++) {
    const invoiceDate = invoiceDates[i];
    const dueDate = addDays(invoiceDate, 30);
    const customer = customers[i % customers.length];
    const fiscalPeriodId = invoiceDate.getFullYear() === 2025 ? period2025Id : period2026Id;

    // Determine status based on date and index
    let status: "draft" | "sent" | "paid" = "paid";
    let sentAt: Date | null = null;
    let paidDate: string | null = null;
    let paidAmount: string | null = null;

    // Last 5 invoices: draft
    if (i >= invoiceDates.length - 5) {
      status = "draft";
    }
    // Next 10: sent but not paid
    else if (i >= invoiceDates.length - 15) {
      status = "sent";
      sentAt = addDays(invoiceDate, 1);
    }
    // Rest: paid
    else {
      status = "paid";
      sentAt = addDays(invoiceDate, 1);
      paidDate = formatDate(addDays(dueDate, Math.floor(Math.random() * 10) - 5)); // Paid -5 to +5 days from due
    }

    // Create 1-3 invoice lines
    const numLines = Math.floor(Math.random() * 3) + 1;
    const lines: any[] = [];

    for (let j = 0; j < numLines; j++) {
      const product = products[(i + j) % products.length];
      const quantity = j === 0 ? parseFloat(product.defaultQuantity) : Math.floor(Math.random() * 5) + 1;
      const lineAmount = quantity * parseFloat(product.unitPrice);

      lines.push({
        productId: product.id,
        lineType: "product",
        description: product.name,
        quantity: quantity.toString(),
        unit: product.unit,
        unitPrice: product.unitPrice,
        vatRate: product.vatRate,
        productType: product.type,
        amount: lineAmount.toFixed(2),
        sortOrder: j,
      });
    }

    // Calculate totals
    const totals = calculateInvoiceTotals(lines);
    if (status === "paid") {
      paidAmount = totals.total;
    }

    // Generate OCR number for this invoice
    const ocrNumber = generateOcrNumber(invoiceNumber);

    // Add some variety to settings (some invoices override workspace defaults)
    const hasCustomSettings = i % 10 === 0; // Every 10th invoice has custom settings
    const customDeliveryTerms = hasCustomSettings && i % 20 === 0 ? "Fritt levererat" : null;
    const customPaymentTermsDays = hasCustomSettings && i % 15 === 0 ? 14 : null;

    // Create invoice
    const [invoice] = await db
      .insert(schema.invoices)
      .values({
        workspaceId,
        fiscalPeriodId,
        customerId: customer.id,
        invoiceNumber: invoiceNumber++,
        invoiceDate: formatDate(invoiceDate),
        dueDate: formatDate(dueDate),
        subtotal: totals.subtotal,
        vatAmount: totals.vatAmount,
        total: totals.total,
        status,
        sentAt,
        sentMethod: sentAt ? "email_pdf" : null,
        paidDate,
        paidAmount,
        // New invoice settings fields
        ocrNumber,
        deliveryTerms: customDeliveryTerms,
        paymentTermsDays: customPaymentTermsDays,
        paymentMethod: i % 30 === 0 ? "swish" : null, // Occasional Swish payment
        paymentAccount: i % 30 === 0 ? "123 456 78 90" : null,
        deliveryMethod: customer.preferredDeliveryMethod || null,
      })
      .returning();

    // Create invoice lines
    await db.insert(schema.invoiceLines).values(
      lines.map((line) => ({
        invoiceId: invoice.id,
        ...line,
      }))
    );

    invoices.push(invoice);
  }

  console.log(`  ✓ Created ${invoices.length} invoices with lines`);
  return invoices;
}

async function createPayrollRuns(
  workspaceId: string,
  period2025Id: string,
  period2026Id: string,
  employees: typeof schema.employees.$inferSelect[],
  userId: string
) {
  console.log("  Creating payroll runs with entries...");

  // All months of 2025 + Jan 2026
  const periods = [
    "202501", "202502", "202503", "202504", "202505", "202506",
    "202507", "202508", "202509", "202510", "202511", "202512",
    "202601"
  ];

  const payrollRuns: any[] = [];

  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    const year = parseInt(period.substring(0, 4));
    const month = parseInt(period.substring(4, 6));
    const paymentDate = new Date(year, month - 1, 25); // 25th of each month

    // Determine status
    let status: "draft" | "calculated" | "approved" | "paid" | "reported" = "reported";
    if (i === 12) {
      // Jan 2026
      status = "calculated";
    } else if (i >= 10) {
      // Nov-Dec 2025
      status = "paid";
    }

    // Calculate AGI deadline (12th of next month)
    const agiDeadlineDate = new Date(year, month, 12);
    const agiDeadline = formatDate(agiDeadlineDate);

    // Create payroll run
    const [payrollRun] = await db
      .insert(schema.payrollRuns)
      .values({
        workspaceId,
        period,
        runNumber: 1,
        paymentDate: formatDate(paymentDate),
        status,
        agiDeadline,
        createdBy: userId,
      })
      .returning();

    // Create payroll entries for each employee
    const payrollEntries: any[] = [];
    let totalGrossSalary = 0;
    let totalTaxDeduction = 0;
    let totalEmployerContributions = 0;
    let totalNetSalary = 0;

    for (let j = 0; j < employees.length; j++) {
      const employee = employees[j];
      const employeeData = DEMO_EMPLOYEES[j];
      const grossSalary = employeeData.monthlySalary;

      // Calculate tax deduction (simplified to ~30%)
      const taxDeduction = Math.round(grossSalary * 0.30);

      // Calculate employer contributions based on birth year
      const birthYear = extractBirthYear(employeeData.personalNumber);
      const employerContributions = calculateEmployerContributions(grossSalary, birthYear);

      // Calculate net salary
      const netSalary = grossSalary - taxDeduction;

      totalGrossSalary += grossSalary;
      totalTaxDeduction += taxDeduction;
      totalEmployerContributions += employerContributions;
      totalNetSalary += netSalary;

      payrollEntries.push({
        payrollRunId: payrollRun.id,
        employeeId: employee.id,
        grossSalary: grossSalary.toFixed(2),
        taxDeduction: taxDeduction.toFixed(2),
        employerContributions: employerContributions.toFixed(2),
        netSalary: netSalary.toFixed(2),
        specificationNumber: j + 1,
      });
    }

    // Insert payroll entries
    await db.insert(schema.payrollEntries).values(payrollEntries);

    // Update payroll run with totals
    await db
      .update(schema.payrollRuns)
      .set({
        totalGrossSalary: totalGrossSalary.toFixed(2),
        totalTaxDeduction: totalTaxDeduction.toFixed(2),
        totalEmployerContributions: totalEmployerContributions.toFixed(2),
        totalNetSalary: totalNetSalary.toFixed(2),
      })
      .where(eq(schema.payrollRuns.id, payrollRun.id));

    payrollRuns.push(payrollRun);
  }

  console.log(`  ✓ Created ${payrollRuns.length} payroll runs with entries`);
  return payrollRuns;
}

async function createJournalEntries(
  workspaceId: string,
  period2025Id: string,
  period2026Id: string,
  userId: string
) {
  console.log("  Creating journal entries with balanced lines...");

  const journalEntries: any[] = [];
  let verificationNumber2025 = 1;
  let verificationNumber2026 = 1;

  // Create 5 entries per month for 2025 + Jan 2026
  const months = [
    // 2025
    { year: 2025, month: 1, periodId: period2025Id },
    { year: 2025, month: 2, periodId: period2025Id },
    { year: 2025, month: 3, periodId: period2025Id },
    { year: 2025, month: 4, periodId: period2025Id },
    { year: 2025, month: 5, periodId: period2025Id },
    { year: 2025, month: 6, periodId: period2025Id },
    { year: 2025, month: 7, periodId: period2025Id },
    { year: 2025, month: 8, periodId: period2025Id },
    { year: 2025, month: 9, periodId: period2025Id },
    { year: 2025, month: 10, periodId: period2025Id },
    { year: 2025, month: 11, periodId: period2025Id },
    { year: 2025, month: 12, periodId: period2025Id },
    // 2026
    { year: 2026, month: 1, periodId: period2026Id },
  ];

  // Entry type templates
  const entryTemplates = [
    // 1. Expense with VAT (kvitto)
    {
      type: "kvitto" as const,
      description: "Inköp av kontorsmaterial",
      lines: [
        { accountNumber: 6250, accountName: "Kontorsmaterial", debit: "1000.00", credit: null },
        { accountNumber: 2641, accountName: "Ingående moms 25%", debit: "250.00", credit: null },
        { accountNumber: 1930, accountName: "Företagskonto", debit: null, credit: "1250.00" },
      ],
    },
    // 2. Customer payment (inkomst)
    {
      type: "inkomst" as const,
      description: "Betalning från kund",
      lines: [
        { accountNumber: 1930, accountName: "Företagskonto", debit: "15000.00", credit: null },
        { accountNumber: 1510, accountName: "Kundfordringar", debit: null, credit: "15000.00" },
      ],
    },
    // 3. Supplier invoice (leverantorsfaktura)
    {
      type: "leverantorsfaktura" as const,
      description: "Leverantörsfaktura - Förbrukningsinventarier",
      lines: [
        { accountNumber: 5410, accountName: "Förbrukningsinventarier", debit: "2000.00", credit: null },
        { accountNumber: 2641, accountName: "Ingående moms 25%", debit: "500.00", credit: null },
        { accountNumber: 2440, accountName: "Leverantörsskulder", debit: null, credit: "2500.00" },
      ],
    },
    // 4. Representation expense (kvitto)
    {
      type: "kvitto" as const,
      description: "Representation - Kundmöte",
      lines: [
        { accountNumber: 6540, accountName: "Representation", debit: "800.00", credit: null },
        { accountNumber: 2641, accountName: "Ingående moms 25%", debit: "200.00", credit: null },
        { accountNumber: 1930, accountName: "Företagskonto", debit: null, credit: "1000.00" },
      ],
    },
    // 5. Equipment purchase (kvitto)
    {
      type: "kvitto" as const,
      description: "Inköp av inventarier",
      lines: [
        { accountNumber: 5410, accountName: "Förbrukningsinventarier", debit: "3500.00", credit: null },
        { accountNumber: 2641, accountName: "Ingående moms 25%", debit: "875.00", credit: null },
        { accountNumber: 1930, accountName: "Företagskonto", debit: null, credit: "4375.00" },
      ],
    },
  ];

  for (const monthInfo of months) {
    const { year, month, periodId } = monthInfo;

    // Create 8-12 entries per month for variety (total ~120 entries)
    const entriesThisMonth = Math.floor(Math.random() * 5) + 8;
    for (let i = 0; i < entriesThisMonth; i++) {
      const template = entryTemplates[i % entryTemplates.length];
      const day = Math.floor(Math.random() * 28) + 1; // Random day 1-28
      const entryDate = new Date(year, month - 1, day);

      // Validate balance
      const balanceLines = template.lines.map((line) => ({
        debit: line.debit ?? undefined,
        credit: line.credit ?? undefined,
      }));
      if (!validateJournalEntryBalance(balanceLines)) {
        console.error(`  ⚠️  Warning: Entry template not balanced: ${template.description}`);
        continue;
      }

      // Create journal entry
      const [journalEntry] = await db
        .insert(schema.journalEntries)
        .values({
          workspaceId,
          fiscalPeriodId: periodId,
          verificationNumber: year === 2025 ? verificationNumber2025++ : verificationNumber2026++,
          entryDate: formatDate(entryDate),
          description: template.description,
          entryType: template.type,
          sourceType: "manual",
          createdBy: userId,
        })
        .returning();

      // Create journal entry lines
      await db.insert(schema.journalEntryLines).values(
        template.lines.map((line, index) => ({
          journalEntryId: journalEntry.id,
          accountNumber: line.accountNumber,
          accountName: line.accountName,
          debit: line.debit,
          credit: line.credit,
          sortOrder: index,
        }))
      );

      journalEntries.push(journalEntry);
    }
  }

  console.log(`  ✓ Created ${journalEntries.length} journal entries with balanced lines`);
  return journalEntries;
}

async function createBankTransactions(
  workspaceId: string,
  bankAccounts: typeof schema.bankAccounts.$inferSelect[],
  userId: string
) {
  console.log("  Creating bank transactions...");

  const transactions: any[] = [];
  const defaultAccount = bankAccounts.find((a) => a.isDefault) || bankAccounts[0];

  if (!defaultAccount) {
    console.log("  ⚠️  No bank account found, skipping bank transactions");
    return [];
  }

  // Swedish transaction references and descriptions
  const transactionTypes = [
    { reference: "BG 123-4567", amount: () => 5000 + Math.random() * 20000, description: "Kundbetalning" },
    { reference: "Swish", amount: () => 500 + Math.random() * 3000, description: "Swish-betalning" },
    { reference: "Autogiro", amount: () => -(800 + Math.random() * 2000), description: "Autogiro hyra" },
    { reference: "Leverantör", amount: () => -(1000 + Math.random() * 5000), description: "Leverantörsbetal." },
    { reference: "Lön", amount: () => -(25000 + Math.random() * 20000), description: "Löneutbetalning" },
    { reference: "Kort", amount: () => -(200 + Math.random() * 1500), description: "Kortbetalning" },
    { reference: "Bankgiro", amount: () => 3000 + Math.random() * 15000, description: "BG-inbetalning" },
    { reference: "ICA", amount: () => -(150 + Math.random() * 500), description: "ICA Kvantum" },
    { reference: "Circle K", amount: () => -(200 + Math.random() * 800), description: "Drivmedel" },
    { reference: "Telia", amount: () => -599, description: "Telefonabonnemang" },
    { reference: "Skatteverket", amount: () => -(5000 + Math.random() * 15000), description: "Moms & skatt" },
    { reference: "Elskling AB", amount: () => -(1200 + Math.random() * 2000), description: "El-kostnad" },
    { reference: "Telenor", amount: () => -399, description: "Bredband" },
    { reference: "IKEA", amount: () => -(500 + Math.random() * 3000), description: "Inventarier" },
    { reference: "Reklam", amount: () => -(2000 + Math.random() * 8000), description: "Google Ads" },
  ];

  // Generate 150 transactions spread across 2025 and early 2026
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2026-01-15");
  let currentBalance = 150000; // Starting balance

  const dates: Date[] = [];
  for (let i = 0; i < 150; i++) {
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    dates.push(new Date(randomTime));
  }
  dates.sort((a, b) => a.getTime() - b.getTime());

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const amount = Math.round(transactionType.amount() * 100) / 100;

    currentBalance += amount;

    // Determine status
    let status: "pending" | "matched" | "booked" | "ignored" = "booked";
    if (i >= dates.length - 5) {
      status = "pending";
    } else if (i >= dates.length - 10) {
      status = "matched";
    }

    const accountingDate = formatDate(date);
    const ledgerDate = formatDate(addDays(date, Math.random() > 0.5 ? 0 : 1));

    transactions.push({
      workspaceId,
      bankAccountId: defaultAccount.id,
      office: "Stockholm",
      accountingDate,
      ledgerDate,
      currencyDate: accountingDate,
      reference: `${transactionType.reference} ${date.getDate()}/${date.getMonth() + 1}`,
      amount: amount.toFixed(2),
      bookedBalance: currentBalance.toFixed(2),
      status,
      importedAt: new Date(),
      createdBy: userId,
    });
  }

  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.insert(schema.bankTransactions).values(batch);
  }

  console.log(`  ✓ Created ${transactions.length} bank transactions`);
  return transactions;
}

// ============================================
// Main Execution
// ============================================

async function main() {
  console.log("🚀 Populating demo data for Kvitty...\n");

  try {
    let workspace: typeof schema.workspaces.$inferSelect;

    // Phase 1: Foundation
    if (WORKSPACE_ID) {
      console.log(`📦 Phase 1: Loading existing workspace (${WORKSPACE_ID})...\n`);

      // Load existing workspace
      const [existingWorkspace] = await db
        .select()
        .from(schema.workspaces)
        .where(eq(schema.workspaces.id, WORKSPACE_ID))
        .limit(1);

      if (!existingWorkspace) {
        console.error(`❌ Workspace with ID '${WORKSPACE_ID}' not found!`);
        process.exit(1);
      }

      workspace = existingWorkspace;
      console.log(`  ✓ Workspace found: ${workspace.name} (${workspace.slug})`);

      // Check if user is already a member
      const [existingMember] = await db
        .select()
        .from(schema.workspaceMembers)
        .where(
          eq(schema.workspaceMembers.workspaceId, workspace.id)
        )
        .limit(1);

      if (!existingMember) {
        await createWorkspaceMember(workspace.id, USER_ID);
      } else {
        console.log(`  ✓ User is already a member of workspace`);
      }
    } else {
      console.log("📦 Phase 1: Creating new workspace...");
      workspace = await createWorkspace(USER_ID);
      await createWorkspaceMember(workspace.id, USER_ID);
    }

    // Get or create fiscal periods
    let periods = await db
      .select()
      .from(schema.fiscalPeriods)
      .where(eq(schema.fiscalPeriods.workspaceId, workspace.id));

    if (periods.length === 0) {
      periods = await createFiscalPeriods(workspace.id);
    } else {
      console.log(`  ✓ Using existing ${periods.length} fiscal period(s)`);
    }

    let period2025 = periods.find((p) => p.urlSlug === "2025");
    let period2026 = periods.find((p) => p.urlSlug === "2026");

    if (!period2025 || !period2026) {
      console.log("   Creating missing fiscal periods...");
      const newPeriods = await createFiscalPeriods(workspace.id);
      period2025 = newPeriods.find((p) => p.urlSlug === "2025") || period2025;
      period2026 = newPeriods.find((p) => p.urlSlug === "2026") || period2026;
      periods = [...periods, ...newPeriods];
    }

    if (!period2025 || !period2026) {
      console.error("❌ Failed to find or create fiscal periods for 2025 and 2026!");
      process.exit(1);
    }

    // Get or create bank accounts
    let bankAccountsList = await db
      .select()
      .from(schema.bankAccounts)
      .where(eq(schema.bankAccounts.workspaceId, workspace.id));

    if (bankAccountsList.length === 0) {
      bankAccountsList = await createBankAccounts(workspace.id);
    } else {
      console.log(`  ✓ Using existing ${bankAccountsList.length} bank account(s)`);
    }

    console.log("");

    // Phase 2: Master Data
    console.log("👥 Phase 2: Creating master data...");
    const customers = await createCustomers(workspace.id);
    const products = await createProducts(workspace.id);
    const employees = await createEmployees(workspace.id, USER_ID);
    console.log("");

    // Phase 3: Transactional Data
    console.log("💰 Phase 3: Creating transactional data...");
    const invoices = await createInvoices(
      workspace.id,
      period2025.id,
      period2026.id,
      customers,
      products
    );

    const payrollRuns = await createPayrollRuns(
      workspace.id,
      period2025.id,
      period2026.id,
      employees,
      USER_ID
    );

    const journalEntries = await createJournalEntries(
      workspace.id,
      period2025.id,
      period2026.id,
      USER_ID
    );

    const bankTransactions = await createBankTransactions(
      workspace.id,
      bankAccountsList,
      USER_ID
    );
    console.log("");

    // Summary
    console.log("✅ Demo data populated successfully!\n");
    console.log("📊 Summary:");
    console.log(`   Workspace: ${workspace.name} (${workspace.slug})`);
    console.log(`   Bank Accounts: ${bankAccountsList.length}`);
    console.log(`   Customers: ${customers.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Employees: ${employees.length}`);
    console.log(`   Invoices: ${invoices.length}`);
    console.log(`   Payroll Runs: ${payrollRuns.length}`);
    console.log(`   Journal Entries: ${journalEntries.length}`);
    console.log(`   Bank Transactions: ${bankTransactions.length}`);
    console.log("");
    console.log("🎉 You can now explore the demo workspace in the app!");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error populating demo data:", error);
    await pool.end();
    process.exit(1);
  }
}

main();
