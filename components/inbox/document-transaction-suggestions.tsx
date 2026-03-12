"use client";

import { Check, X } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

interface DocumentTransactionSuggestionsProps {
  workspaceId: string;
  inboxAttachmentId: string;
}

function getScoreLabel(score: string | null): { label: string; variant: "default" | "secondary" | "destructive" } {
  const s = parseFloat(score || "0");
  if (s >= 0.7) return { label: "Hog", variant: "default" };
  if (s >= 0.4) return { label: "Medium", variant: "secondary" };
  return { label: "Lag", variant: "destructive" };
}

function formatCurrency(value: string | null) {
  if (!value) return "-";
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(parseFloat(value));
}

export function DocumentTransactionSuggestions({
  workspaceId,
  inboxAttachmentId,
}: DocumentTransactionSuggestionsProps) {
  const utils = trpc.useUtils();

  const { data: extraction, isLoading } = trpc.documentExtractions.getForAttachment.useQuery(
    { workspaceId, inboxAttachmentId },
    { retry: false }
  );

  const confirmMutation = trpc.documentExtractions.confirmMatch.useMutation({
    onSuccess: () => {
      utils.documentExtractions.getForAttachment.invalidate({ workspaceId, inboxAttachmentId });
      utils.inbox.list.invalidate({ workspaceId });
      toast.success("Dokumentet har kopplats till transaktionen");
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte koppla dokumentet");
    },
  });

  const dismissMutation = trpc.documentExtractions.dismissMatch.useMutation({
    onSuccess: () => {
      utils.documentExtractions.getForAttachment.invalidate({ workspaceId, inboxAttachmentId });
    },
  });

  if (isLoading || !extraction || extraction.status !== "completed") return null;

  const suggestions = extraction.matchSuggestions;
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">Matchande transaktioner</p>
      {suggestions.map((suggestion) => {
        const tx = suggestion.bankTransaction;
        const scoreInfo = getScoreLabel(suggestion.score);

        return (
          <div
            key={suggestion.id}
            className="flex items-center justify-between gap-2 p-2 bg-background border rounded text-xs"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-medium truncate">
                  {tx.reference || tx.accountingDate || "Transaktion"}
                </span>
                <Badge variant={scoreInfo.variant} className="text-[10px] h-4 px-1">
                  {scoreInfo.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{formatCurrency(tx.amount)}</span>
                {tx.accountingDate && <span>{tx.accountingDate}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2"
                onClick={() => confirmMutation.mutate({ workspaceId, suggestionId: suggestion.id })}
                disabled={confirmMutation.isPending || dismissMutation.isPending}
              >
                {confirmMutation.isPending ? (
                  <Spinner className="size-3" />
                ) : (
                  <>
                    <Check className="size-3 mr-0.5" />
                    Koppla
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs px-1"
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
  );
}
