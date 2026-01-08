"use client";

import { useState, useMemo } from "react";
import { CaretRight, Plus, Trash, Check, CaretUpDown, MagnifyingGlass, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { taxAccounts } from "@/lib/consts/tax-account";
import type { OpeningBalanceLineInput } from "@/lib/validations/opening-balance";

interface OpeningBalanceSectionProps {
  lines: OpeningBalanceLineInput[];
  onChange: (lines: OpeningBalanceLineInput[]) => void;
  disabled?: boolean;
}

interface FlatAccount {
  id: number;
  text: string;
  category: string;
  subCategory: string;
}

// Flatten and filter to balance sheet accounts only (1000-2999)
function getBalanceSheetAccounts(): FlatAccount[] {
  const flat: FlatAccount[] = [];
  for (const category of taxAccounts) {
    for (const subCategory of category.subCategories) {
      for (const account of subCategory.accounts) {
        if (account.id >= 1000 && account.id <= 2999) {
          flat.push({
            id: account.id,
            text: account.text,
            category: category.text,
            subCategory: subCategory.text,
          });
        }
      }
    }
  }
  return flat;
}

const balanceSheetAccounts = getBalanceSheetAccounts();

function BalanceSheetAccountCombobox({
  value,
  onChange,
  disabled,
}: {
  value?: number;
  onChange: (accountNumber: number, accountName: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedAccount = useMemo(
    () => balanceSheetAccounts.find((a) => a.id === value),
    [value]
  );

  const filteredAccounts = useMemo(() => {
    if (!search) return balanceSheetAccounts.slice(0, 50);

    const searchLower = search.toLowerCase();
    const searchNumber = parseInt(search, 10);

    return balanceSheetAccounts
      .filter((account) => {
        const matchesNumber =
          !isNaN(searchNumber) && account.id.toString().startsWith(search);
        const matchesText = account.text.toLowerCase().includes(searchLower);
        return matchesNumber || matchesText;
      })
      .slice(0, 50);
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal h-9 text-sm"
        >
          {selectedAccount ? (
            <span className="truncate">
              {selectedAccount.id} - {selectedAccount.text}
            </span>
          ) : (
            <span className="text-muted-foreground">Välj konto...</span>
          )}
          <CaretUpDown className="ml-2 size-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80" align="start">
        <div className="flex items-center border-b px-3">
          <MagnifyingGlass className="mr-2 size-4 shrink-0 opacity-50" />
          <Input
            placeholder="Sök konto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
          />
        </div>
        <div className="max-h-[250px] overflow-y-auto p-1">
          {filteredAccounts.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Inga konton hittades
            </div>
          ) : (
            filteredAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => {
                  onChange(account.id, account.text);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  value === account.id && "bg-accent"
                )}
              >
                <Check
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    value === account.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex-1 text-left">
                  <div className="font-medium">
                    {account.id} - {account.text}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {account.category}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function OpeningBalanceSection({
  lines,
  onChange,
  disabled,
}: OpeningBalanceSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totals = useMemo(() => {
    const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
    return { totalDebit, totalCredit, isBalanced };
  }, [lines]);

  const handleAddLine = () => {
    onChange([
      ...lines,
      { accountNumber: 0, accountName: "", debit: null, credit: null },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    onChange(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (
    index: number,
    field: keyof OpeningBalanceLineInput,
    value: number | string | null
  ) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    onChange(newLines);
  };

  const handleAccountChange = (
    index: number,
    accountNumber: number,
    accountName: string
  ) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], accountNumber, accountName };
    onChange(newLines);
  };

  const hasLines = lines.length > 0;
  const hasValues = lines.some((l) => l.debit || l.credit);
  const validLineCount = lines.filter((l) => l.accountNumber > 0 && (l.debit || l.credit)).length;
  const incompleteLineCount = lines.filter((l) => !l.accountNumber && (l.debit || l.credit)).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex w-full items-center gap-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <CaretRight
            className={cn(
              "size-4 transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
          <span>Avancerat</span>
          {hasValues && (
            <span className={cn(
              "ml-auto text-xs px-2 py-0.5 rounded-full",
              incompleteLineCount > 0
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : totals.isBalanced
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            )}>
              {validLineCount} konton{incompleteLineCount > 0 ? ` (${incompleteLineCount} saknar konto)` : ""}
            </span>
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 rounded-lg border bg-muted/30 p-4 space-y-4">
          <div>
            <h4 className="font-medium text-sm">Ingående balanser</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Ange kontosaldon om du flyttar bokföring från ett annat system.
            </p>
          </div>

          {lines.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr,100px,100px,32px] gap-2 text-xs font-medium text-muted-foreground px-1">
                <span>Konto</span>
                <span className="text-right">Debet</span>
                <span className="text-right">Kredit</span>
                <span></span>
              </div>
              {lines.map((line, index) => {
                const isIncomplete = !line.accountNumber && (line.debit || line.credit);
                return (
                <div
                  key={index}
                  className={cn(
                    "grid grid-cols-[1fr,100px,100px,32px] gap-2 items-center rounded-md p-1 -m-1",
                    isIncomplete && "bg-amber-50 dark:bg-amber-900/10"
                  )}
                >
                  <BalanceSheetAccountCombobox
                    value={line.accountNumber || undefined}
                    onChange={(num, name) => handleAccountChange(index, num, name)}
                    disabled={disabled}
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0"
                    value={line.debit || ""}
                    onChange={(e) =>
                      handleLineChange(
                        index,
                        "debit",
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    disabled={disabled}
                    className="h-9 text-sm text-right"
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0"
                    value={line.credit || ""}
                    onChange={(e) =>
                      handleLineChange(
                        index,
                        "credit",
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    disabled={disabled}
                    className="h-9 text-sm text-right"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => handleRemoveLine(index)}
                    disabled={disabled}
                  >
                    <Trash className="size-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              );
              })}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddLine}
            disabled={disabled}
            className="w-full"
          >
            <Plus className="size-4 mr-2" />
            Lägg till konto
          </Button>

          {hasValues && (
            <div className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm",
              totals.isBalanced
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-amber-50 dark:bg-amber-900/20"
            )}>
              <div className="flex items-center gap-2">
                {totals.isBalanced ? (
                  <CheckCircle className="size-4 text-green-600 dark:text-green-400" weight="fill" />
                ) : (
                  <WarningCircle className="size-4 text-amber-600 dark:text-amber-400" weight="fill" />
                )}
                <span className={cn(
                  "font-medium",
                  totals.isBalanced
                    ? "text-green-700 dark:text-green-400"
                    : "text-amber-700 dark:text-amber-400"
                )}>
                  {totals.isBalanced ? "Balanserat" : "Obalanserat"}
                </span>
              </div>
              <div className="text-xs space-x-4">
                <span>
                  Debet: <strong>{totals.totalDebit.toLocaleString("sv-SE")} kr</strong>
                </span>
                <span>
                  Kredit: <strong>{totals.totalCredit.toLocaleString("sv-SE")} kr</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
