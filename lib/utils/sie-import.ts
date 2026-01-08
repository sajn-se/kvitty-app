/**
 * SIE File Import Parser (Unified Interface)
 *
 * Parses Swedish SIE4 and SIE5 format accounting files.
 * - SIE4: Text-based format (older, still widely used)
 * - SIE5: XML-based format (newer standard)
 *
 * Key SIE4 elements:
 * - #VER: Verification (journal entry) header
 * - #TRANS: Transaction line within a verification
 * - Character encoding: CP437, Latin-1, or UTF-8
 */

import iconv from "iconv-lite";
import {
  parseSIE5,
  isSIE5Format,
  amountToDebitCredit,
  type SIE5ParseResult,
  type SIE5JournalEntry,
} from "./sie5-import";

export interface SIE4Transaction {
  accountNumber: number;
  objectList: string[];
  amount: number;
  transactionDate?: string;
  description?: string;
  quantity?: number;
  sign?: string;
}

export interface SIE4Verification {
  series: string;
  verificationNumber: string;
  date: string;
  description: string;
  regDate?: string;
  sign?: string;
  transactions: SIE4Transaction[];
}

export interface SIE4ParseResult {
  verifications: SIE4Verification[];
  companyName?: string;
  orgNumber?: string;
  fiscalYearStart?: string;
  fiscalYearEnd?: string;
  errors: string[];
}

export interface NormalizedBankTransaction {
  accountingDate: string;
  amount: number;
  reference: string;
  accountNumber?: number;
  verificationSeries?: string;
  verificationNumber?: string;
}

/**
 * Detect the encoding of a SIE file
 * SIE files can be CP437, Latin-1 (ISO-8859-1), or UTF-8
 */
function detectEncoding(buffer: Buffer): string {
  // Check for UTF-8 BOM
  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return "utf-8";
  }

  // Try to detect UTF-8 by looking for valid UTF-8 sequences
  let hasHighBytes = false;
  let validUtf8 = true;
  let i = 0;

  while (i < Math.min(buffer.length, 1000)) {
    const byte = buffer[i];

    if (byte > 127) {
      hasHighBytes = true;

      // Check for valid UTF-8 multi-byte sequence
      if ((byte & 0xe0) === 0xc0) {
        // 2-byte sequence
        if (i + 1 >= buffer.length || (buffer[i + 1] & 0xc0) !== 0x80) {
          validUtf8 = false;
          break;
        }
        i += 2;
      } else if ((byte & 0xf0) === 0xe0) {
        // 3-byte sequence
        if (
          i + 2 >= buffer.length ||
          (buffer[i + 1] & 0xc0) !== 0x80 ||
          (buffer[i + 2] & 0xc0) !== 0x80
        ) {
          validUtf8 = false;
          break;
        }
        i += 3;
      } else if ((byte & 0xf8) === 0xf0) {
        // 4-byte sequence
        if (
          i + 3 >= buffer.length ||
          (buffer[i + 1] & 0xc0) !== 0x80 ||
          (buffer[i + 2] & 0xc0) !== 0x80 ||
          (buffer[i + 3] & 0xc0) !== 0x80
        ) {
          validUtf8 = false;
          break;
        }
        i += 4;
      } else {
        validUtf8 = false;
        break;
      }
    } else {
      i++;
    }
  }

  if (hasHighBytes && validUtf8) {
    return "utf-8";
  }

  // Check for #KSUMMA which indicates CP437 encoding in older SIE files
  const content = buffer.toString("latin1");
  if (content.includes("#KSUMMA")) {
    // Older SIE files typically use CP437
    return "cp437";
  }

  // Default to Latin-1 (ISO-8859-1) for most Swedish SIE files
  return "latin1";
}

/**
 * Decode a SIE file buffer to string
 */
export function decodeSIEContent(buffer: Buffer): string {
  const encoding = detectEncoding(buffer);

  if (encoding === "utf-8") {
    // Remove BOM if present
    let content = buffer.toString("utf-8");
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }
    return content;
  }

  return iconv.decode(buffer, encoding);
}

/**
 * Parse a quoted string from SIE format
 * Handles escaped quotes and special characters
 */
function parseQuotedString(str: string): string {
  if (!str.startsWith('"')) {
    return str.trim();
  }

  // Find the closing quote, handling escaped quotes
  let result = "";
  let i = 1; // Skip opening quote

  while (i < str.length) {
    if (str[i] === '"') {
      if (i + 1 < str.length && str[i + 1] === '"') {
        // Escaped quote
        result += '"';
        i += 2;
      } else {
        // End of string
        break;
      }
    } else {
      result += str[i];
      i++;
    }
  }

  return result;
}

/**
 * Parse a SIE line into tokens
 * Handles quoted strings and curly brace blocks
 */
function tokenizeSIELine(line: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inQuotes = false;
  let braceDepth = 0;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && braceDepth === 0) {
      if (inQuotes) {
        // Check for escaped quote
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '""';
          i++;
          continue;
        }
        inQuotes = false;
        current += char;
      } else {
        inQuotes = true;
        current += char;
      }
    } else if (char === "{" && !inQuotes) {
      braceDepth++;
      current += char;
    } else if (char === "}" && !inQuotes) {
      braceDepth--;
      current += char;
    } else if ((char === " " || char === "\t") && !inQuotes && braceDepth === 0) {
      if (current.trim()) {
        tokens.push(current.trim());
        current = "";
      }
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    tokens.push(current.trim());
  }

  return tokens;
}

/**
 * Parse an object list from SIE format
 * Format: {} or {dim1 object1 dim2 object2 ...}
 */
function parseObjectList(str: string): string[] {
  if (!str || str === "{}" || str === "{ }") {
    return [];
  }

  const content = str.replace(/^\{|\}$/g, "").trim();
  if (!content) {
    return [];
  }

  return content.split(/\s+/).filter(Boolean);
}

/**
 * Parse a SIE4 date (YYYYMMDD) to ISO format (YYYY-MM-DD)
 */
function parseSIEDate(dateStr: string): string | null {
  if (!dateStr || dateStr.length !== 8) {
    return null;
  }

  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);

  // Validate
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);

  if (
    isNaN(yearNum) ||
    isNaN(monthNum) ||
    isNaN(dayNum) ||
    monthNum < 1 ||
    monthNum > 12 ||
    dayNum < 1 ||
    dayNum > 31
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Parse a #TRANS line
 * Format: #TRANS accountNumber {objectList} amount [transactionDate] [description] [quantity] [sign]
 */
function parseTRANS(tokens: string[]): SIE4Transaction | null {
  if (tokens.length < 3) {
    return null;
  }

  const accountNumber = parseInt(tokens[0], 10);
  if (isNaN(accountNumber)) {
    return null;
  }

  const objectList = parseObjectList(tokens[1]);

  const amount = parseFloat(tokens[2].replace(",", "."));
  if (isNaN(amount)) {
    return null;
  }

  const transaction: SIE4Transaction = {
    accountNumber,
    objectList,
    amount,
  };

  // Optional fields
  if (tokens[3]) {
    const transDate = parseSIEDate(tokens[3]);
    if (transDate) {
      transaction.transactionDate = transDate;
    }
  }

  if (tokens[4]) {
    transaction.description = parseQuotedString(tokens[4]);
  }

  if (tokens[5]) {
    const qty = parseFloat(tokens[5].replace(",", "."));
    if (!isNaN(qty)) {
      transaction.quantity = qty;
    }
  }

  if (tokens[6]) {
    transaction.sign = parseQuotedString(tokens[6]);
  }

  return transaction;
}

/**
 * Parse SIE4 file content
 */
export function parseSIE4(content: string): SIE4ParseResult {
  const result: SIE4ParseResult = {
    verifications: [],
    errors: [],
  };

  const lines = content.split(/\r?\n/);
  let currentVerification: SIE4Verification | null = null;
  let inVerificationBlock = false;
  let lineNumber = 0;

  for (const rawLine of lines) {
    lineNumber++;
    const line = rawLine.trim();

    if (!line || line.startsWith("//")) {
      continue;
    }

    // Start of verification block
    if (line === "{") {
      inVerificationBlock = true;
      continue;
    }

    // End of verification block
    if (line === "}") {
      if (currentVerification) {
        result.verifications.push(currentVerification);
        currentVerification = null;
      }
      inVerificationBlock = false;
      continue;
    }

    // Parse directive lines (starting with #)
    if (line.startsWith("#")) {
      const spaceIndex = line.indexOf(" ");
      const directive =
        spaceIndex > 0 ? line.substring(0, spaceIndex).toUpperCase() : line.toUpperCase();
      const rest = spaceIndex > 0 ? line.substring(spaceIndex + 1) : "";
      const tokens = rest ? tokenizeSIELine(rest) : [];

      switch (directive) {
        case "#FNAMN":
          result.companyName = parseQuotedString(tokens[0] || "");
          break;

        case "#ORGNR":
          result.orgNumber = tokens[0]?.replace(/-/g, "") || undefined;
          break;

        case "#RAR":
          // Fiscal year: #RAR yearIndex startDate endDate
          if (tokens.length >= 3) {
            const yearIndex = parseInt(tokens[0], 10);
            if (yearIndex === 0) {
              // Current fiscal year
              const start = parseSIEDate(tokens[1]);
              const end = parseSIEDate(tokens[2]);
              if (start) result.fiscalYearStart = start;
              if (end) result.fiscalYearEnd = end;
            }
          }
          break;

        case "#VER":
          // Verification header: #VER series verificationNumber date description [regDate] [sign]
          if (tokens.length >= 3) {
            const series = parseQuotedString(tokens[0]);
            const verificationNumber = parseQuotedString(tokens[1]);
            const date = parseSIEDate(tokens[2]);

            if (date) {
              currentVerification = {
                series,
                verificationNumber,
                date,
                description: tokens[3] ? parseQuotedString(tokens[3]) : "",
                transactions: [],
              };

              if (tokens[4]) {
                const regDate = parseSIEDate(tokens[4]);
                if (regDate) {
                  currentVerification.regDate = regDate;
                }
              }

              if (tokens[5]) {
                currentVerification.sign = parseQuotedString(tokens[5]);
              }
            } else {
              result.errors.push(`Rad ${lineNumber}: Ogiltigt datum i verifikation`);
            }
          } else {
            result.errors.push(`Rad ${lineNumber}: Ofullständig verifikationsrad`);
          }
          break;

        case "#TRANS":
          // Transaction line within verification block
          if (currentVerification && inVerificationBlock) {
            const transaction = parseTRANS(tokens);
            if (transaction) {
              currentVerification.transactions.push(transaction);
            } else {
              result.errors.push(`Rad ${lineNumber}: Kunde inte tolka transaktionsrad`);
            }
          }
          break;

        // Handle other common SIE directives silently
        case "#FLAGGA":
        case "#FORMAT":
        case "#SIETYP":
        case "#PROGRAM":
        case "#GEN":
        case "#KPTYP":
        case "#KONTO":
        case "#SRU":
        case "#DIM":
        case "#OBJEKT":
        case "#IB":
        case "#UB":
        case "#OIB":
        case "#OUB":
        case "#RES":
        case "#PSALDO":
        case "#PBUDGET":
        case "#KSUMMA":
          // Silently ignore these directives
          break;

        default:
          // Unknown directive, ignore but log if in debug mode
          break;
      }
    }
  }

  // Handle case where file ends without closing brace
  if (currentVerification) {
    result.verifications.push(currentVerification);
  }

  return result;
}

/**
 * Parse SIE4 from a Buffer (handles encoding detection)
 */
export function parseSIE4FromBuffer(buffer: Buffer): SIE4ParseResult {
  const content = decodeSIEContent(buffer);
  return parseSIE4(content);
}

/**
 * Normalize SIE4 verifications to bank transaction format
 * Each transaction line becomes a separate bank transaction
 */
export function normalizeSIE4ToTransactions(
  parseResult: SIE4ParseResult
): NormalizedBankTransaction[] {
  const transactions: NormalizedBankTransaction[] = [];

  for (const verification of parseResult.verifications) {
    for (const trans of verification.transactions) {
      // Use transaction date if available, otherwise verification date
      const date = trans.transactionDate || verification.date;

      // Build reference from verification description and transaction description
      const refParts: string[] = [];
      if (verification.description) {
        refParts.push(verification.description);
      }
      if (trans.description && trans.description !== verification.description) {
        refParts.push(trans.description);
      }

      transactions.push({
        accountingDate: date,
        amount: trans.amount,
        reference: refParts.join(" - ") || `Ver ${verification.series}${verification.verificationNumber}`,
        accountNumber: trans.accountNumber,
        verificationSeries: verification.series,
        verificationNumber: verification.verificationNumber,
      });
    }
  }

  return transactions;
}

/**
 * Filter bank account transactions (accounts 1900-1999)
 * Useful for extracting only bank-related transactions
 */
export function filterBankAccountTransactions(
  transactions: NormalizedBankTransaction[]
): NormalizedBankTransaction[] {
  return transactions.filter(
    (t) => t.accountNumber !== undefined && t.accountNumber >= 1900 && t.accountNumber <= 1999
  );
}

/**
 * Detect if a file is SIE format
 */
export function isSIEFile(fileName: string, content: string): boolean {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".se") || lowerName.endsWith(".si") || lowerName.endsWith(".sie")) {
    return true;
  }

  // Check content for SIE markers (both SIE4 and SIE5)
  if (content.includes("#FLAGGA") || content.includes("#SIETYP") || content.includes("#VER")) {
    return true;
  }

  // Check for SIE5 XML format
  if (isSIE5Format(content)) {
    return true;
  }

  return false;
}

// =============================================================================
// UNIFIED SIE INTERFACE
// =============================================================================

export type SIEFormat = "sie4" | "sie5";

export interface UnifiedVerificationLine {
  accountNumber: number;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface UnifiedVerification {
  sourceId: string;
  date: string;
  description: string;
  lines: UnifiedVerificationLine[];
}

export interface UnifiedSIEParseResult {
  format: SIEFormat;
  verifications: UnifiedVerification[];
  accounts: Map<string, { name: string; type: string }>;
  companyName?: string;
  orgNumber?: string;
  fiscalYear?: { start: string; end: string };
  softwareProduct?: string;
  errors: string[];
  warnings: string[];
}

/**
 * Detect SIE format from content
 */
export function detectSIEFormat(content: string): SIEFormat {
  if (isSIE5Format(content)) {
    return "sie5";
  }
  return "sie4";
}

/**
 * Convert SIE4 parse result to unified format
 */
function convertSIE4ToUnified(result: SIE4ParseResult): UnifiedSIEParseResult {
  const verifications: UnifiedVerification[] = [];
  const accounts = new Map<string, { name: string; type: string }>();

  for (const ver of result.verifications) {
    const lines: UnifiedVerificationLine[] = [];

    for (const trans of ver.transactions) {
      const accountNum = trans.accountNumber;
      const accountName = `Konto ${accountNum}`;

      // Ensure account is in map
      if (!accounts.has(String(accountNum))) {
        accounts.set(String(accountNum), { name: accountName, type: "unknown" });
      }

      const debit = trans.amount >= 0 ? trans.amount : 0;
      const credit = trans.amount < 0 ? Math.abs(trans.amount) : 0;

      lines.push({
        accountNumber: accountNum,
        accountName,
        debit,
        credit,
        description: trans.description,
      });
    }

    verifications.push({
      sourceId: `${ver.series}${ver.verificationNumber}`,
      date: ver.date,
      description: ver.description,
      lines,
    });
  }

  return {
    format: "sie4",
    verifications,
    accounts,
    companyName: result.companyName,
    orgNumber: result.orgNumber,
    fiscalYear:
      result.fiscalYearStart && result.fiscalYearEnd
        ? { start: result.fiscalYearStart, end: result.fiscalYearEnd }
        : undefined,
    errors: result.errors,
    warnings: [],
  };
}

/**
 * Convert SIE5 parse result to unified format
 */
function convertSIE5ToUnified(result: SIE5ParseResult): UnifiedSIEParseResult {
  const verifications: UnifiedVerification[] = [];

  for (const entry of result.journalEntries) {
    const lines: UnifiedVerificationLine[] = [];

    for (const ledger of entry.ledgerEntries) {
      const account = result.accounts.get(ledger.accountId);
      const accountName = account?.name || `Konto ${ledger.accountId}`;
      const { debit, credit } = amountToDebitCredit(ledger.amount, account?.type);

      lines.push({
        accountNumber: parseInt(ledger.accountId, 10),
        accountName,
        debit,
        credit,
        description: ledger.text,
      });
    }

    verifications.push({
      sourceId: `${entry.journalId}-${entry.id}`,
      date: entry.journalDate,
      description: entry.text,
      lines,
    });
  }

  // Find primary fiscal year
  const primaryFY = result.fiscalYears.find((fy) => fy.primary) || result.fiscalYears[0];

  return {
    format: "sie5",
    verifications,
    accounts: new Map(
      Array.from(result.accounts.entries()).map(([id, acc]) => [
        id,
        { name: acc.name, type: acc.type },
      ])
    ),
    companyName: result.companyName,
    orgNumber: result.orgNumber,
    fiscalYear: primaryFY ? { start: primaryFY.start, end: primaryFY.end } : undefined,
    softwareProduct: result.softwareProduct,
    errors: result.errors,
    warnings: result.warnings,
  };
}

/**
 * Parse SIE file content (auto-detects format)
 */
export function parseSIEFile(content: string): UnifiedSIEParseResult {
  const format = detectSIEFormat(content);

  if (format === "sie5") {
    const result = parseSIE5(content);
    return convertSIE5ToUnified(result);
  }

  const result = parseSIE4(content);
  return convertSIE4ToUnified(result);
}

/**
 * Parse SIE file from Buffer (handles encoding for SIE4)
 */
export function parseSIEFileFromBuffer(buffer: Buffer): UnifiedSIEParseResult {
  // First, try to detect if it's SIE5 by checking for XML markers
  const start = buffer.slice(0, 100).toString("utf-8");
  if (isSIE5Format(start)) {
    // SIE5 is always UTF-8
    const content = buffer.toString("utf-8");
    const result = parseSIE5(content);
    return convertSIE5ToUnified(result);
  }

  // SIE4 - use encoding detection
  const content = decodeSIEContent(buffer);
  const result = parseSIE4(content);
  return convertSIE4ToUnified(result);
}

/**
 * Validate that a verification balances
 */
export function validateVerificationBalance(verification: UnifiedVerification): {
  balanced: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
} {
  const totalDebit = verification.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = verification.lines.reduce((sum, line) => sum + line.credit, 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const balanced = difference < 0.01;

  return { balanced, totalDebit, totalCredit, difference };
}

/**
 * Filter verifications by date range
 */
export function filterVerificationsByDateRange(
  verifications: UnifiedVerification[],
  startDate: string,
  endDate: string
): UnifiedVerification[] {
  return verifications.filter((v) => v.date >= startDate && v.date <= endDate);
}

/**
 * Create a hash for duplicate detection
 */
export function hashVerification(verification: UnifiedVerification): string {
  const sortedLines = [...verification.lines]
    .sort((a, b) => a.accountNumber - b.accountNumber || a.debit - b.debit || a.credit - b.credit)
    .map((l) => `${l.accountNumber}:${l.debit}:${l.credit}`)
    .join("|");

  return `${verification.date}:${verification.description}:${sortedLines}`;
}

// Re-export SIE5 types for convenience
export { isSIE5Format } from "./sie5-import";
export type { SIE5ParseResult, SIE5JournalEntry } from "./sie5-import";
