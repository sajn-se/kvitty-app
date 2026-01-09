# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kvitty is a comprehensive Swedish bookkeeping and invoicing SaaS application. It supports both simple receipt tracking ("simple" mode) and full double-entry bookkeeping ("full_bookkeeping" mode) with advanced features including:

- **Invoicing**: Full invoice lifecycle with PDF generation, email delivery, Swish QR codes, and public invoice links
- **Payroll**: Swedish payroll with tax calculations, AGI XML generation for Skatteverket, and salary statements
- **Bank Integration**: Bank transaction import with automated matching and duplicate detection
- **Tax Compliance**: ROT/RUT deductions, margin scheme for used goods, reverse charge, and Peppol e-invoicing
- **Reporting**: Income statement, balance sheet, VAT reports with BAS account grouping
- **Annual Closing**: Multi-step bokslut wizard with K1/K2/K3 packages
- **Email Inbox**: Automated document processing from workspace-specific email addresses
- **AI Features**: Bank transaction extraction, bookkeeping assistant, and receipt image analysis

## Development Commands

```bash
pnpm dev              # Start development server
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking

# Database (Drizzle + PostgreSQL)
pnpm db:push          # Push schema changes to database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:wipe          # Wipe database (scripts/wipe-db.ts)

# Demo & Setup
pnpm demo:populate    # Populate workspace with demo data
pnpm fetch-tax-tables # Fetch Swedish tax tables from Skatteverket
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16.1.1 with App Router + React 19.2.3
- **Database**: PostgreSQL with Drizzle ORM 0.45.1
- **API**: tRPC 11.8 with React Query + SuperJSON transformer
- **Authentication**: better-auth 1.4 (magic link, email OTP, Google OAuth)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **File Storage**: Abstracted provider system (Local filesystem or AWS S3 + CloudFront)
- **AI**: Groq SDK with AI SDK (3 models: GPT-OSS-120B, Kimi-K2, Llama-4-Maverick)
- **Forms**: react-hook-form 7.69 + Zod 4.3 validation
- **Tables**: @tanstack/react-table 8.21 with server-side pagination
- **Dates**: date-fns 4.1
- **PDF**: jsPDF 3.0 for invoice/salary statement generation
- **Charts**: recharts 3.6
- **Animations**: Motion 12.23
- **Icons**: @phosphor-icons/react 2.1 + lucide-react
- **File Uploads**: react-dropzone 14.3
- **Drag & Drop**: @dnd-kit 6.3
- **Flow Diagrams**: @xyflow/react 12.10
- **Theming**: next-themes 0.4
- **QR Codes**: qrcode 1.5
- **Email**: UseSend via Nodemailer 7.0
- **XML Parsing**: fast-xml-parser 5.3 for SIE5/AGI/Peppol
- **Encoding**: iconv-lite for SIE4 import (CP437, Latin-1, UTF-8)
- **Security**: Encryption for sensitive data (personal numbers), botid for bot detection

### Route Structure
```
app/
├── (auth)/              # Public authentication pages
│   ├── login/           # Email/password + magic link + Google OAuth
│   ├── signup/          # New user registration
│   ├── otp/             # Email OTP verification
│   └── magic-link-sent/ # Magic link confirmation
├── (dash)/              # Protected dashboard (requires auth)
│   ├── dashboard/       # User dashboard (workspace selector)
│   ├── user/
│   │   └── installningar/ # User settings
│   └── [workspaceSlug]/   # Workspace-scoped pages
│       ├── page.tsx         # Workspace dashboard (metrics, activity)
│       ├── bank/            # Bank accounts & transaction import
│       ├── fakturor/        # Invoices (draft, sent, paid)
│       │   └── [invoiceId]/ # Invoice detail & edit
│       ├── kunder/          # Customer management
│       ├── produkter/       # Product catalog
│       ├── personal/        # Employee management
│       │   └── lon/         # Payroll runs & AGI generation
│       │       └── [runId]/ # Payroll run detail
│       ├── verifikationer/  # Journal entries (full_bookkeeping mode)
│       ├── transaktioner/   # Bank transactions (simple mode)
│       ├── inbox/           # Email inbox for document processing
│       ├── medlemmar/       # Workspace members & invitations
│       ├── perioder/        # Fiscal periods management
│       ├── bokslut/         # Annual closing wizard
│       ├── installningar/   # Workspace settings
│       └── rapporter/       # Financial reports
│           ├── resultat/    # Income statement (Resultaträkning)
│           ├── balans/      # Balance sheet (Balansräkning)
│           └── moms/        # VAT report (Momsrapport)
├── (web)/               # Public marketing pages
│   ├── page.tsx         # Homepage
│   ├── funktioner/      # Features overview
│   ├── kontakt/         # Contact
│   ├── terms/           # Terms of service
│   ├── privacy/         # Privacy policy
│   └── faktura/[invoiceId]/ # Public invoice view with payment info
├── invite/[token]/      # Workspace invitation acceptance
├── onboarding/          # New user onboarding wizard
├── new-workspace/       # Create new workspace
└── api/
    ├── auth/            # better-auth API routes
    └── trpc/            # tRPC API handler
```

### Key Directories
- **Database & ORM**
  - `lib/db/schema.ts` - Complete Drizzle schema with all tables and relations
  - `lib/db/index.ts` - Database connection and Drizzle instance

- **tRPC API**
  - `lib/trpc/init.ts` - Context creation, `publicProcedure`, `protectedProcedure`, `workspaceProcedure`
  - `lib/trpc/routers/` - Feature-specific routers:
    - `workspaces.ts`, `invoices.ts`, `customers.ts`, `products.ts`
    - `employees.ts`, `payroll.ts`, `journal-entries.ts`
    - `bank-accounts.ts`, `bank-transactions.ts`
    - `periods.ts`, `reports.ts`, `bokslut.ts`
    - `inbox.ts`, `comments.ts`, `attachments.ts`
    - `invites.ts`, `members.ts`, `allowed-emails.ts`, `users.ts`

- **Validation**
  - `lib/validations/` - Zod schemas for all forms and API inputs

- **Authentication**
  - `lib/auth.ts` - Server-side better-auth configuration
  - `lib/auth-client.ts` - Client-side auth hooks (`useSession`, `signIn`, `signOut`)

- **File Storage**
  - `lib/storage/` - Abstracted storage provider system
    - `local.ts` - Local filesystem provider (`/public/uploads/`)
    - `s3.ts` - AWS S3 + CloudFront provider
    - `index.ts` - Provider factory and interface

- **Email**
  - `lib/email/` - Email templates and sending
    - `send-invoice.ts`, `send-reminder.ts`, `send-salary-statement.ts`
    - `send-invite.ts`

- **AI Features**
  - `lib/ai/` - AI integration with Groq
    - `bank-transaction-extraction.ts` - Extract transaction data from images
    - `bookkeeping-assistant.ts` - Chat-based bookkeeping help
    - `receipt-analysis.ts` - Analyze receipt images

- **Utilities**
  - `lib/utils/` - Shared utilities:
    - `account-ranges.ts` - BAS account classification helpers
    - `agi-generator.ts` - AGI XML generation for Skatteverket
    - `sie-import.ts`, `sie5-import.ts` - SIE import parsers
    - `peppol-invoice.ts` - UBL 2.1 XML for e-invoicing
    - `invoice-pdf.ts` - Invoice PDF generation
    - `salary-statement-pdf.ts` - Salary statement PDF
    - `qr-codes.ts` - Swish and EPC QR code generation
    - `encryption.ts` - Sensitive data encryption
    - `transaction-hash.ts` - Bank transaction duplicate detection

- **Constants**
  - `lib/consts/` - Application constants:
    - `verification-templates.ts` - 100+ pre-defined journal entry templates
    - `tax-tables.ts` - Swedish tax tables from Skatteverket
    - `employer-contribution-rates.ts` - Swedish employer contribution rates
    - `bas-accounts.ts` - BAS account plan

- **Components**
  - `components/ui/` - shadcn/ui components (40+ components)
  - `components/{feature}/` - Feature-specific components (invoices, bank, payroll, etc.)

- **Scripts**
  - `scripts/wipe-db.ts` - Wipe database
  - `scripts/populate-demo-data.ts` - Generate demo data
  - `scripts/fetch-tax-tables.ts` - Download tax tables
  - `scripts/fetch-bokio-templates.ts` - Download verification templates

### Data Model
All business data is workspace-scoped. Key entities:

**Core Entities:**
- **Workspaces**: Multi-tenant isolation with workspace modes (simple/full_bookkeeping), business types (aktiebolag, enskild firma, etc.), payment details (Bankgiro, Plusgiro, Swish), VAT settings
- **WorkspaceMembers**: User-workspace junction with role management
- **WorkspaceInvites**: Pending invitations with token-based acceptance
- **FiscalPeriods**: Accounting years (calendar or broken fiscal year), period locking, date ranges

**Bookkeeping (Full Mode):**
- **JournalEntries**: Double-entry bookkeeping verifications with types (kvitto, inkomst, leverantorsfaktura, lon, utlagg, annat, opening_balance)
- **JournalEntryLines**: Individual debit/credit lines with BAS account numbers
- **VerificationTemplates**: 100+ pre-defined templates from Bokio
- **Attachments**: File uploads linked to journal entries (S3 or local storage)
- **Comments**: Workspace-wide commenting system for collaboration

**Banking:**
- **BankAccounts**: Multiple bank accounts per workspace with BAS account numbers (1630, 1930, etc.)
- **BankTransactions**: Imported transactions with duplicate detection (hash-based)
- **BankImportBatches**: Import batch tracking with status (pending, processing, completed, failed)
- Transaction statuses: pending, matched, booked, ignored

**Invoicing:**
- **Invoices**: Full invoice lifecycle (draft, sent, paid) with PDF generation
  - ROT/RUT deduction support (property designation, apartment number, labor vs material)
  - Margin scheme for used goods (purchase price tracking)
  - Reverse charge for EU B2B transactions
  - Peppol e-invoicing (UBL 2.1 XML)
  - Public invoice links with view tracking
  - OCR number generation
  - Swish QR codes for payments
- **InvoiceLines**: Multi-line items with drag-and-drop reordering
- **Customers**: Customer management with multi-contact support, VAT numbers for EU transactions
- **CustomerContacts**: Multiple contacts per customer
- **Products**: Product catalog with units (styck, timmar, kilogram, etc.), types (V=Varor, T=Tjänster), VAT rates

**Payroll:**
- **Employees**: Employee management with encrypted personal numbers
- **PayrollRuns**: Payroll processing with statuses (draft, calculated, approved, paid, reported)
- **PayrollEntries**: Individual salary entries per employee
- **SalaryStatements**: Generated PDF salary statements
- Swedish tax compliance:
  - Employer contribution calculation (31.42% standard, 10.21% retirement)
  - Tax deduction from Skatteverket tax tables
  - AGI XML generation for tax reporting
  - AGI deadline tracking (12th of following month)

**Annual Closing:**
- **AnnualClosings**: Year-end closing workflow with statuses:
  - not_started → reconciliation_complete → package_selected → closing_entries_created → tax_calculated → finalized
- **Closing packages**: K1, K2, K3 (Swedish accounting standards)
- Corporate tax calculation (20.6% for AB)
- Automatic closing entry generation

**Email Inbox:**
- **InboxEmails**: Workspace-specific email addresses (kvitty.{slug}@inbox.kvitty.se)
- **InboxAttachments**: Extracted attachments with linking to journal entries/bank transactions
- **AllowedEmails**: Per-user allowed sender management
- Status tracking: pending, processed, rejected, error

**Better-Auth Tables:**
- **user**, **session**, **account**, **verification** - Managed by better-auth library

### tRPC Pattern
Procedures use `workspaceProcedure` for workspace-scoped operations which validates membership:
```typescript
import { workspaceProcedure } from "../init";
// Input must include workspaceId, membership is automatically verified
```

### Table Pagination & URL State Pattern
All tables MUST have server-side pagination with URL state using `nuqs`. This ensures:
- Pagination state is shareable via URL
- Browser back/forward navigation works correctly
- Page refreshes maintain state

**URL State with nuqs:**
Always use `nuqs` for URL state management instead of `useState` or manual `useSearchParams`:
```typescript
import { useQueryState, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs";

// Page number (integer)
const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

// String filter
const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));

// Enum/literal filter
const statusOptions = ["all", "draft", "sent", "paid"] as const;
const [status, setStatus] = useQueryState(
  "status",
  parseAsStringLiteral(statusOptions).withDefault("all")
);

// Reset page when filters change
const handleFilterChange = (value: string) => {
  setStatus(value);
  setPage(1); // Reset to page 1
};
```

**tRPC Router:**
```typescript
list: workspaceProcedure
  .input(z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }))
  .query(async ({ ctx, input }) => {
    const whereClause = eq(table.workspaceId, ctx.workspaceId);

    const [items, totalResult] = await Promise.all([
      ctx.db.query.table.findMany({
        where: whereClause,
        limit: input.limit,
        offset: input.offset,
      }),
      ctx.db.select({ count: count() }).from(table).where(whereClause),
    ]);

    return {
      items,
      total: totalResult[0]?.count ?? 0,
    };
  })
```

**Page Client:**
```typescript
import { useQueryState, parseAsInteger } from "nuqs";

const PAGE_SIZE = 20;

// URL state with nuqs
const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

const { data } = trpc.items.list.useQuery({
  workspaceId: workspace.id,
  limit: PAGE_SIZE,
  offset: (page - 1) * PAGE_SIZE,
});

const items = data?.items;
const total = data?.total ?? 0;
const totalPages = Math.ceil(total / PAGE_SIZE);
```

**Table Component:**
```typescript
interface TableProps {
  // ... other props
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

// Use the shared TablePagination component
import { TablePagination } from "@/components/ui/table-pagination";

<TablePagination
  page={page}
  totalPages={totalPages}
  total={total}
  pageSize={20}
  onPageChange={onPageChange}
  itemLabel="items"
/>
```

**IMPORTANT:** Never use `useState` for URL-related state like pagination, filters, or search. Always use `nuqs` to keep state in the URL.

### File Storage Pattern
The application uses an abstracted file storage provider system that supports both local filesystem and AWS S3:

**Provider Configuration:**
```typescript
// Set in .env
STORAGE_PROVIDER=local  # or "s3"

// lib/storage/index.ts exports:
export const storage = getStorageProvider(); // Automatically selects provider
```

**Storage Operations:**
```typescript
import { storage } from "@/lib/storage";

// Upload file
const url = await storage.uploadFile(buffer, path, contentType);

// Delete file
await storage.deleteFile(path);

// Get file URL (S3 returns CloudFront URL)
const url = storage.getFileUrl(path);

// Get presigned upload URL (S3 only, for direct browser uploads)
const presignedUrl = await storage.getPresignedUploadUrl(key, contentType);
```

**File Upload Hook:**
```typescript
import { useFileUpload } from "@/lib/hooks/use-file-upload";

const { upload, uploading, progress } = useFileUpload();

const handleUpload = async (file: File) => {
  const url = await upload(file, `receipts/${file.name}`);
  // url is now accessible at CloudFront or /uploads/
};
```

**Providers:**
- **Local** (`lib/storage/local.ts`): Stores in `/public/uploads/`, serves via `/uploads/` path
- **S3** (`lib/storage/s3.ts`): Uploads to S3, returns CloudFront CDN URL for fast global access

### Forms Pattern
All forms use React Hook Form with Zod validation:

**Standard Form Pattern:**
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";

// Define validation schema in lib/validations/
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

type FormValues = z.infer<typeof formSchema>;

function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "" },
  });

  const createMutation = trpc.myRouter.create.useMutation();

  const onSubmit = async (data: FormValues) => {
    await createMutation.mutateAsync(data);
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Field name="name" label="Name" form={form} />
      <Field name="email" label="Email" type="email" form={form} />
      <Button type="submit" loading={createMutation.isPending}>
        Save
      </Button>
    </form>
  );
}
```

**Field Component:**
The shared `<Field>` component (`components/ui/field.tsx`) handles labels, errors, and common input types.

**Validation Locations:**
- `lib/validations/invoices.ts` - Invoice schemas
- `lib/validations/customers.ts` - Customer schemas
- `lib/validations/employees.ts` - Employee schemas
- `lib/validations/bank.ts` - Bank transaction schemas
- etc.

## Swedish Accounting Features

### BAS Kontoplan (Chart of Accounts)
Swedish standard chart of accounts with ranges defined in `lib/utils/account-ranges.ts`:

- **1000-1999**: Assets (Tillgångar)
  - 1630, 1930: Bank accounts
- **2000-2999**: Equity & Liabilities (Eget kapital och skulder)
  - 2610-2639: Output VAT (Utgående moms)
  - 2640-2649: Input VAT (Ingående moms)
- **3000-3999**: Revenue (Intäkter)
- **4000-6999**: Expenses (Kostnader)
- **7000-8999**: Financial items (Finansiella poster)

### VAT (Moms)
Four VAT rates supported:
- **25%**: Standard rate (most goods/services)
- **12%**: Reduced rate (food, hotels)
- **6%**: Reduced rate (newspapers, books, transport)
- **0%**: Zero-rated (exports, international services)

**VAT Reporting:**
- Frequency: Monthly, quarterly, or yearly (configurable per workspace)
- Reports show output VAT by rate, input VAT deduction, and net payable
- Payment deadline tracking
- Account ranges: 2610-2639 (output), 2640-2649 (input)

### ROT/RUT Tax Deductions
Swedish tax deductions for home services:

**ROT (30% deduction on labor)**
- Renovation, Ombyggnad (conversion), Tillbyggnad (extension)
- Requires property designation (Fastighetsbeteckning)
- Labor vs material cost split required
- Customer personal number required

**RUT (50% deduction on labor)**
- Hushållsnära tjänster (household services)
- Requires apartment number for apartment buildings
- Labor vs material cost split required
- Customer personal number required

**Implementation:**
- Invoice form has ROT/RUT toggle
- Separate fields for labor/material costs
- Automatic deduction calculation
- Property/apartment tracking
- Printed on invoice PDF

### Margin Scheme (Vinstmarginalbeskattning)
Special VAT treatment for used goods:

**Categories:**
- used_goods: General used goods
- artwork: Konstverk
- antiques: Antikviteter
- collectors_items: Samlarföremål

**Implementation:**
- Purchase price tracking on invoices
- VAT calculated on margin (sale price - purchase price)
- Special invoice PDF formatting

### Peppol E-Invoicing
UBL 2.1 XML generation for electronic invoicing:

**Features:**
- Peppol BIS Billing 3.0 compliance
- Peppol ID support
- XML generation via `lib/utils/peppol-invoice.ts`
- Used for EU B2B transactions

### AGI (Arbetsgivardeklaration)
Employer tax declaration for Skatteverket:

**Generation:**
- XML format defined by Skatteverket
- IU (Income Report) entries per employee
- Includes salary, employer contributions, tax deductions
- Generated via `lib/utils/agi-generator.ts`

**Workflow:**
1. Create payroll run → status: draft
2. Calculate taxes/contributions → status: calculated
3. Approve run → status: approved
4. Mark as paid → status: paid
5. Generate & submit AGI XML → status: reported

**Deadline:** 12th of the month following salary period

### Employer Contributions
Swedish employer contributions (Arbetsgivaravgifter):

**Rates** (defined in `lib/consts/employer-contribution-rates.ts`):
- **31.42%**: Standard rate (born 1957 or later)
- **10.21%**: Reduced rate for retirement age (born 1938-1956)
- **0%**: Exempt (born before 1938)

**Calculation:**
- Applied to gross salary
- Automatically calculated in payroll runs
- Included in AGI reporting

### Tax Tables
Swedish tax deduction tables from Skatteverket:

**Features:**
- Fetched from Skatteverket's open data API
- Updated via `pnpm fetch-tax-tables` script
- Stored in `lib/consts/tax-tables.ts`
- Used for payroll tax deduction calculation

### SIE Import/Export
Import verifications from other Swedish accounting systems:

**SIE4** (text-based):
- Encoding detection: CP437, Latin-1, UTF-8
- Parser: `lib/utils/sie-import.ts`

**SIE5** (XML-based):
- XML parser: `lib/utils/sie5-import.ts`
- Faster import via XML streaming

**Features:**
- Duplicate detection
- Balance validation
- Account mapping
- Date range filtering

### Verification Templates
100+ pre-defined journal entry templates imported from Bokio:

**Location:** `lib/consts/verification-templates.ts`

**Categories:**
- Banktjänster, Biljetter, Bredband, Frakt, Försäljning, Hyra, Inventarier, Konsulter, Kontorsmaterial, Leasing, Licenser, Lön, Representation, Resor, Telefon, Verktyg, etc.

**Features:**
- Template selector with search
- Category grouping
- Direction filtering (In/Out/ShowAll)
- Pre-filled account mappings
- Common transaction patterns

### Annual Closing (Bokslut)
Multi-step year-end closing workflow:

**Statuses:**
1. **not_started**: Initial state
2. **reconciliation_complete**: All accounts reconciled
3. **package_selected**: K1/K2/K3 package chosen
4. **closing_entries_created**: Automatic closing entries generated
5. **tax_calculated**: Corporate tax calculated (20.6% for AB)
6. **finalized**: Closing locked

**Packages:**
- **K1**: Simplest (small companies)
- **K2**: Medium complexity
- **K3**: Full IFRS compliance

### Environment Variables

**Required:**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/kvitty
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
ENCRYPTION_KEY=<generate with: openssl rand -base64 32>
```

**File Storage (choose provider):**
```bash
# Local filesystem (default)
STORAGE_PROVIDER=local

# OR AWS S3
STORAGE_PROVIDER=s3
AWS_REGION=eu-north-1
AWS_S3_BUCKET=kvitty-uploads
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
CLOUDFRONT_DOMAIN=d123456.cloudfront.net
```

**Optional Features:**
```bash
# AI Features (Groq)
GROQ_API_KEY=your-groq-api-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_SSO=true  # Show Google login button

# Email (UseSend)
USESEND_API_KEY=your-usesend-key
USESEND_URL=https://api.usesend.com
EMAIL_FROM=noreply@kvitty.se

# Registration Control
NEXT_PUBLIC_REGISTRATIONS_ENABLED=true  # Allow public signups
```

## Swedish Context

This is a Swedish accounting application built for the Swedish market. Swedish terminology is used throughout the codebase. For a comprehensive list of Swedish accounting terms and their translations, see `SWEDISH_TERMINOLOGY.md`.
