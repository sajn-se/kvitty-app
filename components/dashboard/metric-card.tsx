interface MetricCardProps {
  label: string;
  value: string;
  secondary?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
}

export function MetricCard({ label, value, secondary, trend }: MetricCardProps) {
  return (
    <div className="rounded-lg ring-1 ring-border p-6">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {secondary && (
        <p className="mt-1 text-sm text-muted-foreground">{secondary}</p>
      )}
      {trend && (
        <p
          className={`mt-1 text-sm font-medium ${
            trend.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {trend.positive ? "+" : ""}
          {trend.value}%
        </p>
      )}
    </div>
  );
}
