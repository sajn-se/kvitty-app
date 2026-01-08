"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsString } from "nuqs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { PeriodSelector } from "@/components/reports/period-selector";
import { WizardStepCard, type StepStatus } from "@/components/bokslut/wizard-step-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle,
  Warning,
  LockSimple,
  Info,
} from "@phosphor-icons/react";
import type { AnnualClosingStatus, ClosingPackage } from "@/lib/db/schema";

interface Period {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

interface BokslutClientProps {
  workspaceId: string;
  periods: Period[];
  defaultPeriodId: string;
  workspaceSlug: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

type StepKey = "reconciliation" | "package" | "entries" | "tax" | "finalize";

const STEP_ORDER: StepKey[] = ["reconciliation", "package", "entries", "tax", "finalize"];

function getStepStatus(
  step: StepKey,
  currentStatus: AnnualClosingStatus
): StepStatus {
  const statusOrder: Record<AnnualClosingStatus, number> = {
    not_started: 0,
    reconciliation_complete: 1,
    package_selected: 2,
    closing_entries_created: 3,
    tax_calculated: 4,
    finalized: 5,
  };

  const stepIndex = STEP_ORDER.indexOf(step);
  const currentIndex = statusOrder[currentStatus];

  if (currentStatus === "finalized") {
    return "completed";
  }

  if (stepIndex < currentIndex) {
    return "completed";
  } else if (stepIndex === currentIndex) {
    return "active";
  } else {
    return "locked";
  }
}

export function BokslutClient({
  workspaceId,
  periods,
  defaultPeriodId,
  workspaceSlug,
}: BokslutClientProps) {
  const router = useRouter();
  const [selectedPeriodId, setSelectedPeriodId] = useQueryState(
    "period",
    parseAsString.withDefault(defaultPeriodId)
  );
  const utils = trpc.useUtils();

  const [selectedPackage, setSelectedPackage] = useState<ClosingPackage | null>(null);
  const [manualExpandedStep, setManualExpandedStep] = useState<StepKey | null>(null);

  const { data: closingData, isLoading: closingLoading, isError: closingError } =
    trpc.bokslut.getClosing.useQuery(
      { workspaceId, fiscalPeriodId: selectedPeriodId },
      { enabled: !!selectedPeriodId }
    );

  const { data: reconciliationData, isLoading: reconciliationLoading } =
    trpc.bokslut.getReconciliationStatus.useQuery(
      { workspaceId, fiscalPeriodId: selectedPeriodId },
      { enabled: !!selectedPeriodId }
    );

  const { data: taxData, isLoading: taxLoading } = trpc.bokslut.calculateTax.useQuery(
    { workspaceId, fiscalPeriodId: selectedPeriodId },
    { enabled: !!selectedPeriodId }
  );

  const completeReconciliation = trpc.bokslut.completeReconciliation.useMutation({
    onSuccess: () => {
      utils.bokslut.getClosing.invalidate();
      toast.success("Avstämning slutförd");
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte slutföra avstämning");
    },
  });

  const selectPackageMutation = trpc.bokslut.selectPackage.useMutation({
    onSuccess: () => {
      utils.bokslut.getClosing.invalidate();
      toast.success("Bokslutspaket valt");
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte välja bokslutspaket");
    },
  });

  const [showNoEntriesWarning, setShowNoEntriesWarning] = useState(false);

  const markEntriesCreated = trpc.bokslut.markClosingEntriesCreated.useMutation({
    onSuccess: () => {
      utils.bokslut.getClosing.invalidate();
      toast.success("Bokslutsbokningar markerade som klara");
      setShowNoEntriesWarning(false);
    },
    onError: (error) => {
      // Handle soft validation warning for no closing entries
      if (error.data?.code === "PRECONDITION_FAILED") {
        setShowNoEntriesWarning(true);
        toast.warning(error.message);
      } else {
        toast.error(error.message || "Kunde inte markera bokslutsbokningar");
      }
    },
  });

  const saveTax = trpc.bokslut.saveTaxCalculation.useMutation({
    onSuccess: () => {
      utils.bokslut.getClosing.invalidate();
      toast.success("Skatteberäkning sparad");
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte spara skatteberäkning");
    },
  });

  const finalize = trpc.bokslut.finalize.useMutation({
    onSuccess: () => {
      utils.bokslut.getClosing.invalidate();
      utils.periods.list.invalidate();
      toast.success("Bokslutet är färdigställt och perioden är låst");
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte färdigställa bokslutet");
    },
  });

  // Derive current step from closing status
  const currentActiveStep = useMemo((): StepKey | null => {
    if (!closingData?.closing) return null;
    const status = closingData.closing.status;
    if (status === "finalized") return null;

    const statusIndex = {
      not_started: 0,
      reconciliation_complete: 1,
      package_selected: 2,
      closing_entries_created: 3,
      tax_calculated: 4,
      finalized: 5,
    }[status];

    return STEP_ORDER[Math.min(STEP_ORDER.length - 1, statusIndex)];
  }, [closingData?.closing]);

  // Use manual expanded step if set, otherwise use current active step
  const expandedStep = manualExpandedStep ?? currentActiveStep;

  // Derive selected package from closing data
  const derivedPackage = closingData?.closing?.closingPackage ?? selectedPackage;

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriodId(periodId);
  };

  const handleToggleStep = (step: StepKey) => {
    if (!closingData?.closing) return;
    const status = getStepStatus(step, closingData.closing.status);
    if (status !== "locked") {
      setManualExpandedStep(expandedStep === step ? null : step);
    }
  };

  const isLoading = closingLoading || reconciliationLoading || taxLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (closingError) {
    return (
      <Alert variant="destructive">
        <Warning className="size-4" />
        <AlertTitle>Kunde inte ladda bokslut</AlertTitle>
        <AlertDescription>
          Ett fel uppstod när bokslutet skulle hämtas. Försök ladda om sidan.
        </AlertDescription>
      </Alert>
    );
  }

  const currentPeriod = periods.find((p) => p.id === selectedPeriodId);
  const closingStatus = closingData?.closing?.status || "not_started";
  const isFinalized = closingStatus === "finalized";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PeriodSelector
          periods={periods}
          selectedPeriodId={selectedPeriodId}
          onPeriodChange={handlePeriodChange}
        />

        {currentPeriod?.isLocked && (
          <Badge variant="secondary" className="gap-1">
            <LockSimple className="size-3" />
            Perioden är låst
          </Badge>
        )}
      </div>

      {isFinalized && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
          <CheckCircle className="size-4 text-green-600" />
          <AlertTitle>Bokslutet är färdigställt</AlertTitle>
          <AlertDescription>
            Detta räkenskapsår är avslutat och låst. Alla bokningar är sparade.
            {closingData?.closing?.finalizedAt && (
              <span className="block mt-1 text-sm">
                Färdigställt:{" "}
                {new Date(closingData.closing.finalizedAt).toLocaleDateString("sv-SE")}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: Avstämning */}
      <WizardStepCard
        stepNumber={1}
        title="Avstämning"
        description="Verifiera att alla konton är avstämda och balanserade"
        status={getStepStatus("reconciliation", closingStatus)}
        isExpanded={expandedStep === "reconciliation"}
        onToggle={() => handleToggleStep("reconciliation")}
        completedLabel="Avstämd"
      >
        <div className="space-y-4">
          {reconciliationData && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">
                      {reconciliationData.accountSummary.totalAccounts}
                    </div>
                    <div className="text-sm text-muted-foreground">Konton</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">
                      {reconciliationData.accountSummary.assets}
                    </div>
                    <div className="text-sm text-muted-foreground">Tillgångar</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">
                      {reconciliationData.accountSummary.liabilities}
                    </div>
                    <div className="text-sm text-muted-foreground">Skulder</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">
                      {reconciliationData.accountSummary.revenue}
                    </div>
                    <div className="text-sm text-muted-foreground">Intäkter</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">
                      {reconciliationData.accountSummary.expenses}
                    </div>
                    <div className="text-sm text-muted-foreground">Kostnader</div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">Kontroll</TableHead>
                    <TableHead className="px-4 text-right">Belopp</TableHead>
                    <TableHead className="px-4 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="px-4">Tillgångar (summa)</TableCell>
                    <TableCell className="px-4 text-right font-mono">
                      {formatCurrency(reconciliationData.totalAssets)}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <CheckCircle className="inline size-4 text-green-600" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-4">Eget kapital & Skulder (summa)</TableCell>
                    <TableCell className="px-4 text-right font-mono">
                      {formatCurrency(reconciliationData.totalEquityLiabilities)}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <CheckCircle className="inline size-4 text-green-600" />
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-medium">
                    <TableCell className="px-4">Balansräkning</TableCell>
                    <TableCell className="px-4 text-right font-mono">
                      Differens: {formatCurrency(reconciliationData.difference)}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      {reconciliationData.isBalanced ? (
                        <Badge variant="secondary" className="gap-1 text-green-700">
                          <CheckCircle className="size-3" />
                          Balanserad
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <Warning className="size-3" />
                          Ej balanserad
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {getStepStatus("reconciliation", closingStatus) === "active" && (
                <div className="flex justify-end">
                  <Button
                    onClick={() =>
                      completeReconciliation.mutate({
                        workspaceId,
                        fiscalPeriodId: selectedPeriodId,
                      })
                    }
                    disabled={completeReconciliation.isPending}
                  >
                    {completeReconciliation.isPending
                      ? "Sparar..."
                      : "Markera som avstämd"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </WizardStepCard>

      {/* Step 2: Välj bokslutspaket */}
      <WizardStepCard
        stepNumber={2}
        title="Välj bokslutspaket"
        description="Välj vilket regelverk som ska tillämpas (K1, K2 eller K3)"
        status={getStepStatus("package", closingStatus)}
        isExpanded={expandedStep === "package"}
        onToggle={() => handleToggleStep("package")}
        completedLabel={closingData?.closing?.closingPackage?.toUpperCase()}
      >
        <div className="space-y-4">
          <RadioGroup
            value={derivedPackage || undefined}
            onValueChange={(value: string) => setSelectedPackage(value as ClosingPackage)}
            disabled={getStepStatus("package", closingStatus) === "completed"}
          >
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="k1" id="k1" className="mt-1" />
                <Label htmlFor="k1" className="flex-1 cursor-pointer">
                  <div className="font-medium">K1 - Förenklat årsbokslut</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    För enskilda firmor med nettoomsättning under 3 miljoner kr.
                    Kontantmetoden tillåts.
                  </div>
                </Label>
              </div>
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="k2" id="k2" className="mt-1" />
                <Label htmlFor="k2" className="flex-1 cursor-pointer">
                  <div className="font-medium">K2 - Årsredovisning mindre företag</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    För mindre aktiebolag. Förenklade regler för värdering och
                    upplysningar.
                  </div>
                </Label>
              </div>
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="k3" id="k3" className="mt-1" />
                <Label htmlFor="k3" className="flex-1 cursor-pointer">
                  <div className="font-medium">K3 - Årsredovisning större företag</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Fullständigt regelverk baserat på IFRS för SME. Obligatoriskt
                    för större företag.
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {getStepStatus("package", closingStatus) === "active" && (
            <div className="flex justify-end">
              <Button
                onClick={() =>
                  derivedPackage &&
                  selectPackageMutation.mutate({
                    workspaceId,
                    fiscalPeriodId: selectedPeriodId,
                    closingPackage: derivedPackage,
                  })
                }
                disabled={!derivedPackage || selectPackageMutation.isPending}
              >
                {selectPackageMutation.isPending ? "Sparar..." : "Välj bokslutspaket"}
              </Button>
            </div>
          )}
        </div>
      </WizardStepCard>

      {/* Step 3: Bokslutsbokningar */}
      <WizardStepCard
        stepNumber={3}
        title="Bokslutsbokningar"
        description="Skapa och granska bokslutsbokningar (t.ex. periodiseringar, avskrivningar)"
        status={getStepStatus("entries", closingStatus)}
        isExpanded={expandedStep === "entries"}
        onToggle={() => handleToggleStep("entries")}
        completedLabel="Klart"
      >
        <div className="space-y-4">
          <Alert>
            <Info className="size-4" />
            <AlertTitle>Bokslutsbokningar</AlertTitle>
            <AlertDescription>
              Granska och skapa eventuella bokslutsbokningar som:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Periodiseringar av intäkter och kostnader</li>
                <li>Avskrivningar på anläggningstillgångar</li>
                <li>Upplupna kostnader och förutbetalda intäkter</li>
                <li>Avsättningar</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/${workspaceSlug}/${currentPeriod?.label || ""}/verifikationer`)
              }
            >
              Visa bokföring
            </Button>
          </div>

          {getStepStatus("entries", closingStatus) === "active" && (
            <div className="space-y-4">
              {showNoEntriesWarning && (
                <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                  <Warning className="size-4 text-yellow-600" />
                  <AlertTitle>Inga bokslutsbokningar hittades</AlertTitle>
                  <AlertDescription>
                    Det finns inga verifikationer daterade på bokslutsdagen ({currentPeriod?.endDate}).
                    Om inga periodiseringar, avskrivningar eller andra justeringar behövs kan du bekräfta och fortsätta.
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end gap-2">
                {showNoEntriesWarning && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      markEntriesCreated.mutate({
                        workspaceId,
                        fiscalPeriodId: selectedPeriodId,
                        acknowledgeNoEntries: true,
                      })
                    }
                    disabled={markEntriesCreated.isPending}
                  >
                    {markEntriesCreated.isPending
                      ? "Sparar..."
                      : "Bekräfta och fortsätt ändå"}
                  </Button>
                )}
                <Button
                  onClick={() =>
                    markEntriesCreated.mutate({
                      workspaceId,
                      fiscalPeriodId: selectedPeriodId,
                    })
                  }
                  disabled={markEntriesCreated.isPending}
                >
                  {markEntriesCreated.isPending
                    ? "Sparar..."
                    : "Markera bokslutsbokningar som klara"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </WizardStepCard>

      {/* Step 4: Skatt och resultat */}
      <WizardStepCard
        stepNumber={4}
        title="Skatt och resultat"
        description="Beräkna bolagsskatt och årets resultat"
        status={getStepStatus("tax", closingStatus)}
        isExpanded={expandedStep === "tax"}
        onToggle={() => handleToggleStep("tax")}
        completedLabel="Beräknad"
      >
        <div className="space-y-4">
          {taxData && (
            <>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="px-4 font-medium">Intäkter</TableCell>
                    <TableCell className="px-4 text-right font-mono">
                      {formatCurrency(taxData.revenue)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-4 font-medium">Kostnader</TableCell>
                    <TableCell className="px-4 text-right font-mono">
                      - {formatCurrency(taxData.expenses)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t-2">
                    <TableCell className="px-4 font-medium">
                      Resultat före skatt
                    </TableCell>
                    <TableCell
                      className={`px-4 text-right font-mono font-bold ${
                        taxData.profitBeforeTax >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(taxData.profitBeforeTax)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-4 font-medium">
                      Bolagsskatt ({formatPercent(taxData.taxRate)})
                    </TableCell>
                    <TableCell className="px-4 text-right font-mono">
                      - {formatCurrency(taxData.calculatedTax)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t-2 bg-muted/50">
                    <TableCell className="px-4 font-bold">Årets resultat</TableCell>
                    <TableCell
                      className={`px-4 text-right font-mono font-bold text-lg ${
                        taxData.profitAfterTax >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(taxData.profitAfterTax)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {taxData.taxableProfit <= 0 && (
                <Alert>
                  <Info className="size-4" />
                  <AlertDescription>
                    Ingen skatt att betala då det skattemässiga resultatet är
                    negativt.
                  </AlertDescription>
                </Alert>
              )}

              {getStepStatus("tax", closingStatus) === "active" && (
                <div className="flex justify-end">
                  <Button
                    onClick={() =>
                      saveTax.mutate({
                        workspaceId,
                        fiscalPeriodId: selectedPeriodId,
                        calculatedProfit: taxData.profitBeforeTax,
                        calculatedTax: taxData.calculatedTax,
                      })
                    }
                    disabled={saveTax.isPending}
                  >
                    {saveTax.isPending ? "Sparar..." : "Spara skatteberäkning"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </WizardStepCard>

      {/* Step 5: Färdigställ bokslut */}
      <WizardStepCard
        stepNumber={5}
        title="Färdigställ bokslut"
        description="Lås räkenskapsåret och slutför bokslutet"
        status={getStepStatus("finalize", closingStatus)}
        isExpanded={expandedStep === "finalize"}
        onToggle={() => handleToggleStep("finalize")}
        completedLabel="Färdigställt"
      >
        <div className="space-y-4">
          <Alert>
            <Warning className="size-4" />
            <AlertTitle>Viktigt</AlertTitle>
            <AlertDescription>
              När bokslutet är färdigställt låses räkenskapsåret och inga fler
              bokningar kan göras. Detta steg kan endast genomföras minst 2
              bankdagar efter räkenskapsårets slut.
            </AlertDescription>
          </Alert>

          {currentPeriod && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Räkenskapsår:</span>
                  <span className="ml-2 font-medium">{currentPeriod.label}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Slutdatum:</span>
                  <span className="ml-2 font-medium">{currentPeriod.endDate}</span>
                </div>
                {closingData?.closing?.closingPackage && (
                  <div>
                    <span className="text-muted-foreground">Bokslutspaket:</span>
                    <span className="ml-2 font-medium">
                      {closingData.closing.closingPackage.toUpperCase()}
                    </span>
                  </div>
                )}
                {closingData?.closing?.calculatedTax && (
                  <div>
                    <span className="text-muted-foreground">Beräknad skatt:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(parseFloat(closingData.closing.calculatedTax))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {getStepStatus("finalize", closingStatus) === "active" && (
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={finalize.isPending}>
                    <LockSimple className="mr-2 size-4" />
                    {finalize.isPending ? "Låser..." : "Färdigställ och lås bokslut"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Färdigställ bokslutet?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Detta kommer att låsa räkenskapsåret {currentPeriod?.label} permanent.
                      Inga fler bokningar kan göras efter detta. Åtgärden kan inte ångras.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Avbryt</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        finalize.mutate({
                          workspaceId,
                          fiscalPeriodId: selectedPeriodId,
                        })
                      }
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {finalize.isPending ? "Låser..." : "Ja, färdigställ"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </WizardStepCard>
    </div>
  );
}
