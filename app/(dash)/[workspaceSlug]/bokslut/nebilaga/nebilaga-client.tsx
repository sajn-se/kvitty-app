"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQueryState, parseAsString } from "nuqs";
import { ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PeriodSelector } from "@/components/reports/period-selector";
import { NebilagaForm } from "@/components/nebilaga/nebilaga-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Period {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

interface NebilagaPageClientProps {
  workspaceId: string;
  workspaceSlug: string;
  periods: Period[];
  defaultPeriodId: string;
}

export function NebilagaPageClient({
  workspaceId,
  workspaceSlug,
  periods,
  defaultPeriodId,
}: NebilagaPageClientProps) {
  const [selectedPeriodId, setSelectedPeriodId] = useQueryState(
    "period",
    parseAsString.withDefault(defaultPeriodId)
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingPeriodChange, setPendingPeriodChange] = useState<string | null>(null);

  const handleExportPdf = () => {
    // Open PDF in new tab
    window.open(
      `/api/reports/nebilaga/${selectedPeriodId}/pdf?workspaceId=${workspaceId}`,
      "_blank"
    );
  };

  const handlePeriodChange = useCallback((newPeriodId: string) => {
    if (hasUnsavedChanges) {
      // Show confirmation dialog
      setPendingPeriodChange(newPeriodId);
    } else {
      setSelectedPeriodId(newPeriodId);
    }
  }, [hasUnsavedChanges, setSelectedPeriodId]);

  const handleConfirmPeriodChange = () => {
    if (pendingPeriodChange) {
      setSelectedPeriodId(pendingPeriodChange);
      setHasUnsavedChanges(false);
      setPendingPeriodChange(null);
    }
  };

  const handleCancelPeriodChange = () => {
    setPendingPeriodChange(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${workspaceSlug}/bokslut`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">NE-bilaga</h1>
          <p className="text-sm text-muted-foreground">
            Bilaga till Inkomstdeklaration 1 för enskild firma
          </p>
        </div>
        <PeriodSelector
          periods={periods}
          selectedPeriodId={selectedPeriodId}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {/* NE-bilaga Form */}
      <NebilagaForm
        workspaceId={workspaceId}
        fiscalPeriodId={selectedPeriodId}
        onExportPdf={handleExportPdf}
        onHasChangesChange={setHasUnsavedChanges}
      />

      {/* Unsaved changes confirmation dialog */}
      <AlertDialog open={!!pendingPeriodChange} onOpenChange={() => setPendingPeriodChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Osparade ändringar</AlertDialogTitle>
            <AlertDialogDescription>
              Du har osparade ändringar i NE-bilagan. Om du byter period kommer dessa ändringar att försvinna.
              Vill du fortsätta ändå?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelPeriodChange}>
              Avbryt
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPeriodChange}>
              Byt period ändå
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
