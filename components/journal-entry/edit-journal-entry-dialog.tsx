"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { JournalEntryLineRow } from "./journal-entry-line-row";
import { trpc } from "@/lib/trpc/client";
import type { JournalEntryLineInput, JournalEntryType } from "@/lib/validations/journal-entry";

type JournalEntry = {
  id: string;
  verificationNumber: number;
  entryDate: string;
  description: string;
  entryType: string;
  fiscalPeriodId: string;
  lines: Array<{
    id: string;
    accountNumber: number;
    accountName: string;
    debit: string | null;
    credit: string | null;
    description: string | null;
  }>;
};

interface EditJournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: JournalEntry;
  workspaceId: string;
}

const entryTypes: { value: JournalEntryType; label: string }[] = [
  { value: "kvitto", label: "Kvitto/Utgift" },
  { value: "inkomst", label: "Inkomst" },
  { value: "leverantorsfaktura", label: "Leverantörsfaktura" },
  { value: "utlagg", label: "Utlägg" },
  { value: "annat", label: "Annat" },
];

const emptyLine: JournalEntryLineInput = {
  accountNumber: 0,
  accountName: "",
  debit: undefined,
  credit: undefined,
};

export function EditJournalEntryDialog({
  open,
  onOpenChange,
  entry,
  workspaceId,
}: EditJournalEntryDialogProps) {
  const utils = trpc.useUtils();
  const [entryDate, setEntryDate] = useState(entry.entryDate);
  const [description, setDescription] = useState(entry.description);
  const [entryType, setEntryType] = useState<JournalEntryType>(
    entry.entryType as JournalEntryType
  );
  const [lines, setLines] = useState<JournalEntryLineInput[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEntryDate(entry.entryDate);
      setDescription(entry.description);
      setEntryType(entry.entryType as JournalEntryType);
      setLines(
        entry.lines.map((l) => ({
          accountNumber: l.accountNumber,
          accountName: l.accountName,
          debit: l.debit ? parseFloat(l.debit) : undefined,
          credit: l.credit ? parseFloat(l.credit) : undefined,
          description: l.description || undefined,
        }))
      );
      setError(null);
    }
  }, [open, entry]);

  const updateEntry = trpc.journalEntries.update.useMutation({
    onSuccess: () => {
      toast.success("Verifikation uppdaterad");
      utils.journalEntries.get.invalidate({ workspaceId, id: entry.id });
      utils.journalEntries.list.invalidate();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error("Kunde inte uppdatera verifikation", {
        description: err.message,
      });
    },
  });

  const handleLineChange = (index: number, line: JournalEntryLineInput) => {
    const newLines = [...lines];
    newLines[index] = line;
    setLines(newLines);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const handleAddLine = () => {
    setLines([...lines, { ...emptyLine }]);
  };

  const handleSave = () => {
    setError(null);

    const validLines = lines.filter(
      (l) => l.accountNumber && l.accountName && (l.debit || l.credit)
    );

    if (validLines.length < 2) {
      setError("Minst två rader med konto och belopp krävs");
      return;
    }

    const totalDebit = validLines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = validLines.reduce((sum, l) => sum + (l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      setError(
        `Verifikationen balanserar inte. Debet: ${totalDebit.toFixed(2)}, Kredit: ${totalCredit.toFixed(2)}`
      );
      return;
    }

    updateEntry.mutate({
      workspaceId,
      id: entry.id,
      entryDate,
      description,
      entryType,
      lines: validLines,
    });
  };

  const handleCancel = () => {
    setEntryDate(entry.entryDate);
    setDescription(entry.description);
    setEntryType(entry.entryType as JournalEntryType);
    setLines(
      entry.lines.map((l) => ({
        accountNumber: l.accountNumber,
        accountName: l.accountName,
        debit: l.debit ? parseFloat(l.debit) : undefined,
        credit: l.credit ? parseFloat(l.credit) : undefined,
        description: l.description || undefined,
      }))
    );
    setError(null);
    onOpenChange(false);
  };

  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Redigera V{entry.verificationNumber}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="entryDate">Datum</FieldLabel>
                <Input
                  id="entryDate"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  disabled={updateEntry.isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="entryType">Typ</FieldLabel>
                <Select
                  value={entryType}
                  onValueChange={(v) => setEntryType(v as JournalEntryType)}
                  disabled={updateEntry.isPending}
                >
                  <SelectTrigger id="entryType">
                    <SelectValue placeholder="Välj typ" />
                  </SelectTrigger>
                  <SelectContent>
                    {entryTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="description">Beskrivning</FieldLabel>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="T.ex. Inköp av dator"
                disabled={updateEntry.isPending}
              />
            </Field>

            <div className="space-y-2">
              <FieldLabel>Konteringar</FieldLabel>
              <div className="grid grid-cols-[1fr_120px_120px_40px] gap-2 text-xs text-muted-foreground font-medium px-1">
                <span>Konto</span>
                <span className="text-right">Debet</span>
                <span className="text-right">Kredit</span>
                <span></span>
              </div>

              <div className="space-y-2">
                {lines.map((line, index) => (
                  <JournalEntryLineRow
                    key={index}
                    line={line}
                    index={index}
                    onChange={handleLineChange}
                    onRemove={handleRemoveLine}
                    canRemove={lines.length > 2}
                    disabled={updateEntry.isPending}
                  />
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLine}
                disabled={updateEntry.isPending}
                className="w-full"
              >
                <Plus className="size-4 mr-2" />
                Lägg till rad
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm border-t pt-4">
              <span className="text-muted-foreground">Summa:</span>
              <div className="flex gap-4">
                <span>
                  Debet: <strong>{totalDebit.toFixed(2)} kr</strong>
                </span>
                <span>
                  Kredit: <strong>{totalCredit.toFixed(2)} kr</strong>
                </span>
                <span className={isBalanced ? "text-green-600" : "text-red-600"}>
                  {isBalanced ? "Balanserat" : "Obalanserat"}
                </span>
              </div>
            </div>

            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateEntry.isPending}
          >
            Avbryt
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateEntry.isPending || !isBalanced}
          >
            {updateEntry.isPending ? <Spinner /> : "Spara"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
