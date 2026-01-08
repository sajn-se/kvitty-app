"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, TextT } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { InvoiceLineRow } from "@/components/invoices/invoice-line-row";
import type { InvoiceLine, Product } from "@/lib/db/schema";

interface InvoiceLineWithProduct extends InvoiceLine {
  product: Product | null;
}

interface InvoiceLinesSectionProps {
  workspaceId: string;
  invoiceId: string;
  lines: InvoiceLineWithProduct[];
  isDraft: boolean;
  rotRutType?: "rot" | "rut" | null;
  onAddProduct?: () => void;
  onAddTextLine?: () => void;
}

export function InvoiceLinesSection({
  workspaceId,
  invoiceId,
  lines,
  isDraft,
  rotRutType,
  onAddProduct,
  onAddTextLine,
}: InvoiceLinesSectionProps) {
  const utils = trpc.useUtils();

  const reorderLines = trpc.invoices.reorderLines.useMutation({
    onSuccess: () => utils.invoices.get.invalidate({ workspaceId, id: invoiceId }),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = lines.findIndex((l) => l.id === active.id);
      const newIndex = lines.findIndex((l) => l.id === over.id);
      const newOrder = arrayMove(lines, oldIndex, newIndex);

      reorderLines.mutate({
        workspaceId,
        invoiceId,
        lineIds: newOrder.map((l) => l.id),
      });
    }
  };

  return (
    <div className="space-y-2">
      {lines.length > 0 && (
        <>
          {/* Header */}
          <div className={`grid ${rotRutType ? "grid-cols-[auto_1fr_80px_80px_80px_80px_100px_120px_80px]" : "grid-cols-[auto_1fr_80px_80px_80px_80px_100px_80px]"} gap-2 px-3 py-2 text-sm text-muted-foreground font-medium border-b`}>
            <div className="w-6" />
            <div>Beskrivning</div>
            <div className="text-right">Antal</div>
            <div>Enhet</div>
            <div className="text-right">Pris</div>
            <div>Moms</div>
            <div className="text-right">Belopp</div>
            {rotRutType && <div>ROT/RUT</div>}
            <div />
          </div>

          {/* Lines */}
          {isDraft ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={lines.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {lines.map((line) => (
                  <InvoiceLineRow
                    key={line.id}
                    line={line}
                    workspaceId={workspaceId}
                    invoiceId={invoiceId}
                    isDraft={isDraft}
                    rotRutType={rotRutType}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            lines.map((line) => (
              <InvoiceLineRow
                key={line.id}
                line={line}
                workspaceId={workspaceId}
                invoiceId={invoiceId}
                isDraft={isDraft}
                rotRutType={rotRutType}
              />
            ))
          )}
        </>
      )}

      {/* Empty state or add buttons */}
      {isDraft && (
        <div className="pt-4 border-t">
          {lines.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-base font-medium mb-1">Inga rader ännu</p>
              <p className="text-sm">
                Lägg till produkter eller textrader nedan
              </p>
            </div>
          ) : null}
          <div className="flex gap-2">
            {onAddProduct && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddProduct}
              >
                <Plus className="size-4 mr-2" />
                Lägg till produkt
              </Button>
            )}
            {onAddTextLine && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddTextLine}
              >
                <TextT className="size-4 mr-2" />
                Ny textrad
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
