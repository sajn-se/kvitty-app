import Link from "next/link";
import { Receipt, Paperclip } from "@phosphor-icons/react/dist/ssr";

interface TransactionItem {
  id: string;
  reference: string | null;
  amount: string | null;
  accountingDate: string | null;
  attachmentCount: number;
  createdByName?: string | null;
  createdAt: Date;
}

interface SimpleActivityFeedProps {
  items: TransactionItem[];
  workspaceSlug: string;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just nu";
  if (diffMins < 60) return `${diffMins} min sedan`;
  if (diffHours < 24) return `${diffHours} tim sedan`;
  if (diffDays < 7) return `${diffDays} dagar sedan`;

  return date.toLocaleDateString("sv-SE");
}

function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function SimpleActivityFeed({ items, workspaceSlug }: SimpleActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg ring-1 ring-border p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Senaste transaktioner
        </h3>
        <p className="text-sm text-muted-foreground">Inga transaktioner ännu</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg ring-1 ring-border p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Senaste transaktioner
      </h3>
      <div className="space-y-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/${workspaceSlug}/transaktioner/${item.id}`}
            className="flex items-start justify-between gap-4 group"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-muted-foreground shrink-0" weight="duotone" />
                <p className="text-sm font-medium truncate group-hover:text-primary">
                  {item.reference || "Utan referens"}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {item.amount ? formatCurrency(item.amount) : "—"}
                </p>
                {item.accountingDate && (
                  <span className="text-xs text-muted-foreground">
                    &middot; {item.accountingDate}
                  </span>
                )}
                {item.attachmentCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Paperclip className="size-3" />
                    {item.attachmentCount}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {formatRelativeTime(item.createdAt)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
