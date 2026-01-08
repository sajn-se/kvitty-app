"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CalendarDots, CaretDownIcon } from "@phosphor-icons/react";
import { OpeningBalanceSection } from "./opening-balance-section";
import type { OpeningBalanceLineInput } from "@/lib/validations/opening-balance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/components/workspace-provider";
import type { FiscalYearType } from "@/lib/db/schema";

const months = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Mars" },
  { value: "04", label: "April" },
  { value: "05", label: "Maj" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Augusti" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function generateYearOptions() {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    years.push(i);
  }
  return years;
}

export function FirstPeriodDialog() {
  const { workspace, periods } = useWorkspace();
  const router = useRouter();
  const utils = trpc.useUtils();

  const [fiscalYearType, setFiscalYearType] = useState<FiscalYearType>("calendar");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [startMonth, setStartMonth] = useState("05");
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [openingBalances, setOpeningBalances] = useState<OpeningBalanceLineInput[]>([]);

  const hasNoPeriods = periods.length === 0;

  const startYear = parseInt(year);
  const endYear = fiscalYearType === "calendar" ? startYear : startYear + 1;
  const startMonthNum = fiscalYearType === "calendar" ? 1 : parseInt(startMonth);
  const endMonthNum = fiscalYearType === "calendar" ? 12 : (startMonthNum === 1 ? 12 : startMonthNum - 1);
  const endYearActual = fiscalYearType === "calendar" ? startYear : (startMonthNum === 1 ? startYear : startYear + 1);

  const startDate = `${startYear}-${startMonthNum.toString().padStart(2, "0")}-01`;
  const endDate = (() => {
    const lastDay = new Date(endYearActual, endMonthNum, 0).getDate();
    return `${endYearActual}-${endMonthNum.toString().padStart(2, "0")}-${lastDay}`;
  })();

  const label = fiscalYearType === "calendar"
    ? `Räkenskapsår ${startYear}`
    : `Räkenskapsår ${startYear}/${endYearActual}`;

  const urlSlug = fiscalYearType === "calendar"
    ? `${startYear}`
    : `${startYear}-${endYearActual}`;

  const createPeriod = trpc.periods.create.useMutation({
    onSuccess: () => {
      utils.periods.list.invalidate({ workspaceId: workspace.id });
      router.refresh();
    },
  });

  // Filter and validate opening balances before submitting
  const validOpeningBalances = openingBalances.filter(
    (line) => line.accountNumber > 0 && (line.debit || line.credit)
  );

  const openingBalanceTotals = {
    debit: validOpeningBalances.reduce((sum, l) => sum + (l.debit || 0), 0),
    credit: validOpeningBalances.reduce((sum, l) => sum + (l.credit || 0), 0),
  };

  const isOpeningBalanceBalanced =
    validOpeningBalances.length === 0 ||
    Math.abs(openingBalanceTotals.debit - openingBalanceTotals.credit) < 0.01;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isOpeningBalanceBalanced) {
      return;
    }

    createPeriod.mutate({
      workspaceId: workspace.id,
      label,
      urlSlug,
      startDate,
      endDate,
      fiscalYearType,
      openingBalances: validOpeningBalances.length > 0 ? validOpeningBalances : undefined,
    });
  }

  if (!hasNoPeriods) {
    return null;
  }

  return (
    <Dialog open={true} modal={true} onOpenChange={() => {}}>
      <DialogContent 
        className="min-w-lg"
        showCloseButton={false}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-2xl font-bold">Välkommen till {workspace.name}!</DialogTitle>
          </div>
          <DialogDescription>
            För att komma igång behöver du skapa ditt första räkenskapsår. Detta är ett obligatoriskt steg för att börja använda systemet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>Typ av räkenskapsår</FieldLabel>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setFiscalYearType("calendar")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors",
                    fiscalYearType === "calendar"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <Calendar className="size-8" weight="duotone" />
                  <div className="text-center">
                    <div className="font-medium text-sm">Kalenderår</div>
                    <div className="text-xs text-muted-foreground">Jan – Dec</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFiscalYearType("broken")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors",
                    fiscalYearType === "broken"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <CalendarDots className="size-8" weight="duotone" />
                  <div className="text-center">
                    <div className="font-medium text-sm">Brutet år</div>
                    <div className="text-xs text-muted-foreground">Valfri start</div>
                  </div>
                </button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="year">
                {fiscalYearType === "calendar" ? "År" : "Startår"}
              </FieldLabel>
              <DropdownMenu open={yearDropdownOpen} onOpenChange={setYearDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    id="year"
                    variant="outline"
                    className="w-full justify-between"
                    disabled={createPeriod.isPending}
                  >
                    <span>{year}</span>
                    <CaretDownIcon className="size-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                  <DropdownMenuRadioGroup
                    value={year}
                    onValueChange={(v) => {
                      setYear(v);
                      setYearDropdownOpen(false);
                    }}
                  >
                    {generateYearOptions().map((y) => (
                      <DropdownMenuRadioItem key={y} value={y.toString()}>
                        {y}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </Field>

            {fiscalYearType === "broken" && (
              <Field>
                <FieldLabel htmlFor="startMonth">Startmånad</FieldLabel>
                <DropdownMenu open={monthDropdownOpen} onOpenChange={setMonthDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      id="startMonth"
                      variant="outline"
                      className="w-full justify-between"
                      disabled={createPeriod.isPending}
                    >
                      <span>{months.find((m) => m.value === startMonth)?.label || "Välj månad"}</span>
                      <CaretDownIcon className="size-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                    <DropdownMenuRadioGroup
                      value={startMonth}
                      onValueChange={(v) => {
                        setStartMonth(v);
                        setMonthDropdownOpen(false);
                      }}
                    >
                      {months.map((m) => (
                        <DropdownMenuRadioItem key={m.value} value={m.value}>
                          {m.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <FieldDescription>
                  Räkenskapsåret sträcker sig 12 månader från startmånaden
                </FieldDescription>
              </Field>
            )}

            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="text-sm font-medium">{label}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(startDate).toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" })}
                {" – "}
                {new Date(endDate).toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>

            <OpeningBalanceSection
              lines={openingBalances}
              onChange={setOpeningBalances}
              disabled={createPeriod.isPending}
            />

            {createPeriod.error && (
              <p className="text-sm text-red-500">{createPeriod.error.message}</p>
            )}

            {!isOpeningBalanceBalanced && (
              <p className="text-sm text-amber-600">
                Ingående balanser måste balansera (debet = kredit)
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="submit"
                disabled={createPeriod.isPending || !isOpeningBalanceBalanced}
                className="w-full sm:w-auto"
              >
                {createPeriod.isPending ? <Spinner /> : "Skapa räkenskapsår"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

