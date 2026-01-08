"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVertical, Trash, Pencil } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc/client";
import { unitLabels } from "@/lib/validations/product";
import { EditLineDialog } from "@/components/invoices/edit-line-dialog";
import type { InvoiceLine, Product } from "@/lib/db/schema";

interface InvoiceLineWithProduct extends InvoiceLine {
  product: Product | null;
}

interface InvoiceLineRowProps {
  line: InvoiceLineWithProduct;
  workspaceId: string;
  invoiceId: string;
  isDraft: boolean;
  rotRutType?: "rot" | "rut" | null;
}

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("sv-SE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function InvoiceLineRow({ line, workspaceId, invoiceId, isDraft, rotRutType }: InvoiceLineRowProps) {
  const utils = trpc.useUtils();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: line.id, disabled: !isDraft });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const deleteLine = trpc.invoices.deleteLine.useMutation({
    onSuccess: () => utils.invoices.get.invalidate({ workspaceId, id: invoiceId }),
  });

  const updateLine = trpc.invoices.updateLine.useMutation({
    onSuccess: () => utils.invoices.get.invalidate({ workspaceId, id: invoiceId }),
  });

  const handleToggleLabor = (checked: boolean) => {
    updateLine.mutate({
      workspaceId,
      lineId: line.id,
      invoiceId,
      isLabor: checked,
      // If setting as labor, unset material
      isMaterial: checked ? false : (line.isMaterial ?? false),
    });
  };

  const handleToggleMaterial = (checked: boolean) => {
    updateLine.mutate({
      workspaceId,
      lineId: line.id,
      invoiceId,
      isMaterial: checked,
      // If setting as material, unset labor
      isLabor: checked ? false : (line.isLabor ?? false),
    });
  };

  const isTextLine = line.lineType === "text";
  const lineAmount = parseFloat(line.amount);

  // Determine grid columns based on whether ROT/RUT is active
  const gridCols = rotRutType
    ? "grid-cols-[auto_1fr_80px_80px_80px_80px_100px_120px_80px]"
    : "grid-cols-[auto_1fr_80px_80px_80px_80px_100px_80px]";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid ${gridCols} gap-2 items-center px-3 py-3 rounded-md hover:bg-muted/50 group transition-colors`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`w-6 flex justify-center ${isDraft ? "cursor-grab" : ""}`}
      >
        {isDraft && (
          <DotsSixVertical className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
        )}
      </div>

      {/* Description */}
      {isDraft ? (
        <button
          onClick={() => setEditDialogOpen(true)}
          className="text-left truncate hover:text-primary cursor-pointer transition-colors"
        >
          {line.description}
        </button>
      ) : (
        <span className="truncate">{line.description}</span>
      )}

      {/* Quantity */}
      {isTextLine ? (
        <span className="text-right"></span>
      ) : (
        <span className="text-right">{line.quantity}</span>
      )}

      {/* Unit */}
      {isTextLine ? (
        <span></span>
      ) : (
        <span>{line.unit ? unitLabels[line.unit] : "-"}</span>
      )}

      {/* Unit Price */}
      {isTextLine ? (
        <span className="text-right"></span>
      ) : (
        <span className="text-right">{formatCurrency(line.unitPrice)}</span>
      )}

      {/* VAT Rate */}
      {isTextLine ? (
        <span></span>
      ) : (
        <span>{line.vatRate}%</span>
      )}

      {/* Amount */}
      <span className="text-right font-medium">
        {isTextLine ? "" : formatCurrency(lineAmount)}
      </span>

      {/* ROT/RUT Checkboxes */}
      {rotRutType && (
        <div className="flex items-center gap-3">
          {isTextLine ? (
            <span></span>
          ) : (
            <>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <Checkbox
                  checked={line.isLabor ?? false}
                  onCheckedChange={(checked) => handleToggleLabor(!!checked)}
                  disabled={!isDraft || updateLine.isPending}
                  className="size-3.5"
                />
                <span className="text-muted-foreground">Arbete</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <Checkbox
                  checked={line.isMaterial ?? false}
                  onCheckedChange={(checked) => handleToggleMaterial(!!checked)}
                  disabled={!isDraft || updateLine.isPending}
                  className="size-3.5"
                />
                <span className="text-muted-foreground">Material</span>
              </label>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      {isDraft && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setEditDialogOpen(true)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-red-600"
            onClick={() => {
              if (confirm("Ta bort denna rad?")) {
                deleteLine.mutate({ workspaceId, lineId: line.id, invoiceId });
              }
            }}
          >
            <Trash className="size-4" />
          </Button>
        </div>
      )}
      {editDialogOpen && (
        <EditLineDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          line={line}
          workspaceId={workspaceId}
          invoiceId={invoiceId}
          rotRutType={rotRutType}
        />
      )}
    </div>
  );
}
