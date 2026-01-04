"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, CaretDown, CaretUp } from "@phosphor-icons/react";
import { type ReactNode } from "react";

export type StepStatus = "completed" | "active" | "locked";

interface WizardStepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  status: StepStatus;
  isExpanded: boolean;
  onToggle?: () => void;
  children?: ReactNode;
  completedLabel?: string;
}

export function WizardStepCard({
  stepNumber,
  title,
  description,
  status,
  isExpanded,
  onToggle,
  children,
  completedLabel,
}: WizardStepCardProps) {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isActive = status === "active";

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isLocked && "opacity-50 cursor-not-allowed",
        isActive && "ring-2 ring-primary",
        isCompleted && "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
      )}
    >
      <CardHeader
        className={cn(
          "cursor-pointer select-none",
          isLocked && "cursor-not-allowed"
        )}
        onClick={() => !isLocked && onToggle?.()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold",
                isCompleted && "border-green-500 bg-green-500 text-white",
                isActive && "border-primary bg-primary text-primary-foreground",
                isLocked && "border-muted-foreground/30 bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="h-5 w-5" weight="bold" />
              ) : isLocked ? (
                <Lock className="h-4 w-4" />
              ) : (
                stepNumber
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && completedLabel && (
              <Badge variant="secondary" className="gap-1 text-green-700 dark:text-green-400">
                <Check className="h-3 w-3" />
                {completedLabel}
              </Badge>
            )}
            {!isLocked && (
              <div className="text-muted-foreground">
                {isExpanded ? (
                  <CaretUp className="h-5 w-5" />
                ) : (
                  <CaretDown className="h-5 w-5" />
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      {isExpanded && !isLocked && children && (
        <CardContent className="pt-0">{children}</CardContent>
      )}
    </Card>
  );
}
