"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";

interface CreateCustomerInlineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onCustomerCreated: (customerId: string) => void;
}

export function CreateCustomerInlineDialog({
  open,
  onOpenChange,
  workspaceId,
  onCustomerCreated,
}: CreateCustomerInlineDialogProps) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [orgNumber, setOrgNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: (customer) => {
      utils.customers.list.invalidate({ workspaceId });
      onCustomerCreated(customer.id);
      resetForm();
    },
  });

  const resetForm = () => {
    setName("");
    setOrgNumber("");
    setEmail("");
    setPhone("");
    setAddress("");
    setPostalCode("");
    setCity("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer.mutate({
      workspaceId,
      name,
      orgNumber: orgNumber ? orgNumber.replace(/\D/g, "") : undefined,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      postalCode: postalCode || undefined,
      city: city || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-xl">
        <DialogHeader>
          <DialogTitle>Skapa ny kund</DialogTitle>
          <DialogDescription>
            Fyll i kunduppgifter nedan. Kunden kommer automatiskt väljas för fakturan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Namn *</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Företagsnamn"
                required
                disabled={createCustomer.isPending}
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="orgNumber">Org.nummer</FieldLabel>
              <Input
                id="orgNumber"
                value={orgNumber}
                onChange={(e) => setOrgNumber(e.target.value)}
                placeholder="XXXXXX-XXXX"
                disabled={createCustomer.isPending}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="email">E-post</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exempel@email.com"
                  disabled={createCustomer.isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Telefon</FieldLabel>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="070-123 45 67"
                  disabled={createCustomer.isPending}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="address">Adress</FieldLabel>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Gatunamn 123"
                disabled={createCustomer.isPending}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="postalCode">Postnummer</FieldLabel>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="123 45"
                  disabled={createCustomer.isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="city">Ort</FieldLabel>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Stockholm"
                  disabled={createCustomer.isPending}
                />
              </Field>
            </div>

            {createCustomer.error && (
              <p className="text-sm text-red-500">{createCustomer.error.message}</p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createCustomer.isPending}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={createCustomer.isPending || !name}>
                {createCustomer.isPending ? <Spinner /> : "Skapa kund"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
