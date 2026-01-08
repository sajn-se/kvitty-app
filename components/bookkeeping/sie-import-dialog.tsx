"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Check,
  Warning,
  X,
  ArrowRight,
  ArrowLeft,
  CircleNotch,
} from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { SIEImportPreview } from "./sie-import-preview";
import { formatCurrency } from "@/lib/utils";

interface FiscalPeriod {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

interface SIEImportDialogProps {
  workspaceId: string;
  workspaceSlug: string;
  periods: FiscalPeriod[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPeriodId?: string;
}

type Step = "upload" | "preview" | "result";

interface PreviewVerification {
  sourceId: string;
  date: string;
  description: string;
  lines: Array<{
    accountNumber: number;
    accountName: string;
    debit: number;
    credit: number;
    description?: string;
  }>;
  balanced: boolean;
  totalDebit: number;
  totalCredit: number;
}

interface PreviewData {
  format: string;
  verifications: PreviewVerification[];
  accounts: Array<{ id: string; name: string; type: string }>;
  companyName?: string;
  orgNumber?: string;
  fiscalYear?: { start: string; end: string };
  softwareProduct?: string;
  errors: string[];
  warnings: string[];
}

export function SIEImportDialog({
  workspaceId,
  periods,
  open,
  onOpenChange,
  defaultPeriodId,
}: SIEImportDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState(defaultPeriodId || periods[0]?.id || "");
  const [selectedVerifications, setSelectedVerifications] = useState<Set<string>>(new Set());
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    message: string;
  } | null>(null);

  const utils = trpc.useUtils();

  const previewMutation = trpc.journalEntries.previewSIEImport.useMutation({
    onSuccess: (data) => {
      setPreviewData(data);
      // Select all verifications by default
      setSelectedVerifications(new Set(data.verifications.map((v) => v.sourceId)));
      setStep("preview");
    },
    onError: (error) => {
      toast.error("Kunde inte läsa filen", {
        description: error.message,
      });
    },
  });

  const importMutation = trpc.journalEntries.importSIE.useMutation({
    onSuccess: (data) => {
      setImportResult(data);
      setStep("result");
      utils.journalEntries.list.invalidate();
    },
    onError: (error) => {
      toast.error("Import misslyckades", {
        description: error.message,
      });
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setSelectedFile(file);

      // Read file as ArrayBuffer to preserve encoding
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        // Convert to base64 for transport
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Content = btoa(binary);

        previewMutation.mutate({
          workspaceId,
          fileContent: base64Content,
          fileName: file.name,
        });
      };
      reader.onerror = () => {
        toast.error("Kunde inte läsa filen", {
          description: "Kontrollera att filen inte är skadad.",
        });
      };
      reader.readAsArrayBuffer(file);
    },
    [workspaceId, previewMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/xml": [".sie", ".se", ".si"],
      "text/plain": [".sie", ".se", ".si"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleImport = () => {
    if (!previewData || selectedVerifications.size === 0) return;

    const verificationsToImport = previewData.verifications
      .filter((v) => selectedVerifications.has(v.sourceId))
      .map((v) => ({
        sourceId: v.sourceId,
        date: v.date,
        description: v.description,
        lines: v.lines,
      }));

    importMutation.mutate({
      workspaceId,
      fiscalPeriodId: selectedPeriodId,
      verifications: verificationsToImport,
      sourceFileName: selectedFile?.name,
    });
  };

  const handleClose = () => {
    setStep("upload");
    setSelectedFile(null);
    setPreviewData(null);
    setSelectedVerifications(new Set());
    setImportResult(null);
    onOpenChange(false);
  };

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);

  // Filter verifications that are within the selected period
  const verificationsInPeriod =
    previewData?.verifications.filter(
      (v) =>
        selectedPeriod && v.date >= selectedPeriod.startDate && v.date <= selectedPeriod.endDate
    ) || [];

  const verificationsOutsidePeriod = (previewData?.verifications.length || 0) - verificationsInPeriod.length;

  // Update selection when period changes to only include verifications in the new period
  useEffect(() => {
    if (previewData && selectedPeriod) {
      const validIds = new Set(
        previewData.verifications
          .filter((v) => v.date >= selectedPeriod.startDate && v.date <= selectedPeriod.endDate)
          .map((v) => v.sourceId)
      );
      setSelectedVerifications((prev) => new Set([...prev].filter((id) => validIds.has(id))));
    }
  }, [selectedPeriodId, previewData, selectedPeriod]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "Importera SIE-fil"}
            {step === "preview" && "Förhandsgranska import"}
            {step === "result" && "Import slutförd"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Ladda upp en SIE-fil för att importera verifikationer från ett annat bokföringssystem."}
            {step === "preview" &&
              "Granska verifikationerna som kommer att importeras."}
            {step === "result" && "Importen är slutförd."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                `}
              >
                <input {...getInputProps()} />
                {previewMutation.isPending ? (
                  <div className="flex flex-col items-center gap-2">
                    <Spinner className="size-8" />
                    <p className="text-muted-foreground">Läser filen...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="size-10 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {isDragActive
                        ? "Släpp filen här..."
                        : "Dra och släpp en SIE-fil här, eller klicka för att välja"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stödjer SIE4 (.sie) och SIE5 (.sie) format, max 10 MB
                    </p>
                  </>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <h4 className="font-medium mb-2">Om SIE-import</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>SIE är ett svenskt standardformat för bokföringsdata</li>
                  <li>Exportera din SIE-fil från ditt befintliga bokföringssystem</li>
                  <li>Dubbletter hoppas automatiskt över</li>
                  <li>Varje importerad verifikation får ett nytt verifikationsnummer</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === "preview" && previewData && (
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="size-8 text-muted-foreground" weight="duotone" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {previewData.format.toUpperCase()} format
                    {previewData.companyName && ` • ${previewData.companyName}`}
                    {previewData.softwareProduct && ` • ${previewData.softwareProduct}`}
                  </p>
                </div>
                <Badge variant="secondary">{previewData.verifications.length} verifikationer</Badge>
              </div>

              {/* Errors */}
              {previewData.errors.length > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <X className="size-4" weight="bold" />
                    <span className="font-medium">Fel vid inlasning</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-destructive">
                    {previewData.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {previewData.warnings.length > 0 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-600 mb-2">
                    <Warning className="size-4" weight="bold" />
                    <span className="font-medium">Varningar</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-yellow-600">
                    {previewData.warnings.slice(0, 5).map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                    {previewData.warnings.length > 5 && (
                      <li>...och {previewData.warnings.length - 5} till</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Period selector */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Importera till period</Label>
                  <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem
                          key={period.id}
                          value={period.id}
                          disabled={period.isLocked}
                        >
                          {period.label}
                          {period.isLocked && " (låst)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {verificationsOutsidePeriod > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <Warning className="size-4 inline-block mr-1" />
                    {verificationsOutsidePeriod} verifikationer utanför perioden
                  </div>
                )}
              </div>

              {/* Preview table */}
              <SIEImportPreview
                verifications={verificationsInPeriod}
                selectedIds={selectedVerifications}
                onSelectionChange={setSelectedVerifications}
              />

              {/* Summary */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">{selectedVerifications.size}</span> av{" "}
                  <span className="font-medium">{verificationsInPeriod.length}</span> verifikationer valda
                </div>
                <div className="text-sm text-muted-foreground">
                  Totalt:{" "}
                  {formatCurrency(
                    verificationsInPeriod
                      .filter((v) => selectedVerifications.has(v.sourceId))
                      .reduce((sum, v) => sum + v.totalDebit, 0)
                  )}{" "}
                  debet
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Result */}
          {step === "result" && importResult && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-100 mb-4">
                <Check className="size-8 text-green-600" weight="bold" />
              </div>
              <h3 className="text-lg font-medium mb-2">Import slutford</h3>
              <p className="text-muted-foreground mb-4">{importResult.message}</p>
              <div className="flex justify-center gap-6 text-sm">
                <div>
                  <div className="text-2xl font-semibold text-green-600">{importResult.imported}</div>
                  <div className="text-muted-foreground">importerade</div>
                </div>
                {importResult.skipped > 0 && (
                  <div>
                    <div className="text-2xl font-semibold text-muted-foreground">
                      {importResult.skipped}
                    </div>
                    <div className="text-muted-foreground">dubbletter</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {step === "preview" && (
              <Button variant="ghost" onClick={() => setStep("upload")}>
                <ArrowLeft className="size-4 mr-2" />
                Tillbaka
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              {step === "result" ? "Stäng" : "Avbryt"}
            </Button>
            {step === "preview" && (
              <Button
                onClick={handleImport}
                disabled={
                  selectedVerifications.size === 0 ||
                  importMutation.isPending ||
                  selectedPeriod?.isLocked
                }
              >
                {importMutation.isPending ? (
                  <>
                    <CircleNotch className="size-4 mr-2 animate-spin" />
                    Importerar...
                  </>
                ) : (
                  <>
                    Importera {selectedVerifications.size} verifikationer
                    <ArrowRight className="size-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
