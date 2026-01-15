import * as journalEntries from "./routers/journal-entries";
import * as bankTransactions from "./routers/bank-transactions";
import * as bankAccounts from "./routers/bank-accounts";

// Combined router for oRPC API v1
export const apiRouter = {
  journalEntries: {
    list: journalEntries.listJournalEntries,
    get: journalEntries.getJournalEntry,
    create: journalEntries.createJournalEntry,
    update: journalEntries.updateJournalEntry,
    delete: journalEntries.deleteJournalEntry,
  },
  bankTransactions: {
    list: bankTransactions.listBankTransactions,
    get: bankTransactions.getBankTransaction,
    create: bankTransactions.createBankTransaction,
    update: bankTransactions.updateBankTransaction,
    delete: bankTransactions.deleteBankTransaction,
  },
  bankAccounts: {
    list: bankAccounts.listBankAccounts,
    get: bankAccounts.getBankAccount,
    create: bankAccounts.createBankAccount,
    update: bankAccounts.updateBankAccount,
    delete: bankAccounts.deleteBankAccount,
  },
};

export type ApiRouter = typeof apiRouter;
