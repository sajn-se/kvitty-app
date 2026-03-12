// Approximate exchange rates to SEK for cross-currency matching
const APPROXIMATE_RATES: Record<string, number> = {
  SEK: 1,
  USD: 10.5,
  EUR: 11.5,
  GBP: 13.5,
  NOK: 1.0,
  DKK: 1.55,
};

const MIN_SCORE_THRESHOLD = 0.3;
const MAX_SUGGESTIONS = 5;

export interface MatchScore {
  score: number;
  amountMatch: boolean;
  dateMatch: boolean;
  textMatch: boolean;
}

function convertToSEK(amount: number, currency: string): number {
  const rate = APPROXIMATE_RATES[currency];
  if (!rate) return amount; // Unknown currency, assume SEK
  return amount * rate;
}

function scoreAmount(
  extractionAmount: number,
  extractionCurrency: string,
  transactionAmount: number
): { score: number; match: boolean } {
  const absTransaction = Math.abs(transactionAmount);
  const isCrossCurrency = extractionCurrency !== "SEK";

  const extractionInSEK = convertToSEK(extractionAmount, extractionCurrency);

  if (absTransaction === 0 && extractionInSEK === 0) {
    return { score: 0.5, match: true };
  }

  if (absTransaction === 0 || extractionInSEK === 0) {
    return { score: 0, match: false };
  }

  const diff = Math.abs(absTransaction - extractionInSEK) / Math.max(absTransaction, extractionInSEK);

  if (!isCrossCurrency) {
    if (diff === 0) return { score: 0.5, match: true };
    if (diff <= 0.01) return { score: 0.4, match: true };
    return { score: 0, match: false };
  }

  // Cross-currency: wider tolerance
  if (diff <= 0.05) return { score: 0.35, match: true };
  return { score: 0, match: false };
}

function scoreDate(
  extractionDate: string | null,
  transactionDate: string | null
): { score: number; match: boolean } {
  if (!extractionDate || !transactionDate) return { score: 0, match: false };

  const extDate = new Date(extractionDate);
  const txDate = new Date(transactionDate);
  const diffDays = Math.abs(
    (extDate.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 0.5) return { score: 0.3, match: true };
  if (diffDays <= 3) return { score: 0.2, match: true };
  if (diffDays <= 7) return { score: 0.1, match: true };
  return { score: 0, match: false };
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-zåäö0-9\s]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 1)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function scoreText(
  vendor: string | null,
  transactionReference: string | null
): { score: number; match: boolean } {
  if (!vendor || !transactionReference) return { score: 0, match: false };

  const vendorLower = vendor.toLowerCase();
  const refLower = transactionReference.toLowerCase();

  // Check if vendor name appears in transaction reference
  if (refLower.includes(vendorLower)) return { score: 0.2, match: true };

  // Check token overlap
  const vendorTokens = tokenize(vendor);
  const refTokens = tokenize(transactionReference);
  const similarity = jaccardSimilarity(vendorTokens, refTokens);

  if (similarity > 0.3) return { score: 0.1, match: true };
  return { score: 0, match: false };
}

export function calculateMatchScore(
  extraction: {
    totalAmount: string | null;
    currency: string | null;
    date: string | null;
    vendor: string | null;
  },
  transaction: {
    amount: string | null;
    accountingDate: string | null;
    reference: string | null;
  }
): MatchScore {
  const extractionAmount = parseFloat(extraction.totalAmount || "0");
  const transactionAmount = parseFloat(transaction.amount || "0");
  const currency = extraction.currency || "SEK";

  const amount = scoreAmount(extractionAmount, currency, transactionAmount);
  const dateResult = scoreDate(extraction.date, transaction.accountingDate);
  const text = scoreText(extraction.vendor, transaction.reference);

  return {
    score: parseFloat((amount.score + dateResult.score + text.score).toFixed(2)),
    amountMatch: amount.match,
    dateMatch: dateResult.match,
    textMatch: text.match,
  };
}

export function filterAndRankMatches<T extends { score: MatchScore }>(
  candidates: T[]
): T[] {
  return candidates
    .filter((c) => c.score.score >= MIN_SCORE_THRESHOLD)
    .sort((a, b) => b.score.score - a.score.score)
    .slice(0, MAX_SUGGESTIONS);
}

export { MIN_SCORE_THRESHOLD, MAX_SUGGESTIONS };
