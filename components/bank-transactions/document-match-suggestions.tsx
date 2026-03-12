"use client";

import { FilePdf, Check, X } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

interface DocumentMatchSuggestionsProps {
  workspaceId: string;
  bankTransactionId: string;
}

function getScoreLabel(score: string | null): { label: string; variant: "default" | "secondary" | "destructive" } {
  const s = parseFloat(score || "0");
  if (s >= 0.7) return { label: "Hog", variant: "default" };
  if (s >= 0.4) return { label: "Medium", variant: "secondary" };
  return { label: "Lag", variant: "destructive" };
}

function formatAmount(amount: string | null, currency: string | null) {
  if (!amount) return "-";
  const num = parseFloat(amount);
  const cur = currency || "SEK";
  try {
    return new Intl.NumberFormat("sv-SE", { style: "currency", currency: cur }).format(num);
  } catch {
    return `${num.toFixed(2)} ${cur}`;
  }
}

export function DocumentMatchSuggestions({
  workspaceId,
  bankTransactionId,
}: DocumentMatchSuggestionsProps) {
  const utils = trpc.useUtils();

  const { data: suggestions, isLoading } = trpc.documentExtractions.getSuggestionsForTransaction.useQuery(
    { workspaceId, bankTransactionId },
    { retry: false }
  );

  const confirmMutation = trpc.documentExtractions.confirmMatch.useMutation({
    onSuccess: () => {
      utils.documentExtractions.getSuggestionsForTransaction.invalidate({ workspaceId, bankTransactionId });
      utils.bankTransactions.get.invalidate({ workspaceId, bankTransactionId });
      utils.bankTransactions.list.invalidate({ workspaceId });
      toast.success("Dokumentet har kopplats till transaktionen");
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte koppla dokumentet");
    },
  });

  const dismissMutation = trpc.documentExtractions.dismissMatch.useMutation({
    onSuccess: () => {
      utils.documentExtractions.getSuggestionsForTransaction.invalidate({ workspaceId, bankTransactionId });
    },
  });

  if (isLoading) return null;
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mb-6 p-4 bg-muted/50 border rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <FilePdf className="size-4 text-primary" />
        <h4 className="text-sm font-medium">Matchande dokument</h4>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion) => {
          const extraction = suggestion.extraction;
          const attachment = extraction.inboxAttachment;
          const scoreInfo = getScoreLabel(suggestion.score);

          return (
            <div
              key={suggestion.id}
              className="flex items-center justify-between gap-3 p-3 bg-background border rounded-md"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {extraction.vendor || attachment.fileName}
                  </span>
                  <Badge variant={scoreInfo.variant} className="shrink-0 text-xs">
                    {scoreInfo.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {extraction.totalAmount && (
                    <span>{formatAmount(extraction.totalAmount, extraction.currency)}</span>
                  )}
                  {extraction.date && <span>{extraction.date}</span>}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {attachment.fileName}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => confirmMutation.mutate({ workspaceId, suggestionId: suggestion.id })}
                  disabled={confirmMutation.isPending || dismissMutation.isPending}
                >
                  {confirmMutation.isPending ? (
                    <Spinner className="size-3" />
                  ) : (
                    <>
                      <Check className="size-3 mr-1" />
                      Koppla
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => dismissMutation.mutate({ workspaceId, suggestionId: suggestion.id })}
                  disabled={confirmMutation.isPending || dismissMutation.isPending}
                >
                  <X className="size-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
