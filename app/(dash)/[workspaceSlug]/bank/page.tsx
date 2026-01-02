"use client";

import { useState } from "react";
import { Plus, Bank, Trash, Pencil } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { AccountCombobox } from "@/components/journal-entry/account-combobox";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { Badge } from "@/components/ui/badge";

export default function BankPage() {
  const { workspace } = useWorkspace();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<{
    number: number;
    name: string;
  } | null>(null);
  const [customName, setCustomName] = useState("");
  const [description, setDescription] = useState("");

  const utils = trpc.useUtils();

  const { data: accounts, isLoading } = trpc.bankAccounts.list.useQuery({
    workspaceId: workspace.id,
  });

  const createAccount = trpc.bankAccounts.create.useMutation({
    onSuccess: () => {
      utils.bankAccounts.list.invalidate();
      setAddOpen(false);
      resetForm();
    },
  });

  const deleteAccount = trpc.bankAccounts.delete.useMutation({
    onSuccess: () => {
      utils.bankAccounts.list.invalidate();
      setDeleteOpen(false);
      setAccountToDelete(null);
    },
  });

  const initializeDefaults = trpc.bankAccounts.initializeDefaults.useMutation({
    onSuccess: () => {
      utils.bankAccounts.list.invalidate();
    },
  });

  const resetForm = () => {
    setSelectedAccount(null);
    setCustomName("");
    setDescription("");
  };

  const handleCreate = () => {
    if (!selectedAccount) return;

    createAccount.mutate({
      workspaceId: workspace.id,
      accountNumber: selectedAccount.number,
      name: customName || selectedAccount.name,
      description: description || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Bankkonton</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Bankkonton</h1>
            <p className="text-muted-foreground text-sm">
              Hantera dina bankkonton för bokföring
            </p>
          </div>
          <div className="flex gap-2">
            {accounts?.length === 0 && (
              <Button
                variant="outline"
                onClick={() => initializeDefaults.mutate({ workspaceId: workspace.id })}
                disabled={initializeDefaults.isPending}
              >
                {initializeDefaults.isPending ? <Spinner /> : "Lägg till standardkonton"}
              </Button>
            )}
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4 mr-2" />
              Lägg till konto
            </Button>
          </div>
        </div>

        {accounts?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bank className="size-12 mx-auto mb-4 text-muted-foreground" weight="duotone" />
              <h3 className="font-medium mb-2">Inga bankkonton</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Lägg till bankkonton för att börja bokföra transaktioner.
              </p>
              <Button
                variant="outline"
                onClick={() => initializeDefaults.mutate({ workspaceId: workspace.id })}
                disabled={initializeDefaults.isPending}
              >
                {initializeDefaults.isPending ? <Spinner /> : "Lägg till standardkonton"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {accounts?.map((account) => (
              <Card key={account.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Bank className="size-5" weight="duotone" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {account.accountNumber} - {account.name}
                      </CardTitle>
                      {account.description && (
                        <CardDescription>{account.description}</CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.isDefault && (
                      <Badge variant="blue">
                        Standard
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setAccountToDelete(account.id);
                        setDeleteOpen(true);
                      }}
                      disabled={deleteAccount.isPending}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Add Account Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="min-w-lg">
            <DialogHeader>
              <DialogTitle>Lägg till bankkonto</DialogTitle>
            </DialogHeader>

            <FieldGroup>
              <Field>
                <FieldLabel>Välj konto från kontoplanen</FieldLabel>
                <AccountCombobox
                  value={selectedAccount?.number}
                  onChange={(num, name) => {
                    setSelectedAccount({ number: num, name });
                    if (!customName) setCustomName(name);
                  }}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="customName">Eget namn (valfritt)</FieldLabel>
                <Input
                  id="customName"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="T.ex. Företagskonto Nordea"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Beskrivning (valfritt)</FieldLabel>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="T.ex. Huvudkonto för löpande utgifter"
                />
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Avbryt
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!selectedAccount || createAccount.isPending}
              >
                {createAccount.isPending ? <Spinner /> : "Lägg till"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Alert Dialog */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ta bort bankkonto</AlertDialogTitle>
              <AlertDialogDescription>
                Vill du ta bort detta konto? Denna åtgärd kan inte ångras.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Avbryt</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  if (accountToDelete) {
                    deleteAccount.mutate({
                      id: accountToDelete,
                      workspaceId: workspace.id,
                    });
                  }
                }}
                disabled={deleteAccount.isPending}
              >
                {deleteAccount.isPending ? <Spinner /> : "Ta bort"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
