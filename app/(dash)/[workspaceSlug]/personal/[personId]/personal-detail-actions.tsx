"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Archive } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
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
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";

interface PersonalDetailActionsProps {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    postalCode: string | null;
    city: string | null;
    taxTable: number | null;
    taxColumn: number | null;
    employmentStartDate: string | null;
    employmentEndDate: string | null;
    isActive: boolean;
  };
}

export function PersonalDetailActions({ employee }: PersonalDetailActionsProps) {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: employeeData } = trpc.employees.get.useQuery({
    id: employee.id,
    workspaceId: workspace.id,
  });

  const getInitialForm = () => {
    if (employeeData) {
      return {
        personalNumber: employeeData.personalNumber,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email || "",
        phone: employeeData.phone || "",
        address: employeeData.address || "",
        postalCode: employeeData.postalCode || "",
        city: employeeData.city || "",
        taxTable: employeeData.taxTable?.toString() || "",
        taxColumn: employeeData.taxColumn?.toString() || "",
        employmentStartDate: employeeData.employmentStartDate || "",
        employmentEndDate: employeeData.employmentEndDate || "",
      };
    }
    return {
      personalNumber: "",
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email || "",
      phone: employee.phone || "",
      address: employee.address || "",
      postalCode: employee.postalCode || "",
      city: employee.city || "",
      taxTable: employee.taxTable?.toString() || "",
      taxColumn: employee.taxColumn?.toString() || "",
      employmentStartDate: employee.employmentStartDate || "",
      employmentEndDate: employee.employmentEndDate || "",
    };
  };

  const [form, setForm] = useState(getInitialForm);

  // Update form when employeeData loads or dialog opens
  useEffect(() => {
    if (employeeData && editOpen) {
      setForm({
        personalNumber: employeeData.personalNumber,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email || "",
        phone: employeeData.phone || "",
        address: employeeData.address || "",
        postalCode: employeeData.postalCode || "",
        city: employeeData.city || "",
        taxTable: employeeData.taxTable?.toString() || "",
        taxColumn: employeeData.taxColumn?.toString() || "",
        employmentStartDate: employeeData.employmentStartDate || "",
        employmentEndDate: employeeData.employmentEndDate || "",
      });
    }
  }, [employeeData, editOpen]);

  const updateEmployee = trpc.employees.update.useMutation({
    onSuccess: () => {
      utils.employees.get.invalidate({ id: employee.id, workspaceId: workspace.id });
      utils.employees.list.invalidate({ workspaceId: workspace.id });
      setEditOpen(false);
      setError(null);
      router.refresh();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const archiveEmployee = trpc.employees.archive.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate({ workspaceId: workspace.id });
      router.push(`/${workspace.slug}/personal`);
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    updateEmployee.mutate({
      id: employee.id,
      workspaceId: workspace.id,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      postalCode: form.postalCode || null,
      city: form.city || null,
      taxTable: form.taxTable ? parseInt(form.taxTable, 10) : null,
      taxColumn: form.taxColumn ? parseInt(form.taxColumn, 10) : null,
      employmentStartDate: form.employmentStartDate || null,
      employmentEndDate: form.employmentEndDate || null,
    });
  };

  const handleArchive = () => {
    archiveEmployee.mutate({
      id: employee.id,
      workspaceId: workspace.id,
    });
    setArchiveOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (employeeData) {
              setForm({
                personalNumber: employeeData.personalNumber,
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email || "",
                phone: employeeData.phone || "",
                address: employeeData.address || "",
                postalCode: employeeData.postalCode || "",
                city: employeeData.city || "",
                taxTable: employeeData.taxTable?.toString() || "",
                taxColumn: employeeData.taxColumn?.toString() || "",
                employmentStartDate: employeeData.employmentStartDate || "",
                employmentEndDate: employeeData.employmentEndDate || "",
              });
            }
            setEditOpen(true);
          }}
        >
          <Pencil className="size-4" />
        </Button>
        {employee.isActive && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setArchiveOpen(true)}
              disabled={archiveEmployee.isPending}
              className="text-muted-foreground hover:text-destructive"
            >
              {archiveEmployee.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <Archive className="size-4" />
              )}
            </Button>
            <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Arkivera anställd</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vill du arkivera denna anställd? Denna åtgärd kan inte ångras.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleArchive}
                    disabled={archiveEmployee.isPending}
                    variant="destructive"
                  >
                    {archiveEmployee.isPending ? <Spinner /> : "Arkivera"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="min-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Redigera anställd</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="personalNumber">Personnummer</FieldLabel>
                <Input
                  id="personalNumber"
                  value={form.personalNumber}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Personnummer kan inte ändras
                </p>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName">Förnamn *</FieldLabel>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Förnamn"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="lastName">Efternamn *</FieldLabel>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Efternamn"
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="email">E-post</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="exempel@email.com"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">Telefon</FieldLabel>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="070-123 45 67"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="address">Adress</FieldLabel>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Gatunamn 123"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="postalCode">Postnummer</FieldLabel>
                  <Input
                    id="postalCode"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    placeholder="123 45"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="city">Ort</FieldLabel>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Stad"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="taxTable">Skattetabell</FieldLabel>
                  <Input
                    id="taxTable"
                    type="number"
                    value={form.taxTable}
                    onChange={(e) => setForm({ ...form, taxTable: e.target.value })}
                    placeholder="T.ex. 30, 31, 32"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="taxColumn">Skattkolumn</FieldLabel>
                  <Input
                    id="taxColumn"
                    type="number"
                    value={form.taxColumn}
                    onChange={(e) => setForm({ ...form, taxColumn: e.target.value })}
                    placeholder="T.ex. 1, 2, 3"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="employmentStartDate">Anställningsstart</FieldLabel>
                  <Input
                    id="employmentStartDate"
                    type="date"
                    value={form.employmentStartDate}
                    onChange={(e) => setForm({ ...form, employmentStartDate: e.target.value })}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="employmentEndDate">Anställningsslut</FieldLabel>
                  <Input
                    id="employmentEndDate"
                    type="date"
                    value={form.employmentEndDate}
                    onChange={(e) => setForm({ ...form, employmentEndDate: e.target.value })}
                  />
                </Field>
              </div>

              {error && <FieldError>{error}</FieldError>}
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={updateEmployee.isPending}>
                {updateEmployee.isPending ? <Spinner /> : "Spara"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

