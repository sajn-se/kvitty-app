"use client";

import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc/client";

interface ExtractionSummaryProps {
  workspaceId: string;
  inboxAttachmentId: string;
}

function formatAmount(amount: string | null, currency: string | null) {
  if (!amount) return null;
  const num = parseFloat(amount);
  const cur = currency || "SEK";
  try {
    return new Intl.NumberFormat("sv-SE", { style: "currency", currency: cur }).format(num);
  } catch {
    return `${num.toFixed(2)} ${cur}`;
  }
}

export function ExtractionSummary({
  workspaceId,
  inboxAttachmentId,
}: ExtractionSummaryProps) {
  const { data: extraction, isLoading } = trpc.documentExtractions.getForAttachment.useQuery(
    { workspaceId, inboxAttachmentId },
    { retry: false }
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
        <Spinner className="size-3" />
        <span>Analyserar...</span>
      </div>
    );
  }

  if (!extraction) return null;

  if (extraction.status === "failed") {
    return (
      <p className="text-xs text-destructive mt-1">
        Kunde inte analysera dokumentet
      </p>
    );
  }

  if (extraction.status === "pending") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
        <Spinner className="size-3" />
        <span>Analyserar...</span>
      </div>
    );
  }

  return (
    <div className="mt-2 p-2 bg-muted/50 rounded text-xs space-y-1">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs h-5">AI</Badge>
        {extraction.vendor && (
          <span className="font-medium">{extraction.vendor}</span>
        )}
      </div>
      <div className="flex items-center gap-3 text-muted-foreground">
        {extraction.totalAmount && (
          <span>{formatAmount(extraction.totalAmount, extraction.currency)}</span>
        )}
        {extraction.date && <span>{extraction.date}</span>}
        {extraction.vatAmount && (
          <span>Moms: {formatAmount(extraction.vatAmount, extraction.currency)}</span>
        )}
      </div>
      {extraction.description && (
        <p className="text-muted-foreground">{extraction.description}</p>
      )}
    </div>
  );
}
