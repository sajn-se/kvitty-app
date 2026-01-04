import { router } from "./init";
import { workspacesRouter } from "./routers/workspaces";
import { periodsRouter } from "./routers/periods";
import { bankTransactionsRouter } from "./routers/bank-transactions";
import { attachmentsRouter } from "./routers/attachments";
import { commentsRouter } from "./routers/comments";
import { invitesRouter } from "./routers/invites";
import { membersRouter } from "./routers/members";
import { usersRouter } from "./routers/users";
// Full bookkeeping routers
import { bankAccountsRouter } from "./routers/bank-accounts";
import { journalEntriesRouter } from "./routers/journal-entries";
import { employeesRouter } from "./routers/employees";
import { payrollRouter } from "./routers/payroll";
import { customersRouter } from "./routers/customers";
import { invoicesRouter } from "./routers/invoices";
import { productsRouter } from "./routers/products";
import { reportsRouter } from "./routers/reports";
import { bokslutRouter } from "./routers/bokslut";

export const appRouter = router({
  workspaces: workspacesRouter,
  periods: periodsRouter,
  bankTransactions: bankTransactionsRouter,
  attachments: attachmentsRouter,
  comments: commentsRouter,
  invites: invitesRouter,
  members: membersRouter,
  users: usersRouter,
  // Full bookkeeping routers
  bankAccounts: bankAccountsRouter,
  journalEntries: journalEntriesRouter,
  employees: employeesRouter,
  payroll: payrollRouter,
  customers: customersRouter,
  invoices: invoicesRouter,
  products: productsRouter,
  reports: reportsRouter,
  bokslut: bokslutRouter,
});

export type AppRouter = typeof appRouter;
