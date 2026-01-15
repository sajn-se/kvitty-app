"use client";

import { Info, Warning } from "@phosphor-icons/react";
import { cn, formatNumberFromOre } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NebilagaFieldProps {
  field: string;
  label: string;
  value: number; // In öre
  isEditable?: boolean;
  isNegative?: boolean;
  description?: string;
  onChange?: (value: number) => void;
  onInfoClick?: () => void;
}

export function NebilagaField({
  field,
  label,
  value,
  isEditable = false,
  isNegative = false,
  description,
  onChange,
  onInfoClick,
}: NebilagaFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9-]/g, "");
    const numValue = parseInt(inputValue, 10) || 0;
    onChange?.(numValue * 100); // Convert to öre
  };

  const displayValue = value / 100; // Convert from öre to kr

  return (
    <div className="flex items-center justify-between gap-4 py-2 px-4 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="font-medium text-muted-foreground w-8 flex-shrink-0">
          {field}
        </span>
        <div className="flex-1 min-w-0">
          <span className="text-sm truncate block">{label}</span>
          {description && (
            <span className="text-xs text-muted-foreground truncate block">
              {description}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isEditable ? (
          <Input
            type="text"
            inputMode="numeric"
            value={displayValue === 0 ? "" : displayValue}
            onChange={handleChange}
            placeholder="0"
            className="w-32 text-right font-mono"
          />
        ) : (
          <span
            className={cn(
              "font-mono text-right w-32",
              isNegative && "text-red-600 font-medium"
            )}
          >
            {formatNumberFromOre(value)}
          </span>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-8 flex-shrink-0",
                  isNegative && "text-red-600"
                )}
                onClick={onInfoClick}
              >
                {isNegative ? (
                  <Warning className="size-4" />
                ) : (
                  <Info className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isNegative
                ? "Negativt saldo - klicka för detaljer"
                : "Visa mappade konton och verifikationer"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
