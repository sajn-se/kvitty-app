# Kvitty

<div align="center">
  <img src="https://www.kvitty.se/assets/SCR-20260105-mywx.png" alt="Kvitty Dashboard" width="100%" />
</div>

<div align="center" style="margin-top: 1rem; opacity: 0.7; font-size: 0.9em;">
  <em>This is a proof-of-concept/fun project. This code does not reflect the sajn.se codebase. The sajn-se org has developed sajn.se (digital signing service) which is a real, well-functioning and battle-tested product.</em>
</div>

---

## About Kvitty

Kvitty is a Swedish bookkeeping and invoicing SaaS application built for small businesses. The application supports both simple receipt management ("simple" mode) and full double-entry bookkeeping ("full_bookkeeping" mode) with payroll management, invoicing, and AGI (Arbetsgivardeklaration) XML generation for Swedish tax reporting.

## API Documentation

API documentation is available at: [http://kvitty.se/api/v1/docs](http://kvitty.se/api/v1/docs)

## Features

### Two Modes

**Traditional Bookkeeping**
- Full double-entry bookkeeping with support for BAS chart of accounts
- Verifications and general ledger
- Balance sheet and income statement
- SIE export

**Receipt Management**
- Simple matching between bank transactions and receipts
- Photo upload of receipts
- Automatic categorization with AI
- Export supporting documents

### Invoicing
- Create and manage invoices
- Customer and product registers
- Automatic VAT calculation (25%, 12%, 6%, 0%)
- Send invoices via email
- Reminders for overdue invoices

### Payroll Management
- Manage employees
- Payroll runs
- AGI XML generation for the Swedish Tax Agency
- Payroll statistics and reports

### Bank Integration
- Import bank transactions
- Match transactions with receipts
- Duplicate checking
- Transaction history

### AI Features
- Analyze receipts with AI
- Automatic categorization
- Chat assistant for bookkeeping questions

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **API**: tRPC with React Query
- **Authentication**: better-auth (magic link, email OTP, Google OAuth)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **File Storage**: Local filesystem or AWS S3 (configurable)
- **AI**: Groq SDK with AI SDK
- **Animations**: Motion (Framer Motion)
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm (or npm/yarn)
- PostgreSQL database
- AWS S3 account (optional, for cloud file storage)
- Groq API key (optional, for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kvitty-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Fill in the required environment variables (minimal setup):
```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/kvitty
BETTER_AUTH_SECRET=your-secret-key-here  # Generate: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
ENCRYPTION_KEY=your-encryption-key-here  # Generate: openssl rand -base64 32

# File Storage (defaults to local if not set)
STORAGE_PROVIDER=local

# Optional: Add these for additional features
# GROQ_API_KEY=your-groq-api-key  # For AI features
# GOOGLE_CLIENT_ID=your-google-client-id  # For Google OAuth
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

5. Push the database schema:
```bash
pnpm db:push
```

6. Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## File Storage

Kvitty supports two storage providers:

**Local Storage (Default)** - Files stored in `/public/uploads/`. No external dependencies required. Best for development and self-hosted deployments.

```env
STORAGE_PROVIDER=local
```

**AWS S3** - Files stored in S3 with CloudFront CDN. Required for serverless deployments and the email inbox feature.

```env
STORAGE_PROVIDER=s3
AWS_REGION=eu-north-1
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
```

Switch between providers by changing `STORAGE_PROVIDER` and restarting the application.

## Development Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking

# Database
pnpm db:push          # Push schema changes to database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:wipe          # Wipe database

# Demo data
pnpm demo:populate    # Populate database with demo data

# Testing
npx tsx scripts/test-storage.ts  # Test file storage (local or S3)
```

## Project Structure

```
kvitty-app/
├── app/                     # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── (dash)/              # Dashboard (requires auth)
│   │   └── [workspaceSlug]/ # Workspace-scoped pages
│   ├── (web)/               # Public marketing pages
│   └── api/                 # API routes
│       ├── auth/            # better-auth endpoints
│       └── trpc/            # tRPC handler
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── invoices/            # Invoice components
│   ├── bank/                # Bank components
│   └── ...
├── lib/                     # Libraries and utilities
│   ├── db/                  # Drizzle schema and configuration
│   ├── trpc/                # tRPC configuration and routers
│   ├── storage/             # File storage abstraction layer
│   ├── validations/         # Zod schemas
│   └── auth.ts              # better-auth configuration
├── hooks/                   # React hooks
├── scripts/                 # Utility scripts
└── public/                  # Static files
```

## Architecture

### Multi-tenant Structure

All business data is workspace-scoped. Each user can be a member of multiple workspaces, and all data is isolated per workspace.

### Data Model

Key entities:
- **Workspaces**: Multi-tenant isolation with members/invitations
- **FiscalPeriods**: Fiscal years (calendar year or broken year)
- **JournalEntries/JournalEntryLines**: Double-entry bookkeeping (full mode)
- **Verifications**: Simple receipt management (simple mode)
- **Invoices/InvoiceLines/Customers/Products**: Invoicing system
- **Employees/PayrollRuns/PayrollEntries**: Payroll management with AGI XML generation
- **BankAccounts/BankTransactions**: Bank integration

### tRPC Pattern

Procedures use `workspaceProcedure` for workspace-scoped operations that validate membership:

```typescript
import { workspaceProcedure } from "../init";

export const myRouter = router({
  list: workspaceProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      // ctx.workspace is automatically validated and available
    }),
});
```

### Authentication

The application uses better-auth with support for:
- Magic link (link via email)
- Email OTP (one-time password)
- Google OAuth

### Routing

- `app/(auth)/` - Public authentication pages
- `app/(dash)/` - Protected dashboard pages
  - `[workspaceSlug]/` - Workspace-scoped pages
    - `[periodSlug]/` - Fiscal period-scoped pages
- `app/(web)/` - Public marketing pages

## Swedish Context

This is a Swedish bookkeeping application. Important terminology:
- **Faktura** = Invoice
- **Kund** = Customer
- **Produkt** = Product
- **Moms** = VAT (25%, 12%, 6%, 0%)
- **Verifikation** = Accounting verification/voucher
- **Räkenskapsår** = Fiscal year
- **Lön** = Payroll/Salary
- **AGI** = Arbetsgivardeklaration (employer tax declaration)
- **BAS-kontoplan** = Swedish standard chart of accounts

## Environment Variables

See `.env.example` for all necessary variables:

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Encryption key for auth (generate with: `openssl rand -base64 32`)
- `BETTER_AUTH_URL` - Base URL for auth (e.g. http://localhost:3000)
- `ENCRYPTION_KEY` - Encryption key for sensitive data (generate with: `openssl rand -base64 32`)

### File Storage
- `STORAGE_PROVIDER` - Storage provider: `"local"` (default) or `"s3"`
  - **Local**: Files stored in `/public/uploads/` (no additional config needed)
  - **S3**: Requires AWS configuration below

### AWS S3 Configuration (required only if `STORAGE_PROVIDER=s3`)
- `AWS_REGION` - AWS region (e.g. eu-north-1)
- `AWS_S3_BUCKET` - S3 bucket name
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `CLOUDFRONT_DOMAIN` - CloudFront distribution domain

### Optional Features
- `GROQ_API_KEY` - API key for AI features (receipt analysis, chat assistant)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NEXT_PUBLIC_GOOGLE_SSO` - Set to `"true"` to enable Google login button
- `NEXT_PUBLIC_REGISTRATIONS_ENABLED` - Enable/disable new user registrations (default: `"true"`). Set to `"false"` to disable public signups. When disabled, users attempting to sign up will be redirected to the login page. Existing users can still log in, and workspace invitations will still work.

## Nice to Have

### Tax Tables

Tax tables can be fetched from the Swedish Tax Agency's open data:
- Fetch: https://skatteverket.entryscape.net/rowstore/dataset/88320397-5c32-4c16-ae79-d36d95b17b95/json

## License

See [LICENSE](LICENSE) for more information.

## Contributing

This is a proof-of-concept/fun project. The same company behind Kvitty also develops [sajn.se](https://sajn.se) - a digital signing service (different brand/product).
