import Link from "next/link";

interface Period {
  id: string;
  label: string;
  urlSlug: string;
  startDate: string;
  endDate: string;
  verificationCount: number;
}

interface PeriodsListProps {
  periods: Period[];
  workspaceSlug: string;
  currentPeriodId?: string;
}

export function PeriodsList({ periods, workspaceSlug, currentPeriodId }: PeriodsListProps) {
  if (periods.length === 0) {
    return (
      <div className="rounded-lg ring-1 ring-border ring-dashed p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Bokföringsperioder
        </h3>
        <p className="text-sm text-muted-foreground">
          Skapa din första period via sidomenyn.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg ring-1 ring-border p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Bokföringsperioder
      </h3>
      <div className="space-y-2">
        {periods.map((period) => {
          const isActive = period.id === currentPeriodId;
          return (
            <Link
              key={period.id}
              href={`/${workspaceSlug}/${period.urlSlug}`}
              className={`block rounded-md px-3 py-2 transition-colors ${
                isActive
                  ? "bg-accent"
                  : "hover:bg-accent/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{period.label}</span>
                <span className="text-xs text-muted-foreground">
                  {period.verificationCount}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {period.startDate} — {period.endDate}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
