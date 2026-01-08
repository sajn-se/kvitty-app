"use client";

import { Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountCombobox } from "./account-combobox";
import type { JournalEntryLineInput } from "@/lib/validations/journal-entry";

interface JournalEntryLineRowProps {
  line: JournalEntryLineInput;
  index: number;
  onChange: (index: number, line: JournalEntryLineInput) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
  canRemove?: boolean;
}

export function JournalEntryLineRow({
  line,
  index,
  onChange,
  onRemove,
  disabled,
  canRemove = true,
}: JournalEntryLineRowProps) {
  const handleAccountChange = (accountNumber: number, accountName: string) => {
    onChange(index, { ...line, accountNumber, accountName });
  };

  const handleDebitChange = (value: string) => {
    const debit = value ? parseFloat(value) : undefined;
    // Clear credit if debit is set
    onChange(index, {
      ...line,
      debit: debit || undefined,
      credit: debit ? undefined : line.credit,
    });
  };

  const handleCreditChange = (value: string) => {
    const credit = value ? parseFloat(value) : undefined;
    // Clear debit if credit is set
    onChange(index, {
      ...line,
      credit: credit || undefined,
      debit: credit ? undefined : line.debit,
    });
  };

  return (
    <div className="grid grid-cols-[1fr_120px_120px_40px] gap-2 items-center min-w-0">
      <div className="min-w-0 w-full">
        <AccountCombobox
          value={line.accountNumber}
          onChange={handleAccountChange}
          disabled={disabled}
          placeholder="Välj konto..."
        />
      </div>

      <Input
        type="number"
        min="0"
        step="0.01"
        placeholder="Debet"
        value={line.debit || ""}
        onChange={(e) => handleDebitChange(e.target.value)}
        disabled={disabled || !!line.credit}
        className="text-right w-full"
      />

      <Input
        type="number"
        min="0"
        step="0.01"
        placeholder="Kredit"
        value={line.credit || ""}
        onChange={(e) => handleCreditChange(e.target.value)}
        disabled={disabled || !!line.debit}
        className="text-right w-full"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        disabled={disabled || !canRemove}
        className="text-muted-foreground hover:text-destructive w-full"
      >
        <Trash className="size-4" />
      </Button>
    </div>
  );
}
