"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash, Warning } from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { DatePicker } from "@/components/ui/date-picker";
import { trpc } from "@/lib/trpc/client";
import { createCuid } from "@/lib/utils/cuid";
import { useDuplicateCheck } from "@/hooks/use-duplicate-check";
import { DuplicateBadge } from "./duplicate-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AddBankTransactionDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BankTransactionRow {
  id: string;
  account: string;
  accountingDate: string;
  reference: string;
  amount: string;
}

function createEmptyRow(): BankTransactionRow {
  return {
    id: createCuid(),
    account: "",
    accountingDate: "",
    reference: "",
    amount: "",
  };
}

export function AddBankTransactionDialog({
  workspaceId,
  open,
  onOpenChange,
}: AddBankTransactionDialogProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [rows, setRows] = useState<BankTransactionRow[]>([createEmptyRow()]);
  const [pastedContent, setPastedContent] = useState("");

  const createBankTransactions = trpc.bankTransactions.create.useMutation({
    onSuccess: () => {
      setRows([createEmptyRow()]);
      setPastedContent("");
      onOpenChange(false);
      utils.bankTransactions.list.invalidate({ workspaceId });
      router.refresh();
    },
  });

  const analyzeContent = trpc.bankTransactions.analyzeContent.useMutation({
    onSuccess: (data) => {
      if (data.bankTransactions.length === 0) {
        toast.error("Ingen data hittades i texten.");
        return;
      }
      const parsed: BankTransactionRow[] = data.bankTransactions.slice(0, 50).map((v) => ({
        id: createCuid(),
        account: v.office || "",
        accountingDate: v.accountingDate || "",
        reference: v.reference || "",
        amount: v.amount?.toString() || "",
      }));
      setRows(parsed);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { duplicateMap } = useDuplicateCheck(
    workspaceId,
    rows.map((row) => ({
      id: row.id,
      accountingDate: row.accountingDate,
      amount: row.amount,
    })),
    open
  );

  const duplicateCount = [...duplicateMap.values()].filter(
    (d) => d.isDuplicate
  ).length;

  function updateRow(id: string, field: keyof BankTransactionRow, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }

  function addRow() {
    if (rows.length < 50) {
      setRows((prev) => [...prev, createEmptyRow()]);
    }
  }

  function removeRow(id: string) {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    }
  }

  function analyzeWithAI() {
    if (!pastedContent.trim()) return;
    analyzeContent.mutate({
      workspaceId,
      content: pastedContent,
    });
  }

  function handleSubmit() {
    const validRows = rows.filter(
      (row) => row.reference || row.amount || row.accountingDate
    );

    if (validRows.length === 0) return;

    createBankTransactions.mutate({
      workspaceId,
      bankTransactions: validRows.map((row) => ({
        office: row.account || null,
        accountingDate: row.accountingDate || null,
        ledgerDate: null,
        currencyDate: null,
        reference: row.reference || null,
        amount: row.amount ? parseFloat(row.amount) : null,
        bookedBalance: null,
      })),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Lägg till banktransaktioner</DialogTitle>
          <DialogDescription>
            Lägg till upp till 50 transaktioner åt gången.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manuell inmatning</TabsTrigger>
            <TabsTrigger value="paste">Klistra in data</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="flex-1 overflow-auto">
            <div className="space-y-2">
              <div className="grid grid-cols-[100px_150px_1fr_140px_80px_40px] gap-2 text-xs font-medium text-muted-foreground sticky top-0 bg-background py-2">
                <div>Konto</div>
                <div>Bokföringsdag</div>
                <div>Referens</div>
                <div>Belopp</div>
                <div className="text-center">Status</div>
                <div></div>
              </div>

              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[100px_150px_1fr_140px_80px_40px] gap-2"
                >
                  <Input
                    placeholder="6886"
                    value={row.account}
                    onChange={(e) => updateRow(row.id, "account", e.target.value)}
                    className="h-8 text-sm"
                  />
                  <DatePicker
                    value={row.accountingDate}
                    onChange={(value) =>
                      updateRow(row.id, "accountingDate", value)
                    }
                    placeholder="Bokföringsdag"
                    className="h-8 text-sm w-full"
                  />
                  <Input
                    placeholder="Referens"
                    value={row.reference}
                    onChange={(e) =>
                      updateRow(row.id, "reference", e.target.value)
                    }
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="-100.00"
                    value={row.amount}
                    onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                    className="h-8 text-sm"
                  />
                  <div className="flex items-center justify-center h-8">
                    {duplicateMap.get(row.id)?.isDuplicate && (
                      <DuplicateBadge
                        matches={duplicateMap.get(row.id)!.matches}
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              ))}

              {rows.length < 50 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRow}
                >
                  <Plus className="size-4 mr-2" />
                  Lägg till rad
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="paste" className="flex-1 flex flex-col gap-4">
            <Textarea
              placeholder="Klistra in data från Excel, bankutdrag, PDF-text, e-post eller annat format...

AI:n analyserar innehållet och extraherar transaktioner automatiskt."
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              className="flex-1 min-h-[200px] font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              onClick={analyzeWithAI}
              disabled={!pastedContent.trim() || analyzeContent.isPending}
            >
              {analyzeContent.isPending ? (
                <Spinner />
              ) : (
                "Analysera"
              )}
            </Button>
            {rows.length > 1 && !analyzeContent.isPending && (
              <p className="text-sm text-muted-foreground">
                {rows.length} rader redo att läggas till. Granska i fliken &quot;Manuell inmatning&quot;.
              </p>
            )}
          </TabsContent>
        </Tabs>

        {createBankTransactions.error && (
          <p className="text-sm text-red-500">
            {createBankTransactions.error.message}
          </p>
        )}

        {duplicateCount > 0 && (
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <Warning className="size-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">
              {duplicateCount} möjliga dubbletter hittades
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Vissa transaktioner kan redan finnas i systemet. Granska raderna
              markerade med varningssymbol.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createBankTransactions.isPending}
          >
            Avbryt
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createBankTransactions.isPending}
          >
            {createBankTransactions.isPending ? (
              <Spinner />
            ) : (
              `Lägg till ${rows.filter((r) => r.reference || r.amount).length} transaktioner`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

