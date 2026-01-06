"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  month: string;
  count: number;
}

interface SimpleVerificationChartProps {
  data: ChartDataPoint[];
}

export function SimpleVerificationChart({ data }: SimpleVerificationChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg ring-1 ring-border">
        <p className="text-sm text-muted-foreground">Ingen data att visa</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg ring-1 ring-border p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Transaktioner per månad
      </h3>
      <div className="h-[260px] **:focus:outline-none **:focus-visible:ring-0 **:focus-visible:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.488 0.243 264.376)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.488 0.243 264.376)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
              width={30}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-background)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => [value, "Transaktioner"]}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="oklch(0.488 0.243 264.376)"
              strokeWidth={2}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
