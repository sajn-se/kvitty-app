"use client";

import { useState, useMemo } from "react";
import { Check, CaretUpDown, MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { taxAccounts, type TaxAccount } from "@/lib/consts/tax-account";

interface AccountComboboxProps {
  value?: number;
  onChange: (accountNumber: number, accountName: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

interface FlatAccount {
  id: number;
  text: string;
  category: string;
  subCategory: string;
}

// Flatten the nested tax accounts structure
function flattenAccounts(): FlatAccount[] {
  const flat: FlatAccount[] = [];
  for (const category of taxAccounts) {
    for (const subCategory of category.subCategories) {
      for (const account of subCategory.accounts) {
        flat.push({
          id: account.id,
          text: account.text,
          category: category.text,
          subCategory: subCategory.text,
        });
      }
    }
  }
  return flat;
}

const allAccounts = flattenAccounts();

export function AccountCombobox({
  value,
  onChange,
  disabled,
  placeholder = "Välj konto...",
}: AccountComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedAccount = useMemo(
    () => allAccounts.find((a) => a.id === value),
    [value]
  );

  const filteredAccounts = useMemo(() => {
    if (!search) return allAccounts.slice(0, 50);

    const searchLower = search.toLowerCase();
    const searchNumber = parseInt(search, 10);

    return allAccounts
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
          className="w-full justify-between font-normal"
        >
          {selectedAccount ? (
            <span className="truncate">
              {selectedAccount.id} - {selectedAccount.text}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <CaretUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[400px]" 
        align="start"
        sideOffset={4}
      >
        <div className="flex items-center border-b px-3 flex-shrink-0">
          <MagnifyingGlass className="mr-2 size-4 shrink-0 opacity-50" />
          <Input
            placeholder="Sök konto (nummer eller namn)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
          {filteredAccounts.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
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
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium truncate">
                    {account.id} - {account.text}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {account.category} &gt; {account.subCategory}
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
