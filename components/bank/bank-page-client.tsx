"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Bank, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { AddBankAccountDialog } from "@/components/bank/add-bank-account-dialog";
import { DeleteBankAccountDialog } from "@/components/bank/delete-bank-account-dialog";

interface BankPageClientProps {
  workspaceSlug: string;
}

export function BankPageClient({ workspaceSlug }: BankPageClientProps) {
  const { workspace } = useWorkspace();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: accounts, isLoading } = trpc.bankAccounts.list.useQuery({
    workspaceId: workspace.id,
  });

  const initializeDefaults = trpc.bankAccounts.initializeDefaults.useMutation({
    onSuccess: () => {
      utils.bankAccounts.list.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <>
      <PageHeader currentPage="Bankkonton" />

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
              <Card key={account.id} className="hover:bg-accent/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Link
                    href={`/${workspaceSlug}/bank/${account.accountNumber}`}
                    className="flex items-center gap-3 flex-1"
                  >
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
                  </Link>
                  <div className="flex items-center gap-2">
                    {account.isDefault && (
                      <Badge variant="blue">
                        Standard
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAccountToDelete(account.id);
                        setDeleteOpen(true);
                      }}
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

        <AddBankAccountDialog
          workspaceId={workspace.id}
          open={addOpen}
          onOpenChange={setAddOpen}
        />

        <DeleteBankAccountDialog
          workspaceId={workspace.id}
          accountId={accountToDelete}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      </div>
    </>
  );
}

