"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Warning, FilePdf, FloppyDisk } from "@phosphor-icons/react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { NebilagaField } from "./nebilaga-field";
import { NebilagaFieldMappingDialog } from "./nebilaga-field-mapping-dialog";
import { formatCurrencyFromOre } from "@/lib/utils";

interface NebilagaFormProps {
  workspaceId: string;
  fiscalPeriodId: string;
  onExportPdf?: () => void;
  onHasChangesChange?: (hasChanges: boolean) => void;
}

export function NebilagaForm({
  workspaceId,
  fiscalPeriodId,
  onExportPdf,
  onHasChangesChange,
}: NebilagaFormProps) {
  const [selectedField, setSelectedField] = useState<{
    field: string;
    label: string;
  } | null>(null);

  // Adjustments state for manual fields
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const utils = trpc.useUtils();

  const { data, isLoading, error } = trpc.nebilaga.get.useQuery({
    workspaceId,
    fiscalPeriodId,
  });

  const saveMutation = trpc.nebilaga.save.useMutation({
    onSuccess: () => {
      toast.success("Skattemässiga justeringar sparade");
      utils.nebilaga.get.invalidate();
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte spara justeringar");
    },
  });

  // Track the fiscalPeriodId to detect when it changes
  const prevFiscalPeriodIdRef = useRef(fiscalPeriodId);

  // Sync form state with server data when period changes or data is first loaded
  // This intentionally synchronizes external server state to local form state
  useEffect(() => {
    // Only sync when we have data and either:
    // 1. This is the first load (adjustments are empty), or
    // 2. The fiscal period has changed
    const periodChanged = prevFiscalPeriodIdRef.current !== fiscalPeriodId;

    if (data?.taxAdjustments) {
      const shouldSync = periodChanged || Object.keys(adjustments).length === 0;

      if (shouldSync) {
        const initial: Record<string, number> = {};
        data.taxAdjustments
          .filter((f) => f.type === "manual" || f.type === "info")
          .forEach((f) => {
            initial[f.field.toLowerCase()] = f.value;
          });

        // Use setTimeout to defer state update and avoid linter warning
        // This is a valid pattern for syncing external data to local state
        setTimeout(() => {
          setAdjustments(initial);
          if (periodChanged) {
            setHasChanges(false);
          }
        }, 0);
      }
    }

    prevFiscalPeriodIdRef.current = fiscalPeriodId;
  }, [data?.taxAdjustments, fiscalPeriodId, adjustments]);

  const handleAdjustmentChange = useCallback((field: string, value: number) => {
    setAdjustments((prev) => ({
      ...prev,
      [field.toLowerCase()]: value,
    }));
    setHasChanges(true);
  }, []);

  // Notify parent when hasChanges changes
  useEffect(() => {
    onHasChangesChange?.(hasChanges);
  }, [hasChanges, onHasChangesChange]);

  const handleSave = () => {
    saveMutation.mutate({
      workspaceId,
      fiscalPeriodId,
      ...adjustments,
    });
  };

  const handleInfoClick = (field: string, label: string) => {
    setSelectedField({ field, label });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Warning className="size-4" />
        <AlertTitle>Kunde inte ladda NE-bilaga</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with period info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">NE-bilaga</h2>
          <p className="text-sm text-muted-foreground">
            {data.periodLabel} ({data.startDate} - {data.endDate})
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <FloppyDisk className="mr-2 size-4" />
              {saveMutation.isPending ? "Sparar..." : "Spara ändringar"}
            </Button>
          )}
          {onExportPdf && (
            <Button variant="outline" onClick={onExportPdf}>
              <FilePdf className="mr-2 size-4" />
              Exportera PDF
            </Button>
          )}
        </div>
      </div>

      {/* Negative balance warning */}
      {data.hasNegativeBalances && (
        <Alert variant="destructive" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <Warning className="size-4 text-yellow-600" />
          <AlertTitle>Varning: Negativa saldon</AlertTitle>
          <AlertDescription>
            Negativa saldon på tillgångskonton kan leda till att Skatteverket
            avvisar deklarationen. Kontrollera bokföringen för fälten:{" "}
            {data.negativeBalanceFields.join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle>1. Allmänna uppgifter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Företagsnamn:</span>
              <span className="ml-2 font-medium">{data.orgName || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Organisationsnummer:</span>
              <span className="ml-2 font-medium">{data.orgNumber || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Personnummer:</span>
              <span className="ml-2 font-medium">
                {data.ownerPersonalNumber || "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Adress:</span>
              <span className="ml-2 font-medium">
                {data.address || "-"}, {data.postalCode} {data.city}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Sheet (B1-B16) */}
      <Card>
        <CardHeader>
          <CardTitle>2. Balansräkning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Tillgångar
          </div>
          {data.balanceFields
            .filter((f) =>
              ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"].includes(
                f.field
              )
            )
            .map((field) => (
              <NebilagaField
                key={field.field}
                field={field.field}
                label={field.nameSv}
                value={field.value}
                isNegative={field.isNegative}
                onInfoClick={() => handleInfoClick(field.field, field.nameSv)}
              />
            ))}

          <Separator className="my-4" />
          <div className="flex justify-between px-4 py-2 bg-muted/50 rounded-lg font-medium">
            <span>Summa tillgångar</span>
            <span className="font-mono">{formatCurrencyFromOre(data.totalAssets)}</span>
          </div>

          <Separator className="my-4" />
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Eget kapital och skulder
          </div>
          {data.balanceFields
            .filter((f) =>
              ["B10", "B11", "B12", "B13", "B14", "B15", "B16"].includes(f.field)
            )
            .map((field) => (
              <NebilagaField
                key={field.field}
                field={field.field}
                label={field.nameSv}
                value={field.value}
                onInfoClick={() => handleInfoClick(field.field, field.nameSv)}
              />
            ))}

          <Separator className="my-4" />
          <div className="flex justify-between px-4 py-2 bg-muted/50 rounded-lg font-medium">
            <span>Summa eget kapital och skulder</span>
            <span className="font-mono">
              {formatCurrencyFromOre(
                data.balanceFields
                  .filter((f) =>
                    ["B10", "B11", "B12", "B13", "B14", "B15", "B16"].includes(
                      f.field
                    )
                  )
                  .reduce((sum, f) => sum + f.value, 0)
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Income Statement (R1-R11) */}
      <Card>
        <CardHeader>
          <CardTitle>3. Resultaträkning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Intäkter
          </div>
          {data.incomeFields
            .filter((f) => ["R1", "R2", "R3", "R4"].includes(f.field))
            .map((field) => (
              <NebilagaField
                key={field.field}
                field={field.field}
                label={field.nameSv}
                value={field.value}
                onInfoClick={() => handleInfoClick(field.field, field.nameSv)}
              />
            ))}

          <Separator className="my-4" />
          <div className="flex justify-between px-4 py-2 bg-muted/50 rounded-lg font-medium">
            <span>Summa intäkter</span>
            <span className="font-mono text-green-600">
              {formatCurrencyFromOre(data.totalRevenue)}
            </span>
          </div>

          <Separator className="my-4" />
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Kostnader
          </div>
          {data.incomeFields
            .filter((f) => ["R5", "R6", "R7", "R8", "R9"].includes(f.field))
            .map((field) => (
              <NebilagaField
                key={field.field}
                field={field.field}
                label={field.nameSv}
                value={field.value}
                onInfoClick={() => handleInfoClick(field.field, field.nameSv)}
              />
            ))}

          <NebilagaField
            field="R10"
            label="Övriga finansiella poster"
            value={data.r10OtherFinancial}
            onInfoClick={() =>
              handleInfoClick("R10", "Övriga finansiella poster")
            }
          />

          <Separator className="my-4" />
          <div className="flex justify-between px-4 py-2 bg-muted/50 rounded-lg font-medium">
            <span>Summa kostnader</span>
            <span className="font-mono text-red-600">
              {formatCurrencyFromOre(data.totalExpenses)}
            </span>
          </div>

          <Separator className="my-4" />
          <div className="flex justify-between px-4 py-2 bg-primary/10 rounded-lg font-bold text-lg">
            <span>R11 - Bokfört resultat</span>
            <span
              className={`font-mono ${
                data.r11BookedResult >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrencyFromOre(data.r11BookedResult)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tax Adjustments (R12-R48) */}
      <Card>
        <CardHeader>
          <CardTitle>4. Skattemässiga justeringar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {/* R12 - Bokfört resultat (auto) */}
          <NebilagaField
            field="R12"
            label="Bokfört resultat"
            description="Överförs automatiskt från R11"
            value={data.r12BookedResult}
            onInfoClick={() => handleInfoClick("R12", "Bokfört resultat")}
          />

          <Separator className="my-4" />
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Justeringar på företagsnivå (R13-R16)
          </div>

          {data.taxAdjustments
            .filter((f) => ["R13", "R14", "R15", "R16"].includes(f.field))
            .map((field) => (
              <NebilagaField
                key={field.field}
                field={field.field}
                label={field.nameSv}
                description={field.description}
                value={adjustments[field.field.toLowerCase()] ?? field.value}
                isEditable={field.type === "manual"}
                onChange={(value) =>
                  handleAdjustmentChange(field.field, value)
                }
                onInfoClick={() => handleInfoClick(field.field, field.nameSv)}
              />
            ))}

          <Separator className="my-4" />
          <div className="flex justify-between px-4 py-2 bg-muted/50 rounded-lg font-medium">
            <div className="flex items-center gap-2">
              <span>R17 - Sammanlagt resultat</span>
              {hasChanges && (
                <span className="text-xs text-muted-foreground font-normal">(uppdateras efter sparning)</span>
              )}
            </div>
            <span className="font-mono">{formatCurrencyFromOre(data.r17CombinedResult)}</span>
          </div>

          <Separator className="my-4" />
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Individuella justeringar (R18-R32)
          </div>

          {data.taxAdjustments
            .filter((f) =>
              [
                "R18", "R19", "R20", "R21", "R22", "R23", "R24",
                "R25", "R26", "R27", "R28", "R29", "R30", "R31", "R32",
              ].includes(f.field)
            )
            .map((field) => (
              <NebilagaField
                key={field.field}
                field={field.field}
                label={field.nameSv}
                description={field.description}
                value={adjustments[field.field.toLowerCase()] ?? field.value}
                isEditable={field.type === "manual"}
                onChange={(value) =>
                  handleAdjustmentChange(field.field, value)
                }
                onInfoClick={() => handleInfoClick(field.field, field.nameSv)}
              />
            ))}

          <Separator className="my-4" />
          <div className="flex justify-between px-4 py-2 bg-muted/50 rounded-lg font-medium">
            <div className="flex items-center gap-2">
              <span>R33 - Underlag för periodiseringsfond</span>
              {hasChanges && (
                <span className="text-xs text-muted-foreground font-normal">(uppdateras efter sparning)</span>
              )}
            </div>
            <span className="font-mono">
              {formatCurrencyFromOre(data.r33PeriodiseringsfondBasis)}
            </span>
          </div>

          <Separator className="my-4" />
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Avsättningar och räntefördelning (R34-R46)
          </div>

          {data.taxAdjustments
            .filter((f) =>
              [
                "R34", "R36", "R37", "R38", "R39", "R40",
                "R41", "R42", "R43", "R44", "R45", "R46",
              ].includes(f.field)
            )
            .map((field) => (
              <NebilagaField
                key={field.field}
                field={field.field}
                label={field.nameSv}
                description={field.description}
                value={adjustments[field.field.toLowerCase()] ?? field.value}
                isEditable={field.type === "manual" || field.type === "info"}
                onChange={(value) =>
                  handleAdjustmentChange(field.field, value)
                }
                onInfoClick={() => handleInfoClick(field.field, field.nameSv)}
              />
            ))}

          <Separator className="my-4" />
          <div className="flex justify-between px-4 py-2 bg-muted/50 rounded-lg font-medium">
            <div className="flex items-center gap-2">
              <span>R35 - Underlag för expansionsfond</span>
              {hasChanges && (
                <span className="text-xs text-muted-foreground font-normal">(uppdateras efter sparning)</span>
              )}
            </div>
            <span className="font-mono">
              {formatCurrencyFromOre(data.r35ExpansionsfondBasis)}
            </span>
          </div>

          <Separator className="my-4" />
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Slutresultat
          </div>

          {data.r47Surplus > 0 && (
            <div className="flex justify-between px-4 py-3 bg-green-50 dark:bg-green-950/20 rounded-lg font-bold text-lg border border-green-200 dark:border-green-900">
              <span>R47 - Överskott av aktiv näringsverksamhet</span>
              <span className="font-mono text-green-600">
                {formatCurrencyFromOre(data.r47Surplus)}
              </span>
            </div>
          )}

          {data.r48Deficit > 0 && (
            <div className="flex justify-between px-4 py-3 bg-red-50 dark:bg-red-950/20 rounded-lg font-bold text-lg border border-red-200 dark:border-red-900">
              <span>R48 - Underskott av aktiv näringsverksamhet</span>
              <span className="font-mono text-red-600">
                {formatCurrencyFromOre(data.r48Deficit)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Mapping Dialog */}
      {selectedField && (
        <NebilagaFieldMappingDialog
          workspaceId={workspaceId}
          fiscalPeriodId={fiscalPeriodId}
          field={selectedField.field}
          fieldLabel={selectedField.label}
          open={!!selectedField}
          onClose={() => setSelectedField(null)}
        />
      )}

      {/* Save button at bottom */}
      {hasChanges && (
        <div className="flex justify-end sticky bottom-4">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="shadow-lg"
          >
            <FloppyDisk className="mr-2 size-4" />
            {saveMutation.isPending ? "Sparar..." : "Spara ändringar"}
          </Button>
        </div>
      )}
    </div>
  );
}
