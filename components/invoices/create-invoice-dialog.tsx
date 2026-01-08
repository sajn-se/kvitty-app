"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, CaretUpDown } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { CreateCustomerInlineDialog } from "@/components/invoices/create-customer-inline-dialog";
import { cn } from "@/lib/utils";

interface CreateInvoiceDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCustomerId?: string;
}

export function CreateInvoiceDialog({
  workspaceId,
  open,
  onOpenChange,
  initialCustomerId,
}: CreateInvoiceDialogProps) {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const utils = trpc.useUtils();

  const [customerId, setCustomerId] = useState(initialCustomerId || "");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  });
  const [reference, setReference] = useState("");
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const { data: customersData } = trpc.customers.list.useQuery({ workspaceId });
  const customers = customersData?.items;

  const selectedCustomer = useMemo(
    () => customers?.find((c) => c.id === customerId),
    [customers, customerId]
  );

  const formatOrgNumber = (orgNumber: string | null | undefined): string => {
    if (!orgNumber) return "";
    if (orgNumber.length === 10) {
      return `${orgNumber.slice(0, 6)}-${orgNumber.slice(6)}`;
    }
    if (orgNumber.length === 12) {
      return `${orgNumber.slice(0, 10)}-${orgNumber.slice(10)}`;
    }
    return orgNumber;
  };

  const createInvoice = trpc.invoices.create.useMutation({
    onSuccess: (invoice) => {
      utils.invoices.list.invalidate({ workspaceId });
      onOpenChange(false);
      // Redirect to the invoice detail page
      router.push(`/${workspace.slug}/fakturor/${invoice.id}`);
    },
  });

  const resetForm = () => {
    setCustomerId(initialCustomerId || "");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setDueDate(date.toISOString().split("T")[0]);
    setReference("");
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (initialCustomerId && open) {
      setCustomerId(initialCustomerId);
    }
  }, [initialCustomerId, open]);

  const handleCustomerCreated = (newCustomerId: string) => {
    setCustomerId(newCustomerId);
    setCreateCustomerOpen(false);
    utils.customers.list.invalidate({ workspaceId });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createInvoice.mutate({
      workspaceId,
      customerId,
      invoiceDate,
      dueDate,
      reference: reference || undefined,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="min-w-lg">
          <DialogHeader>
            <DialogTitle>Ny faktura</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="customer">Kund *</FieldLabel>
                <div className="flex gap-2">
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="customer"
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboboxOpen}
                        className="flex-1 justify-between"
                      >
                        {selectedCustomer ? (
                          <span className="truncate">{selectedCustomer.name}</span>
                        ) : (
                          <span className="text-muted-foreground">Välj kund...</span>
                        )}
                        <CaretUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Sök kund..." />
                        <CommandList>
                          <CommandEmpty>Inga kunder hittades</CommandEmpty>
                          <CommandGroup>
                            {customers?.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={`${customer.name} ${customer.orgNumber || ""}`}
                                onSelect={() => {
                                  setCustomerId(customer.id === customerId ? "" : customer.id);
                                  setComboboxOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 size-4",
                                    customerId === customer.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-medium">{customer.name}</span>
                                  {customer.orgNumber && (
                                    <span className="text-xs text-muted-foreground">
                                      Org.nr: {formatOrgNumber(customer.orgNumber)}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setCreateCustomerOpen(true)}
                    title="Skapa ny kund"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                {customers?.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Klicka på + för att skapa din första kund
                  </p>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="invoiceDate">Fakturadatum</FieldLabel>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="dueDate">Förfallodatum</FieldLabel>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="reference">Referens (valfritt)</FieldLabel>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Er referens"
                />
              </Field>

              {createInvoice.error && (
                <p className="text-sm text-red-500">{createInvoice.error.message}</p>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={createInvoice.isPending}
                >
                  Avbryt
                </Button>
                <Button
                  type="submit"
                  disabled={createInvoice.isPending || !customerId}
                >
                  {createInvoice.isPending ? <Spinner /> : "Skapa faktura"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>

      <CreateCustomerInlineDialog
        open={createCustomerOpen}
        onOpenChange={setCreateCustomerOpen}
        workspaceId={workspaceId}
        onCustomerCreated={handleCustomerCreated}
      />
    </>
  );
}
