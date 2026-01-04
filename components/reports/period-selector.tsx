"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Period {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isLocked?: boolean;
}

interface PeriodSelectorProps {
  periods: Period[];
  selectedPeriodId: string;
  onPeriodChange: (periodId: string) => void;
}

export function PeriodSelector({
  periods,
  selectedPeriodId,
  onPeriodChange,
}: PeriodSelectorProps) {
  return (
    <Select value={selectedPeriodId} onValueChange={onPeriodChange}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Välj räkenskapsår" />
      </SelectTrigger>
      <SelectContent>
        {periods.map((period) => (
          <SelectItem key={period.id} value={period.id}>
            <div className="flex items-center gap-2">
              <span>{period.label}</span>
              {period.isLocked && (
                <span className="text-xs text-muted-foreground">(Låst)</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
