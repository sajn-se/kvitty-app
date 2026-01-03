/**
 * SIE4 File Import Parser
 *
 * Parses Swedish SIE4 format accounting files.
 * SIE4 is the standard format for exchanging accounting data in Sweden.
 *
 * Key SIE4 elements handled:
 * - #VER: Verification (journal entry) header
 * - #TRANS: Transaction line within a verification
 * - Character encoding: CP437, Latin-1, or UTF-8
 */

import iconv from "iconv-lite";

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

  // Check content for SIE markers
  if (content.includes("#FLAGGA") || content.includes("#SIETYP") || content.includes("#VER")) {
    return true;
  }

  return false;
}
