"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "@phosphor-icons/react";

interface AgiPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agiXml: string | null;
  period: string;
  runNumber: number;
}

export function AgiPreviewDialog({
  open,
  onOpenChange,
  agiXml,
  period,
  runNumber,
}: AgiPreviewDialogProps) {
  if (!agiXml) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Arbetsgivardeklarationsfil genererad</DialogTitle>
        </DialogHeader>

        <div className="overflow-auto max-h-[60vh] bg-muted p-4 rounded-lg">
          <pre className="text-xs font-mono whitespace-pre-wrap">{agiXml}</pre>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Stäng
          </Button>
          <Button
            onClick={() => {
              const blob = new Blob([agiXml], { type: "application/xml" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `AGI_${period}_${runNumber}.xml`;
              a.click();
            }}
          >
            <Download className="size-4 mr-2" />
            Ladda ner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

