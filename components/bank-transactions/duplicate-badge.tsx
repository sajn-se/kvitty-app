"use client";

import { Warning, Copy } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import type { DuplicateMatch } from "@/hooks/use-duplicate-check";

interface DuplicateBadgeProps {
  matches: DuplicateMatch[];
}

export function DuplicateBadge({ matches }: DuplicateBadgeProps) {
  if (matches.length === 0) {
    return null;
  }

  const dbMatches = matches.filter((m) => m.type === "database");
  const batchMatches = matches.filter((m) => m.type === "batch");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 cursor-help h-5 gap-1 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
        >
          <Warning className="size-3" weight="fill" />
          <span className="text-xs">Dubblett</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs bg-background text-foreground border">
        <div className="space-y-2 text-xs">
          {dbMatches.length > 0 && (
            <div>
              <div className="font-semibold mb-1">Finns redan i databasen:</div>
              {dbMatches.slice(0, 3).map((match, i) => (
                <div key={i} className="text-muted-foreground">
                  {format(new Date(match.accountingDate), "d MMM yyyy", {
                    locale: sv,
                  })}{" "}
                  -{" "}
                  {parseFloat(match.amount).toLocaleString("sv-SE", {
                    style: "currency",
                    currency: "SEK",
                  })}
                  {match.reference && (
                    <span className="block truncate max-w-[200px]">
                      {match.reference}
                    </span>
                  )}
                </div>
              ))}
              {dbMatches.length > 3 && (
                <div className="text-muted-foreground">
                  +{dbMatches.length - 3} fler...
                </div>
              )}
            </div>
          )}

          {batchMatches.length > 0 && (
            <div>
              <div className="font-semibold mb-1 flex items-center gap-1">
                <Copy className="size-3" />
                Dubbletter i denna batch
              </div>
              <div className="text-muted-foreground">
                En annan rad har samma datum och belopp
              </div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
