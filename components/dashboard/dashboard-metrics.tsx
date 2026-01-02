import { MetricCard } from "./metric-card";

interface DashboardMetricsProps {
  totalAmount: number;
  verificationCount: number;
  latestBalance: number | null;
  periodLabel?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DashboardMetrics({
  totalAmount,
  verificationCount,
  latestBalance,
  periodLabel,
}: DashboardMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        label="Totalt belopp"
        value={formatCurrency(totalAmount)}
        secondary={periodLabel}
      />
      <MetricCard
        label="Verifikationer"
        value={verificationCount.toString()}
        secondary="totalt"
      />
      <MetricCard
        label="Senaste saldo"
        value={latestBalance !== null ? formatCurrency(latestBalance) : "—"}
        secondary={latestBalance !== null ? "bokfört" : "ingen data"}
      />
    </div>
  );
}
