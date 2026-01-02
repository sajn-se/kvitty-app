"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash } from "@phosphor-icons/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { DatePicker } from "@/components/ui/date-picker";
import { trpc } from "@/lib/trpc/client";
import type { fiscalPeriods } from "@/lib/db/schema";

type FiscalPeriod = typeof fiscalPeriods.$inferSelect;

interface AddVerificationDialogProps {
  workspaceId: string;
  periodId?: string;
  periods?: FiscalPeriod[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VerificationRow {
  id: string;
  account: string;
  accountingDate: string;
  reference: string;
  amount: string;
}

function createEmptyRow(): VerificationRow {
  return {
    id: crypto.randomUUID(),
    account: "",
    accountingDate: "",
    reference: "",
    amount: "",
  };
}

export function AddVerificationDialog({
  workspaceId,
  periodId: initialPeriodId,
  periods = [],
  open,
  onOpenChange,
}: AddVerificationDialogProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [rows, setRows] = useState<VerificationRow[]>([createEmptyRow()]);
  const [pastedContent, setPastedContent] = useState("");
  const [selectedPeriodId, setSelectedPeriodId] = useState(initialPeriodId || "");

  const periodId = initialPeriodId || selectedPeriodId;
  const showPeriodSelector = !initialPeriodId && periods.length > 0;

  const createVerifications = trpc.verifications.create.useMutation({
    onSuccess: () => {
      setRows([createEmptyRow()]);
      setPastedContent("");
      onOpenChange(false);
      utils.verifications.list.invalidate({ workspaceId, periodId });
      router.refresh();
    },
  });

  const analyzeContent = trpc.verifications.analyzeContent.useMutation({
    onSuccess: (data) => {
      if (data.verifications.length === 0) {
        toast.error("Ingen data hittades i texten.");
        return;
      }
      const parsed: VerificationRow[] = data.verifications.slice(0, 50).map((v) => ({
        id: crypto.randomUUID(),
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

  function updateRow(id: string, field: keyof VerificationRow, value: string) {
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

    createVerifications.mutate({
      workspaceId,
      fiscalPeriodId: periodId,
      verifications: validRows.map((row) => ({
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
          <DialogTitle>Lägg till verifikationer</DialogTitle>
          <DialogDescription>
            Lägg till upp till 50 verifikationer åt gången.
          </DialogDescription>
        </DialogHeader>

        {showPeriodSelector && (
          <Field>
            <FieldLabel>Period</FieldLabel>
            <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Välj period" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100]">
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        {periods.length === 0 && !initialPeriodId && (
          <p className="text-sm text-muted-foreground">
            Du måste skapa en bokföringsperiod först innan du kan lägga till verifikationer.
          </p>
        )}

        <Tabs defaultValue="manual" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manuell inmatning</TabsTrigger>
            <TabsTrigger value="paste">Klistra in data</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="flex-1 overflow-auto">
            <div className="space-y-2">
              <div className="grid grid-cols-[100px_150px_1fr_140px_40px] gap-2 text-xs font-medium text-muted-foreground sticky top-0 bg-background py-2">
                <div>Konto</div>
                <div>Bokföringsdag</div>
                <div>Referens</div>
                <div>Belopp</div>
                <div></div>
              </div>

              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[100px_150px_1fr_140px_40px] gap-2"
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

AI:n analyserar innehållet och extraherar verifikationer automatiskt."
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
                {rows.length} rader redo att läggas till. Granska i fliken "Manuell inmatning".
              </p>
            )}
          </TabsContent>
        </Tabs>

        {createVerifications.error && (
          <p className="text-sm text-red-500">
            {createVerifications.error.message}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createVerifications.isPending}
          >
            Avbryt
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createVerifications.isPending || !periodId}
          >
            {createVerifications.isPending ? (
              <Spinner />
            ) : (
              `Lägg till ${rows.filter((r) => r.reference || r.amount).length} verifikationer`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
