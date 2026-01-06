# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kvitty is a Swedish bookkeeping and invoicing SaaS application. It supports both simple receipt tracking ("simple" mode) and full double-entry bookkeeping ("full_bookkeeping" mode) with payroll, invoicing, and AGI (Arbetsgivardeklaration) XML generation for Swedish tax reporting.

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
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **API**: tRPC with React Query
- **Authentication**: better-auth (magic link, email OTP, Google OAuth)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **File Storage**: AWS S3 + CloudFront
- **AI**: Groq SDK with AI SDK

### Route Structure
- `app/(auth)/` - Authentication pages (login, signup, verify)
- `app/(dash)/` - Dashboard (requires auth)
  - `[workspaceSlug]/` - Workspace-scoped pages
    - `[periodSlug]/` - Fiscal period-scoped pages
- `app/(web)/` - Public marketing pages
- `app/api/auth/` - better-auth API routes
- `app/api/trpc/` - tRPC API handler

### Key Directories
- `lib/db/schema.ts` - Complete Drizzle schema with all tables and relations
- `lib/trpc/` - tRPC configuration and routers
  - `init.ts` - Context creation, `publicProcedure`, `protectedProcedure`, `workspaceProcedure`
  - `routers/` - Feature-specific routers (workspaces, invoices, payroll, etc.)
- `lib/validations/` - Zod schemas for input validation
- `lib/auth.ts` - Server-side better-auth configuration
- `lib/auth-client.ts` - Client-side auth hooks (`useSession`, `signIn`, `signOut`)
- `components/ui/` - shadcn/ui components

### Data Model
All business data is workspace-scoped. Key entities:
- **Workspaces**: Multi-tenant isolation with members/invites
- **FiscalPeriods**: Accounting years (calendar or broken)
- **JournalEntries/JournalEntryLines**: Double-entry bookkeeping (full mode)
- **Verifications**: Simple receipt tracking (simple mode)
- **Invoices/InvoiceLines/Customers/Products**: Invoicing system
- **Employees/PayrollRuns/PayrollEntries**: Payroll with AGI XML generation

### tRPC Pattern
Procedures use `workspaceProcedure` for workspace-scoped operations which validates membership:
```typescript
import { workspaceProcedure } from "../init";
// Input must include workspaceId, membership is automatically verified
```

### Environment Variables
See `.env.example` for required variables:
- `DATABASE_URL` - PostgreSQL connection
- `BETTER_AUTH_SECRET` - Auth encryption key
- `GOOGLE_CLIENT_ID/SECRET` - OAuth
- `GROQ_API_KEY` - AI features
- `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `CLOUDFRONT_DOMAIN` - File uploads

## Swedish Context

This is a Swedish accounting app. Key terminology:
- Faktura = Invoice
- Kund = Customer
- Produkt = Product
- Moms = VAT (25%, 12%, 6%, 0%)
- Verifikation = Accounting verification/voucher
- Räkenskapsår = Fiscal year
- Lön = Payroll/Salary
- AGI = Arbetsgivardeklaration (employer tax declaration)
- BAS-kontoplan = Swedish standard chart of accounts
