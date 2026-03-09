"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { AddPeriodDialog } from "@/components/periods/add-period-dialog";

interface PeriodsPageActionsProps {
  workspaceId: string;
  workspaceSlug: string;
}

export function PeriodsPageActions({
  workspaceId,
  workspaceSlug,
}: PeriodsPageActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="size-4" />
        Ny period
      </Button>
      <AddPeriodDialog
        workspaceId={workspaceId}
        workspaceSlug={workspaceSlug}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
