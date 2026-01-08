/**
 * SIE5 XML File Import Parser
 *
 * Parses Swedish SIE5 XML format accounting files.
 * SIE5 is the XML-based standard for exchanging accounting data in Sweden.
 *
 * Key SIE5 elements:
 * - FileInfo: Company metadata, fiscal years
 * - Accounts: Chart of accounts
 * - Journal: Contains JournalEntry elements
 * - JournalEntry: Verification with LedgerEntry lines
 * - LedgerEntry: Individual debit/credit transaction
 */

import { XMLParser } from "fast-xml-parser";

export interface SIE5Account {
  id: string;
  name: string;
  type: "asset" | "liability" | "equity" | "cost" | "income";
}

export interface SIE5LedgerEntry {
  accountId: string;
  amount: number;
  text?: string;
}

export interface SIE5JournalEntry {
  id: string;
  journalDate: string;
  text: string;
  journalId: string;
  journalName: string;
  ledgerEntries: SIE5LedgerEntry[];
}

export interface SIE5FiscalYear {
  start: string;
  end: string;
  primary?: boolean;
  closed?: boolean;
}

export interface SIE5ParseResult {
  journalEntries: SIE5JournalEntry[];
  accounts: Map<string, SIE5Account>;
  companyName?: string;
  orgNumber?: string;
  fiscalYears: SIE5FiscalYear[];
  softwareProduct?: string;
  errors: string[];
  warnings: string[];
}

/**
 * Parse an array or single element into an array
 */
function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/**
 * Parse a SIE5 date (YYYY-MM-DD or YYYY-MM) to ISO format
 */
function parseSIE5Date(dateStr: string): string | null {
  if (!dateStr) return null;

  // Handle YYYY-MM format (fiscal year dates)
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return `${dateStr}-01`;
  }

  // Handle YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  return null;
}

/**
 * Parse a SIE5 fiscal year end date (YYYY-MM to last day of month)
 */
function parseFiscalYearEnd(dateStr: string): string | null {
  if (!dateStr) return null;

  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const [year, month] = dateStr.split("-").map(Number);
    // Get last day of month
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${month.toString().padStart(2, "0")}-${lastDay.toString().padStart(2, "0")}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  return null;
}

/**
 * Map SIE5 account type to standard type
 */
function mapAccountType(
  type: string
): "asset" | "liability" | "equity" | "cost" | "income" {
  const normalizedType = type?.toLowerCase();
  switch (normalizedType) {
    case "asset":
      return "asset";
    case "liability":
      return "liability";
    case "equity":
      return "equity";
    case "cost":
      return "cost";
    case "income":
      return "income";
    default:
      return "asset";
  }
}

/**
 * Parse SIE5 XML content
 */
export function parseSIE5(content: string): SIE5ParseResult {
  const result: SIE5ParseResult = {
    journalEntries: [],
    accounts: new Map(),
    fiscalYears: [],
    errors: [],
    warnings: [],
  };

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    allowBooleanAttributes: true,
    parseAttributeValue: true,
    trimValues: true,
    removeNSPrefix: true,
  });

  let parsed;
  try {
    parsed = parser.parse(content);
  } catch (error) {
    result.errors.push(
      `Kunde inte tolka XML: ${error instanceof Error ? error.message : "Okant fel"}`
    );
    return result;
  }

  // Handle both Sie and SieEntry root elements
  const root = parsed.Sie || parsed.SieEntry;
  if (!root) {
    result.errors.push("Ogiltig SIE5-fil: Saknar Sie eller SieEntry rotelement");
    return result;
  }

  // Parse FileInfo
  const fileInfo = root.FileInfo;
  if (fileInfo) {
    // Company info
    const company = fileInfo.Company;
    if (company) {
      result.companyName = company["@_name"];
      result.orgNumber = company["@_organizationId"];
    }

    // Software product
    const softwareProduct = fileInfo.SoftwareProduct;
    if (softwareProduct) {
      result.softwareProduct = `${softwareProduct["@_name"]} ${softwareProduct["@_version"] || ""}`.trim();
    }

    // Fiscal years
    const fiscalYears = fileInfo.FiscalYears;
    if (fiscalYears) {
      const fyArray = ensureArray(fiscalYears.FiscalYear);
      for (const fy of fyArray) {
        const start = parseSIE5Date(fy["@_start"]);
        const end = parseFiscalYearEnd(fy["@_end"]);

        if (start && end) {
          result.fiscalYears.push({
            start,
            end,
            primary: fy["@_primary"] === true || fy["@_primary"] === "true",
            closed: fy["@_closed"] === true || fy["@_closed"] === "true",
          });
        }
      }
    }
  }

  // Parse Accounts
  const accounts = root.Accounts;
  if (accounts) {
    const accountArray = ensureArray(accounts.Account);
    for (const account of accountArray) {
      const id = String(account["@_id"]);
      const name = account["@_name"] || `Konto ${id}`;
      const type = mapAccountType(account["@_type"]);

      result.accounts.set(id, { id, name, type });
    }
  }

  // Parse Journal entries
  const journals = ensureArray(root.Journal);
  for (const journal of journals) {
    const journalId = String(journal["@_id"] || "0");
    const journalName = journal["@_name"] || "Journal";

    const journalEntries = ensureArray(journal.JournalEntry);
    for (const entry of journalEntries) {
      const id = String(entry["@_id"]);
      const journalDate = parseSIE5Date(entry["@_journalDate"]);
      const text = entry["@_text"] || "";

      if (!journalDate) {
        result.warnings.push(
          `Verifikation ${id}: Ogiltigt datum, hoppar over`
        );
        continue;
      }

      const ledgerEntries: SIE5LedgerEntry[] = [];
      const ledgerEntryArray = ensureArray(entry.LedgerEntry);

      for (const ledger of ledgerEntryArray) {
        const accountId = String(ledger["@_accountId"]);
        const amount = parseFloat(ledger["@_amount"]);
        const ledgerText = ledger["@_text"];

        if (isNaN(amount)) {
          result.warnings.push(
            `Verifikation ${id}: Ogiltigt belopp for konto ${accountId}`
          );
          continue;
        }

        ledgerEntries.push({
          accountId,
          amount,
          text: ledgerText,
        });
      }

      if (ledgerEntries.length === 0) {
        result.warnings.push(
          `Verifikation ${id}: Inga giltiga konteringar, hoppar over`
        );
        continue;
      }

      result.journalEntries.push({
        id,
        journalDate,
        text,
        journalId,
        journalName,
        ledgerEntries,
      });
    }
  }

  return result;
}

/**
 * Convert SIE5 ledger entry amount to debit/credit
 * In SIE5: positive = debit, negative = credit (for asset/cost accounts)
 * For liability/income/equity: signs are reversed
 */
export function amountToDebitCredit(
  amount: number,
  _accountType?: "asset" | "liability" | "equity" | "cost" | "income"
): { debit: number; credit: number } {
  // In SIE5, amounts are stored as changes to the account
  // Positive = increase to account (debit for assets/costs, credit for liabilities/income)
  // For simplicity in double-entry, we use: positive = debit, negative = credit
  if (amount >= 0) {
    return { debit: amount, credit: 0 };
  }
  return { debit: 0, credit: Math.abs(amount) };
}

/**
 * Validate that a journal entry balances (total debit = total credit)
 */
export function validateEntryBalance(entry: SIE5JournalEntry): {
  balanced: boolean;
  difference: number;
} {
  let totalDebit = 0;
  let totalCredit = 0;

  for (const ledger of entry.ledgerEntries) {
    const { debit, credit } = amountToDebitCredit(ledger.amount);
    totalDebit += debit;
    totalCredit += credit;
  }

  const difference = Math.abs(totalDebit - totalCredit);
  // Allow small rounding differences (less than 0.01)
  const balanced = difference < 0.01;

  return { balanced, difference };
}

/**
 * Check if content is SIE5 XML format
 */
export function isSIE5Format(content: string): boolean {
  const trimmed = content.trim();
  return (
    trimmed.startsWith("<?xml") ||
    trimmed.startsWith("<Sie") ||
    trimmed.startsWith("<SieEntry") ||
    trimmed.includes("http://www.sie.se/sie5")
  );
}
