"use client";

import { useState } from "react";
import { MagnifyingGlass, WarningCircle, CalendarBlank } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { toast } from "sonner";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import type { WorkspaceMode } from "@/lib/db/schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachmentId: string;
  attachmentName: string;
  workspaceId: string;
  workspaceMode: WorkspaceMode;
};

export function LinkAttachmentDialog({
  open,
  onOpenChange,
  attachmentId,
  attachmentName,
  workspaceId,
  workspaceMode,
}: Props) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"verifications" | "transactions">(
    workspaceMode === "full_bookkeeping" ? "verifications" : "transactions"
  );
  const utils = trpc.useUtils();
  const { periods, workspace } = useWorkspace();

  // Get the most recent period for verifications
  const latestPeriod = periods.length > 0 ? periods[0] : null;

  // Fetch both transactions and verifications regardless of workspace mode
  const {
    data: bankTransactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = trpc.bankTransactions.list.useQuery(
    { workspaceId, limit: 100 },
    { enabled: open }
  );

  const bankTransactions = bankTransactionsData?.items;

  const {
    data: journalEntriesData,
    isLoading: isLoadingEntries,
    error: entriesError,
  } = trpc.journalEntries.list.useQuery(
    { workspaceId, fiscalPeriodId: latestPeriod?.id ?? "" },
    { enabled: open && !!latestPeriod }
  );

  const journalEntries = journalEntriesData?.items;

  const linkMutation = trpc.inbox.linkAttachment.useMutation({
    onSuccess: () => {
      utils.inbox.list.invalidate({ workspaceId });
      toast.success("Bilagan har kopplats");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte koppla bilagan");
    },
  });

  // Filter items based on search
  const filteredTransactions = bankTransactions?.filter(
    (t) =>
      t.reference?.toLowerCase().includes(search.toLowerCase()) ||
      t.amount?.toString().includes(search)
  );

  const filteredEntries = journalEntries?.filter(
    (e: { description: string; verificationNumber: number }) =>
      e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.verificationNumber?.toString().includes(search)
  );

  const handleLink = (id: string, type: "verification" | "transaction") => {
    linkMutation.mutate({
      workspaceId,
      attachmentId,
      ...(type === "verification" ? { journalEntryId: id } : { bankTransactionId: id }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Koppla bilaga</DialogTitle>
          <DialogDescription>
            Koppla &quot;{attachmentName}&quot; till en verifikation eller transaktion
          </DialogDescription>
        </DialogHeader>

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as "verifications" | "transactions")}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="verifications" className="flex-1">
              Verifikationer
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1">
              Transaktioner
            </TabsTrigger>
          </TabsList>

          <div className="relative mt-4 shrink-0">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={`Sök ${activeTab === "verifications" ? "verifikationer" : "transaktioner"}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <TabsContent value="verifications" className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6 mt-4 data-[state=active]:flex data-[state=active]:flex-col">
            {entriesError ? (
              <div className="text-center py-8">
                <WarningCircle className="size-8 mx-auto mb-2 text-destructive opacity-70" />
                <p className="text-sm text-destructive">
                  Kunde inte hämta verifikationer
                </p>
              </div>
            ) : isLoadingEntries ? (
              <div className="flex justify-center py-8">
                <Spinner className="size-6" />
              </div>
            ) : !latestPeriod ? (
              <div className="text-center py-8">
                <CalendarBlank className="size-8 mx-auto mb-2 text-muted-foreground opacity-70" />
                <p className="text-sm text-muted-foreground">
                  Du måste skapa en räkenskapsperiod innan du kan koppla bilagor till verifikationer.
                </p>
                <a
                  href={`/${workspace.slug}/perioder`}
                  className="text-sm text-primary hover:underline mt-2 inline-block"
                >
                  Gå till perioder
                </a>
              </div>
            ) : filteredEntries?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Inga verifikationer hittades
              </p>
            ) : (
              <div className="space-y-2">
                {filteredEntries?.slice(0, 20).map((entry: { id: string; verificationNumber: number; entryDate: string; description: string }) => (
                  <button
                    key={entry.id}
                    onClick={() => handleLink(entry.id, "verification")}
                    disabled={linkMutation.isPending}
                    className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        V{entry.verificationNumber}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {entry.entryDate &&
                          format(new Date(entry.entryDate), "d MMM yyyy", {
                            locale: sv,
                          })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {entry.description}
                    </p>
                  </button>
                ))}
                {(filteredEntries?.length ?? 0) > 20 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Visar 20 av {filteredEntries?.length} resultat. Använd sök för att hitta fler.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6 mt-4 data-[state=active]:flex data-[state=active]:flex-col">
            {transactionsError ? (
              <div className="text-center py-8">
                <WarningCircle className="size-8 mx-auto mb-2 text-destructive opacity-70" />
                <p className="text-sm text-destructive">
                  Kunde inte hämta transaktioner
                </p>
              </div>
            ) : isLoadingTransactions ? (
              <div className="flex justify-center py-8">
                <Spinner className="size-6" />
              </div>
            ) : filteredTransactions?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Inga transaktioner hittades
              </p>
            ) : (
              <div className="space-y-2">
                {filteredTransactions?.slice(0, 20).map((transaction) => (
                  <button
                    key={transaction.id}
                    onClick={() => handleLink(transaction.id, "transaction")}
                    disabled={linkMutation.isPending}
                    className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {transaction.reference || "Ingen referens"}
                      </span>
                      <span
                        className={`font-medium ${Number(transaction.amount) >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {Number(transaction.amount)?.toLocaleString("sv-SE", {
                          style: "currency",
                          currency: "SEK",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {transaction.accountingDate &&
                        format(new Date(transaction.accountingDate), "d MMM yyyy", {
                          locale: sv,
                        })}
                    </p>
                  </button>
                ))}
                {(filteredTransactions?.length ?? 0) > 20 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Visar 20 av {filteredTransactions?.length} resultat. Använd sök för att hitta fler.
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
