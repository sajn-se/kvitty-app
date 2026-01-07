"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc/client";
import type { Customer, CustomerContact } from "@/lib/db/schema";
import { deliveryMethods } from "@/lib/validations/invoice";
import type { CustomerContactInput } from "@/lib/validations/customer";

interface CustomerFormDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

type ContactFormData = CustomerContactInput & { _tempId?: string };

export function CustomerFormDialog({
  workspaceId,
  open,
  onOpenChange,
  customer,
}: CustomerFormDialogProps) {
  const utils = trpc.useUtils();
  const [name, setName] = useState(customer?.name || "");
  const [orgNumber, setOrgNumber] = useState(customer?.orgNumber || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [postalCode, setPostalCode] = useState(customer?.postalCode || "");
  const [city, setCity] = useState(customer?.city || "");
  const [preferredDeliveryMethod, setPreferredDeliveryMethod] = useState<string>(customer?.preferredDeliveryMethod || "");
  const [einvoiceAddress, setEinvoiceAddress] = useState<string>(customer?.einvoiceAddress || "");
  const [contacts, setContacts] = useState<ContactFormData[]>([]);

  // Fetch customer with contacts when editing
  const { data: customerData } = trpc.customers.get.useQuery(
    { workspaceId, id: customer?.id ?? "" },
    { enabled: !!customer?.id && open }
  );

  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      onOpenChange(false);
      resetForm();
    },
  });

  const updateCustomer = trpc.customers.update.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      utils.customers.get.invalidate({ workspaceId, id: customer?.id ?? "" });
    },
  });

  const syncContacts = trpc.customers.syncContacts.useMutation({
    onSuccess: () => {
      onOpenChange(false);
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
    setPreferredDeliveryMethod("");
    setEinvoiceAddress("");
    setContacts([]);
  };

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setOrgNumber(customer.orgNumber || "");
      setEmail(customer.email || "");
      setPhone(customer.phone || "");
      setAddress(customer.address || "");
      setPostalCode(customer.postalCode || "");
      setCity(customer.city || "");
      setPreferredDeliveryMethod(customer.preferredDeliveryMethod || "");
      setEinvoiceAddress(customer.einvoiceAddress || "");
    } else {
      resetForm();
    }
  }, [customer]);

  // Load contacts from fetched customer data
  useEffect(() => {
    if (customerData?.contacts) {
      setContacts(
        customerData.contacts.map((c: CustomerContact) => ({
          id: c.id,
          name: c.name,
          role: c.role || "",
          email: c.email || "",
          phone: c.phone || "",
          isPrimary: c.isPrimary,
        }))
      );
    }
  }, [customerData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      orgNumber,
      email,
      phone,
      address,
      postalCode,
      city,
      preferredDeliveryMethod: (preferredDeliveryMethod as typeof deliveryMethods[number]) || null,
      einvoiceAddress: einvoiceAddress || null,
    };

    if (customer) {
      await updateCustomer.mutateAsync({ workspaceId, id: customer.id, ...data });
      // Sync contacts after updating customer
      await syncContacts.mutateAsync({
        workspaceId,
        customerId: customer.id,
        contacts: contacts.map(({ _tempId, ...c }) => c),
      });
    } else {
      const newCustomer = await createCustomer.mutateAsync({ workspaceId, ...data });
      // Sync contacts if any were added
      if (contacts.length > 0) {
        await syncContacts.mutateAsync({
          workspaceId,
          customerId: newCustomer.id,
          contacts: contacts.map(({ _tempId, ...c }) => c),
        });
      }
    }
  };

  const addContact = () => {
    setContacts([
      ...contacts,
      {
        _tempId: crypto.randomUUID(),
        name: "",
        role: "",
        email: "",
        phone: "",
        isPrimary: contacts.length === 0, // First contact is primary by default
      },
    ]);
  };

  const updateContact = (index: number, updates: Partial<ContactFormData>) => {
    setContacts((prev) =>
      prev.map((c, i) => {
        if (i === index) {
          // If setting as primary, unset others
          if (updates.isPrimary) {
            return { ...c, ...updates };
          }
          return { ...c, ...updates };
        }
        // Unset isPrimary on other contacts if this one is being set as primary
        if (updates.isPrimary) {
          return { ...c, isPrimary: false };
        }
        return c;
      })
    );
  };

  const removeContact = (index: number) => {
    setContacts((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // If we removed the primary and there are others, make first one primary
      if (prev[index]?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const isPending = createCustomer.isPending || updateCustomer.isPending || syncContacts.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? "Redigera kund" : "Ny kund"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Namn *</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="orgNumber">Org.nummer</FieldLabel>
              <Input
                id="orgNumber"
                value={orgNumber}
                onChange={(e) => setOrgNumber(e.target.value)}
                placeholder="XXXXXX-XXXX"
                disabled={isPending}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="email">Företagets e-post</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Telefon</FieldLabel>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isPending}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="address">Adress</FieldLabel>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isPending}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="postalCode">Postnummer</FieldLabel>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="city">Ort</FieldLabel>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isPending}
                />
              </Field>
            </div>

            {/* Contacts Section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Kontaktpersoner</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContact}
                  disabled={isPending}
                >
                  <Plus className="size-4 mr-1" />
                  Lägg till kontakt
                </Button>
              </div>

              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
                  Inga kontaktpersoner tillagda
                </p>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact, index) => (
                    <div
                      key={contact.id || contact._tempId}
                      className="border rounded-md p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`primary-${index}`}
                            checked={contact.isPrimary}
                            onCheckedChange={(checked) =>
                              updateContact(index, { isPrimary: !!checked })
                            }
                            disabled={isPending}
                          />
                          <Label
                            htmlFor={`primary-${index}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            Primär kontakt
                          </Label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeContact(index)}
                          disabled={isPending}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field>
                          <FieldLabel className="text-xs">Namn *</FieldLabel>
                          <Input
                            value={contact.name}
                            onChange={(e) =>
                              updateContact(index, { name: e.target.value })
                            }
                            placeholder="Anna Andersson"
                            required
                            disabled={isPending}
                          />
                        </Field>
                        <Field>
                          <FieldLabel className="text-xs">Roll</FieldLabel>
                          <Input
                            value={contact.role || ""}
                            onChange={(e) =>
                              updateContact(index, { role: e.target.value })
                            }
                            placeholder="Ekonomiansvarig"
                            disabled={isPending}
                          />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field>
                          <FieldLabel className="text-xs">E-post</FieldLabel>
                          <Input
                            type="email"
                            value={contact.email || ""}
                            onChange={(e) =>
                              updateContact(index, { email: e.target.value })
                            }
                            placeholder="anna@example.com"
                            disabled={isPending}
                          />
                        </Field>
                        <Field>
                          <FieldLabel className="text-xs">Telefon</FieldLabel>
                          <Input
                            value={contact.phone || ""}
                            onChange={(e) =>
                              updateContact(index, { phone: e.target.value })
                            }
                            placeholder="070-123 45 67"
                            disabled={isPending}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Settings Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-3">Leveransinställningar</h3>
              <Field>
                <FieldLabel htmlFor="preferredDeliveryMethod">Föredragen leveransmetod</FieldLabel>
                <Select value={preferredDeliveryMethod || "__none__"} onValueChange={(val) => setPreferredDeliveryMethod(val === "__none__" ? "" : val)}>
                  <SelectTrigger id="preferredDeliveryMethod">
                    <SelectValue placeholder="Välj leveransmetod" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Ingen förinställning</SelectItem>
                    {deliveryMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method === "email_pdf"
                          ? "E-post med PDF"
                          : method === "email_link"
                          ? "E-post med länk"
                          : method === "manual"
                          ? "Manuell hantering"
                          : "E-faktura"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Standard leveransmetod för fakturor till denna kund
                </FieldDescription>
              </Field>
              {preferredDeliveryMethod === "e_invoice" && (
                <Field>
                  <FieldLabel htmlFor="einvoiceAddress">E-faktura-adress</FieldLabel>
                  <Input
                    id="einvoiceAddress"
                    value={einvoiceAddress}
                    onChange={(e) => setEinvoiceAddress(e.target.value)}
                    placeholder="Peppol-ID eller e-faktura-adress"
                    disabled={isPending}
                  />
                  <FieldDescription>
                    Kundens Peppol-ID eller GLN för e-faktura
                  </FieldDescription>
                </Field>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner /> : customer ? "Spara" : "Skapa"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
