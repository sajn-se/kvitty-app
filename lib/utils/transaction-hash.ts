/**
 * Transaction Hash Utility
 *
 * Generates deterministic hashes for bank transactions to detect duplicates.
 * Uses SHA256 for collision resistance.
 */

import { createHash } from "crypto";
import { db } from "@/lib/db";
import { bankTransactions } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export interface TransactionHashInput {
  date: string; // YYYY-MM-DD format
  amount: number;
  reference: string;
}

/**
 * Generate a SHA256 hash for a bank transaction
 *
 * The hash is based on:
 * - Date (YYYY-MM-DD)
 * - Amount (normalized to 2 decimal places)
 * - Reference (normalized: lowercase, trimmed, collapsed whitespace)
 *
 * This combination should uniquely identify a transaction.
 */
export function generateTransactionHash(input: TransactionHashInput): string {
  // Normalize inputs for consistent hashing
  const normalizedDate = input.date.trim();

  // Normalize amount to 2 decimal places
  const normalizedAmount = input.amount.toFixed(2);

  // Normalize reference: lowercase, trim, collapse whitespace
  const normalizedReference = input.reference
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

  // Create hash input string with delimiter to prevent collisions
  const hashInput = [normalizedDate, normalizedAmount, normalizedReference].join("|");

  // Generate SHA256 hash
  return createHash("sha256").update(hashInput, "utf8").digest("hex");
}

/**
 * Generate hashes for multiple transactions
 */
export function generateTransactionHashes(
  transactions: TransactionHashInput[]
): string[] {
  return transactions.map(generateTransactionHash);
}

export interface HashCheckResult {
  hash: string;
  exists: boolean;
  existingTransactionId?: string;
}

/**
 * Check if transaction hashes already exist in the database
 *
 * @param workspaceId - The workspace to check in
 * @param hashes - Array of hashes to check
 * @returns Map of hash to existing transaction info
 */
export async function checkExistingHashes(
  workspaceId: string,
  hashes: string[]
): Promise<Map<string, { transactionId: string }>> {
  if (hashes.length === 0) {
    return new Map();
  }

  // Query for existing transactions with these hashes
  const existingTransactions = await db.query.bankTransactions.findMany({
    where: and(
      eq(bankTransactions.workspaceId, workspaceId),
      inArray(bankTransactions.hash, hashes)
    ),
    columns: {
      id: true,
      hash: true,
    },
  });

  // Build result map
  const result = new Map<string, { transactionId: string }>();
  for (const transaction of existingTransactions) {
    if (transaction.hash) {
      result.set(transaction.hash, { transactionId: transaction.id });
    }
  }

  return result;
}

/**
 * Check a batch of transactions for duplicates
 *
 * @param workspaceId - The workspace to check in
 * @param transactions - Transactions to check
 * @returns Object with duplicates map and unique transactions
 */
export async function checkTransactionsForDuplicates(
  workspaceId: string,
  transactions: Array<TransactionHashInput & { index: number }>
): Promise<{
  duplicates: Map<number, { hash: string; existingTransactionId: string }>;
  uniqueTransactions: Array<TransactionHashInput & { index: number; hash: string }>;
}> {
  // Generate hashes for all transactions
  const transactionsWithHashes = transactions.map((t) => ({
    ...t,
    hash: generateTransactionHash(t),
  }));

  // Get unique hashes
  const uniqueHashes = [...new Set(transactionsWithHashes.map((t) => t.hash))];

  // Check which hashes already exist
  const existingHashMap = await checkExistingHashes(workspaceId, uniqueHashes);

  // Separate duplicates from unique transactions
  const duplicates = new Map<number, { hash: string; existingTransactionId: string }>();
  const uniqueTransactions: Array<TransactionHashInput & { index: number; hash: string }> = [];

  // Also track hashes we've seen in this batch to detect intra-batch duplicates
  const seenHashes = new Map<string, number>(); // hash -> first index

  for (const transaction of transactionsWithHashes) {
    const existingTransaction = existingHashMap.get(transaction.hash);

    if (existingTransaction) {
      // Duplicate in database
      duplicates.set(transaction.index, {
        hash: transaction.hash,
        existingTransactionId: existingTransaction.transactionId,
      });
    } else if (seenHashes.has(transaction.hash)) {
      // Duplicate within the same batch - mark as duplicate of first occurrence
      // We'll handle this as a duplicate with no existing transaction ID
      duplicates.set(transaction.index, {
        hash: transaction.hash,
        existingTransactionId: "", // Empty string indicates intra-batch duplicate
      });
    } else {
      // New unique transaction
      seenHashes.set(transaction.hash, transaction.index);
      uniqueTransactions.push(transaction);
    }
  }

  return { duplicates, uniqueTransactions };
}

/**
 * Validate and normalize a date string for hashing
 */
export function normalizeDate(dateStr: string): string | null {
  // Try to parse various date formats
  const trimmed = dateStr.trim();

  // Already in correct format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // YYYYMMDD format
  if (/^\d{8}$/.test(trimmed)) {
    return `${trimmed.substring(0, 4)}-${trimmed.substring(4, 6)}-${trimmed.substring(6, 8)}`;
  }

  // Try parsing with Date
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return date.toISOString().substring(0, 10);
  }

  return null;
}

/**
 * Create hash input from transaction data
 */
export function createHashInput(
  date: string | null,
  amount: string | number | null,
  reference: string | null
): TransactionHashInput | null {
  // Validate date
  if (!date) return null;
  const normalizedDate = normalizeDate(date);
  if (!normalizedDate) return null;

  // Validate amount
  if (amount === null || amount === undefined) return null;
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return null;

  // Reference can be empty but should exist
  const normalizedReference = (reference || "").trim();

  return {
    date: normalizedDate,
    amount: numericAmount,
    reference: normalizedReference,
  };
}
