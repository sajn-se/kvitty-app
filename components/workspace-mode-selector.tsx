"use client";

import { Files, Calculator, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { WorkspaceMode } from "@/lib/validations/workspace";

interface WorkspaceModeSelectorProps {
  value: WorkspaceMode;
  onChange: (mode: WorkspaceMode) => void;
  disabled?: boolean;
}

const modes: {
  value: WorkspaceMode;
  title: string;
  description: string;
  icon: typeof Files;
}[] = [
  {
    value: "simple",
    title: "Enkel",
    description: "Samla underlag och kvitton för din externa bokförare",
    icon: Files,
  },
  {
    value: "full_bookkeeping",
    title: "Bokföring",
    description: "Komplett bokföringssystem med löner, moms och arbetsgivardeklaration",
    icon: Calculator,
  },
];

export function WorkspaceModeSelector({
  value,
  onChange,
  disabled,
}: WorkspaceModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {modes.map((mode) => {
        const isSelected = value === mode.value;
        const Icon = mode.icon;

        return (
          <button
            key={mode.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(mode.value)}
            className={cn(
              "relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all",
              "hover:border-primary/50 hover:bg-muted/50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            )}
          >
            {isSelected && (
              <div className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" weight="bold" />
              </div>
            )}
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="size-5" weight="duotone" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium">{mode.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {mode.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
