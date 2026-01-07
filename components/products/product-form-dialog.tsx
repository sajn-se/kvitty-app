"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc/client";
import type { Product } from "@/lib/db/schema";
import {
  productUnits,
  productTypes,
  unitFullNames,
  productTypeLabels,
} from "@/lib/validations/product";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  product: Product | null;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  workspaceId,
  product,
}: ProductFormDialogProps) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultQuantity, setDefaultQuantity] = useState("1");
  const [unit, setUnit] = useState<(typeof productUnits)[number]>("styck");
  const [unitPrice, setUnitPrice] = useState("");
  const [vatRate, setVatRate] = useState<number>(25);
  const [type, setType] = useState<(typeof productTypes)[number]>("T");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || "");
      setDefaultQuantity(product.defaultQuantity);
      setUnit(product.unit);
      setUnitPrice(product.unitPrice);
      setVatRate(product.vatRate);
      setType(product.type);
    } else {
      resetForm();
    }
  }, [product, open]);

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate({ workspaceId });
      onOpenChange(false);
      resetForm();
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate({ workspaceId });
      onOpenChange(false);
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setDefaultQuantity("1");
    setUnit("styck");
    setUnitPrice("");
    setVatRate(25);
    setType("T");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      description: description || undefined,
      defaultQuantity: parseFloat(defaultQuantity) || 1,
      unit,
      unitPrice: parseFloat(unitPrice) || 0,
      vatRate,
      type,
    };

    if (product) {
      updateProduct.mutate({ workspaceId, id: product.id, ...data });
    } else {
      createProduct.mutate({ workspaceId, ...data });
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? "Redigera produkt" : "Ny produkt"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Beskrivning *</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isPending}
                placeholder="Ex: Webhotell 1 mån"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Utökad beskrivning</FieldLabel>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                placeholder="Valfri längre beskrivning"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="defaultQuantity">Antal (standard)</FieldLabel>
                <Input
                  id="defaultQuantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={defaultQuantity}
                  onChange={(e) => setDefaultQuantity(e.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="unit">Enhet</FieldLabel>
                <Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}>
                  <SelectTrigger id="unit" disabled={isPending}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {productUnits.map((u) => (
                      <SelectItem key={u} value={u}>
                        {unitFullNames[u]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="unitPrice">Pris / enhet (ex moms) *</FieldLabel>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required
                  disabled={isPending}
                  placeholder="0.00"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="vatRate">Moms</FieldLabel>
                <Select
                  value={String(vatRate)}
                  onValueChange={(v) => setVatRate(parseInt(v))}
                >
                  <SelectTrigger id="vatRate" disabled={isPending}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 %</SelectItem>
                    <SelectItem value="12">12 %</SelectItem>
                    <SelectItem value="6">6 %</SelectItem>
                    <SelectItem value="0">0 %</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="type">Typ</FieldLabel>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger id="type" disabled={isPending}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {productTypeLabels[t]} ({t})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isPending || !name || !unitPrice}>
                {isPending ? <Spinner /> : product ? "Spara" : "Skapa"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
