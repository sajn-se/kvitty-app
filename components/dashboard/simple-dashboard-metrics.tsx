import { MetricCard } from "./metric-card";

interface SimpleDashboardMetricsProps {
  totalTransactions: number;
  periodTransactions: number;
  totalAttachments: number;
  periodLabel?: string;
}

export function SimpleDashboardMetrics({
  totalTransactions,
  periodTransactions,
  totalAttachments,
  periodLabel,
}: SimpleDashboardMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        label="Transaktioner"
        value={totalTransactions.toString()}
        secondary="totalt"
      />
      <MetricCard
        label="Denna period"
        value={periodTransactions.toString()}
        secondary={periodLabel || "transaktioner"}
      />
      <MetricCard
        label="Underlag"
        value={totalAttachments.toString()}
        secondary="uppladdade filer"
      />
    </div>
  );
}
