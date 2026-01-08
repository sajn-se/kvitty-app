"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc/client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  unitLabels,
  productUnits,
  productTypes,
  productTypeLabels,
  type ProductUnit,
  type ProductType,
} from "@/lib/validations/product";
import type { InvoiceLine, Product } from "@/lib/db/schema";

interface InvoiceLineWithProduct extends InvoiceLine {
  product: Product | null;
}

interface EditLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  line: InvoiceLineWithProduct | null;
  workspaceId: string;
  invoiceId: string;
  rotRutType?: "rot" | "rut" | null;
}

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("sv-SE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function EditLineDialog({
  open,
  onOpenChange,
  line,
  workspaceId,
  invoiceId,
  rotRutType,
}: EditLineDialogProps) {
  const utils = trpc.useUtils();
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<ProductUnit>("styck");
  const [unitPrice, setUnitPrice] = useState("");
  const [vatRate, setVatRate] = useState("25");
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [isLabor, setIsLabor] = useState(false);
  const [isMaterial, setIsMaterial] = useState(false);

  useEffect(() => {
    if (line) {
      setDescription(line.description);
      setQuantity(line.quantity);
      setUnit((line.unit as ProductUnit) || "styck");
      setUnitPrice(line.unitPrice);
      setVatRate(String(line.vatRate));
      setProductType((line.productType as ProductType) || null);
      setIsLabor(line.isLabor ?? false);
      setIsMaterial(line.isMaterial ?? false);
    }
  }, [line]);

  const updateLine = trpc.invoices.updateLine.useMutation({
    onSuccess: () => {
      utils.invoices.get.invalidate({ workspaceId, id: invoiceId });
      onOpenChange(false);
    },
  });

  const handleSave = () => {
    if (!line) return;

    const updates: Record<string, unknown> = {
      workspaceId,
      lineId: line.id,
      invoiceId,
    };

    if (description !== line.description) {
      updates.description = description;
    }
    if (parseFloat(quantity) !== parseFloat(line.quantity)) {
      updates.quantity = parseFloat(quantity) || 1;
    }
    if (unit !== line.unit) {
      updates.unit = unit;
    }
    if (parseFloat(unitPrice) !== parseFloat(line.unitPrice)) {
      updates.unitPrice = parseFloat(unitPrice) || 0;
    }
    if (parseInt(vatRate) !== line.vatRate) {
      updates.vatRate = parseInt(vatRate) || 0;
    }
    if (productType !== (line.productType || null)) {
      updates.productType = productType;
    }
    if (isLabor !== (line.isLabor ?? false)) {
      updates.isLabor = isLabor;
    }
    if (isMaterial !== (line.isMaterial ?? false)) {
      updates.isMaterial = isMaterial;
    }

    if (Object.keys(updates).length > 3) {
      updateLine.mutate(updates as Parameters<typeof updateLine.mutate>[0]);
    } else {
      onOpenChange(false);
    }
  };

  if (!line) return null;

  const isTextLine = line.lineType === "text";
  const calculatedAmount = isTextLine
    ? 0
    : (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);
  const calculatedVat = calculatedAmount * (parseInt(vatRate) / 100);
  const calculatedTotal = calculatedAmount + calculatedVat;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-xl">
        <DialogHeader>
          <DialogTitle>Redigera rad</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <FieldGroup>
            <FieldLabel>Beskrivning</FieldLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskrivning"
              autoFocus
              rows={3}
            />
          </FieldGroup>

          {!isTextLine && (
            <>
              <div className="grid grid-cols-[1fr_200px] gap-4">
                <FieldGroup>
                  <FieldLabel>Antal</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1"
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Enhet</FieldLabel>
                  <Select value={unit} onValueChange={(v) => setUnit(v as ProductUnit)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productUnits.map((u) => (
                        <SelectItem key={u} value={u}>
                          {unitLabels[u]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </div>

              <div className="grid grid-cols-[1fr_200px] gap-4">
                <FieldGroup>
                  <FieldLabel>Pris / enhet ex moms</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Moms</FieldLabel>
                  <Select value={vatRate} onValueChange={setVatRate}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="6">6%</SelectItem>
                      <SelectItem value="0">0%</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </div>

              <FieldGroup>
                <FieldLabel>Typ</FieldLabel>
                <Select
                  value={productType || "none"}
                  onValueChange={(v) => setProductType(v === "none" ? null : (v as ProductType))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-</SelectItem>
                    {productTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {productTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>

              {/* ROT/RUT Classification */}
              {rotRutType && (
                <FieldGroup>
                  <FieldLabel>ROT/RUT-klassificering</FieldLabel>
                  <div className="flex gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={isLabor}
                        onCheckedChange={(checked) => {
                          setIsLabor(!!checked);
                          if (checked) setIsMaterial(false);
                        }}
                      />
                      <span className="text-sm">Arbetskostnad</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={isMaterial}
                        onCheckedChange={(checked) => {
                          setIsMaterial(!!checked);
                          if (checked) setIsLabor(false);
                        }}
                      />
                      <span className="text-sm">Material/resa</span>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rotRutType === "rot" ? "ROT-avdrag (30%)" : "RUT-avdrag (50%)"} beräknas på arbetskostnad
                  </p>
                </FieldGroup>
              )}

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Totalt Exklusive moms</span>
                  <span className="font-medium">{formatCurrency(calculatedAmount)} kr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Totalt Inklusive moms</span>
                  <span className="font-medium">{formatCurrency(calculatedTotal)} kr</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button onClick={handleSave} disabled={updateLine.isPending}>
            {updateLine.isPending ? (
              <>
                <Spinner className="size-4 mr-2" />
                Sparar...
              </>
            ) : (
              "Spara"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

