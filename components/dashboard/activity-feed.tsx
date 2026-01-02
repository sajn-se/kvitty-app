import Link from "next/link";

interface ActivityItem {
  id: string;
  type: "verification" | "audit";
  reference?: string | null;
  amount?: string | null;
  action?: string;
  entityType?: string;
  periodLabel?: string;
  periodSlug?: string;
  userName?: string | null;
  timestamp: Date;
}

interface ActivityFeedProps {
  items: ActivityItem[];
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
  }).format(num);
}

function getActionLabel(action: string): string {
  switch (action) {
    case "create":
      return "skapade";
    case "update":
      return "uppdaterade";
    case "delete":
      return "raderade";
    default:
      return action;
  }
}

function getEntityLabel(entityType: string): string {
  switch (entityType) {
    case "verification":
      return "verifikation";
    case "attachment":
      return "bilaga";
    case "comment":
      return "kommentar";
    default:
      return entityType;
  }
}

export function ActivityFeed({ items, workspaceSlug }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg ring-1 ring-border p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Senaste aktivitet
        </h3>
        <p className="text-sm text-muted-foreground">Ingen aktivitet ännu</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg ring-1 ring-border p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Senaste aktivitet
      </h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {item.type === "verification" ? (
                <>
                  <p className="text-sm font-medium truncate">
                    {item.reference || "Utan referens"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.amount ? formatCurrency(item.amount) : "—"}
                    {item.periodLabel && (
                      <> &middot; {item.periodLabel}</>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm">
                    <span className="font-medium">{item.userName || "Användare"}</span>{" "}
                    {getActionLabel(item.action || "")}{" "}
                    {getEntityLabel(item.entityType || "")}
                  </p>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {formatRelativeTime(item.timestamp)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
