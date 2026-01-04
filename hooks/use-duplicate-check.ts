"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";

interface TransactionRow {
  id: string;
  accountingDate: string;
  amount: string;
}

export interface DuplicateMatch {
  transactionId: string;
  accountingDate: string;
  amount: string;
  reference: string | null;
  type: "database" | "batch";
}

export interface DuplicateInfo {
  isDuplicate: boolean;
  matches: DuplicateMatch[];
}

const DEBOUNCE_MS = 500;

export function useDuplicateCheck(
  workspaceId: string,
  rows: TransactionRow[],
  enabled: boolean = true
) {
  const [debouncedRows, setDebouncedRows] = useState<TransactionRow[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce row changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Only include rows with valid date and amount
      const validRows = rows.filter(
        (row) =>
          row.accountingDate &&
          row.amount &&
          !isNaN(parseFloat(row.amount))
      );
      setDebouncedRows(validRows);
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [rows]);

  // Prepare query input
  const queryInput = useMemo(
    () => ({
      workspaceId,
      transactions: debouncedRows.map((row) => ({
        rowId: row.id,
        accountingDate: row.accountingDate,
        amount: parseFloat(row.amount),
      })),
    }),
    [workspaceId, debouncedRows]
  );

  // Run the query
  const { data, isLoading, isFetching } =
    trpc.bankTransactions.checkDuplicates.useQuery(queryInput, {
      enabled: enabled && debouncedRows.length > 0,
      staleTime: 0,
    });

  // Build result map
  const duplicateMap = useMemo(() => {
    const map = new Map<string, DuplicateInfo>();
    if (data) {
      for (const [rowId, result] of Object.entries(data)) {
        map.set(rowId, {
          isDuplicate: result.isDuplicate,
          matches: result.matches,
        });
      }
    }
    return map;
  }, [data]);

  return {
    duplicateMap,
    isChecking: isLoading || isFetching,
  };
}
