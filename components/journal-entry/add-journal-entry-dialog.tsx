"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useS3Upload } from "@/lib/hooks/use-s3-upload";
import {
  Plus,
  Receipt,
  Money,
  FileText,
  DotsThree,
  Check,
  ArrowLeft,
  CloudArrowUp,
  X,
  File,
  SidebarIcon,
} from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { JournalEntryLineRow } from "./journal-entry-line-row";
import { TemplateSelector } from "./template-selector";
import { TemplateInputForm } from "./template-input-form";
import { AIChat } from "@/components/ai-chat";
import { trpc } from "@/lib/trpc/client";
import type { fiscalPeriods } from "@/lib/db/schema";
import type { JournalEntryLineInput, JournalEntryType } from "@/lib/validations/journal-entry";
import type { VerificationTemplate, ScaledTransaction } from "@/lib/types/templates";
import { VERIFICATION_TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/consts/verification-templates";

type FiscalPeriod = typeof fiscalPeriods.$inferSelect;

interface AddJournalEntryDialogProps {
  workspaceId: string;
  workspaceSlug: string;
  periods: FiscalPeriod[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPeriodId?: string;
  initialFiles?: File[];
  initialDescription?: string;
  initialLines?: JournalEntryLineInput[];
  initialEntryDate?: string;
  initialEntryType?: JournalEntryType;
}

type Step = 1 | 2 | "template-input" | 3;

const entryTypes: { value: JournalEntryType; label: string; description: string; icon: typeof Receipt }[] = [
  { value: "kvitto", label: "Kvitto/Utgift", description: "Registrera inköp och utlägg", icon: Receipt },
  { value: "inkomst", label: "Inkomst", description: "Bokför försäljning och intäkter", icon: Money },
  { value: "leverantorsfaktura", label: "Leverantörsfaktura", description: "Hantera fakturor från leverantörer", icon: FileText },
  { value: "annat", label: "Annat", description: "Övriga bokföringshändelser", icon: DotsThree },
];

const emptyLine: JournalEntryLineInput = {
  accountNumber: 0,
  accountName: "",
  debit: undefined,
  credit: undefined,
};

const AI_CHAT_STORAGE_KEY = "kvitty:ai-chat-visible";

export function AddJournalEntryDialog({
  workspaceId,
  workspaceSlug,
  periods,
  open,
  onOpenChange,
  defaultPeriodId,
  initialFiles,
  initialDescription,
  initialLines,
  initialEntryDate,
  initialEntryType,
}: AddJournalEntryDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [fiscalPeriodId, setFiscalPeriodId] = useState(defaultPeriodId || periods[0]?.id || "");
  const [entryType, setEntryType] = useState<JournalEntryType>(initialEntryType || "kvitto");
  const [entryDate, setEntryDate] = useState(initialEntryDate || new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState(initialDescription || "");
  const [lines, setLines] = useState<JournalEntryLineInput[]>(
    initialLines && initialLines.length > 0
      ? initialLines
      : [{ ...emptyLine }, { ...emptyLine }]
  );
  const [files, setFiles] = useState<File[]>(initialFiles || []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<VerificationTemplate | null>(null);

  // AI Chat visibility
  const [showAIChat, setShowAIChat] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(AI_CHAT_STORAGE_KEY);
    return stored !== "false";
  });

  // Persist AI chat visibility
  const toggleAIChat = () => {
    setShowAIChat((prev) => {
      const next = !prev;
      localStorage.setItem(AI_CHAT_STORAGE_KEY, String(next));
      return next;
    });
  };

  // Get direction filter based on entry type
  const getDirectionFilter = (): "In" | "Out" | "all" => {
    if (entryType === "kvitto" || entryType === "leverantorsfaktura") {
      return "In";
    }
    if (entryType === "inkomst") {
      return "Out";
    }
    return "all";
  };

  const analyzeReceipt = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze-receipt", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.date) {
          setEntryDate(result.data.date);
        }
        if (result.data.suggestedEntry) {
          if (result.data.suggestedEntry.description) {
            setDescription(result.data.suggestedEntry.description);
          }
          if (result.data.suggestedEntry.lines) {
            setLines(
              result.data.suggestedEntry.lines.map((l: { accountNumber: number; accountName: string; debit: number; credit: number }) => ({
                accountNumber: l.accountNumber,
                accountName: l.accountName,
                debit: l.debit || undefined,
                credit: l.credit || undefined,
              }))
            );
          }
        } else if (result.data.description) {
          setDescription(result.data.description);
        }
        setStep(3);
      }
    } catch (err) {
      console.error("Failed to analyze receipt:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    const imageFile = acceptedFiles.find((f) => f.type.startsWith("image/"));
    if (imageFile) {
      analyzeReceipt(imageFile);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxSize: MAX_FILE_SIZE,
    onDropRejected: (rejectedFiles) => {
      const tooLarge = rejectedFiles.filter(f =>
        f.errors.some(e => e.code === "file-too-large")
      );
      if (tooLarge.length > 0) {
        toast.error("Filen är för stor", {
          description: "Max filstorlek är 25MB",
        });
      }
    },
  });

  const utils = trpc.useUtils();
  const { upload: s3Upload } = useS3Upload();
  const addAttachment = trpc.journalEntries.addAttachment.useMutation();

  const uploadFiles = async (journalEntryId: string) => {
    let successCount = 0;
    const failedFiles: string[] = [];

    for (const file of files) {
      try {
        const { cloudFrontUrl } = await s3Upload(file, { workspaceSlug });
        await addAttachment.mutateAsync({
          workspaceId,
          journalEntryId,
          fileName: file.name,
          fileUrl: cloudFrontUrl,
          fileSize: file.size,
          mimeType: file.type,
        });
        successCount++;
      } catch (err) {
        console.error("Failed to upload file:", file.name, err);
        failedFiles.push(file.name);
      }
    }

    if (failedFiles.length > 0) {
      toast.error("Vissa filer kunde inte laddas upp", {
        description: failedFiles.join(", "),
      });
    } else if (successCount > 0) {
      toast.success(successCount === 1 ? "Fil bifogad" : `${successCount} filer bifogade`);
    }
  };

  const createEntry = trpc.journalEntries.create.useMutation({
    onSuccess: async (data) => {
      if (files.length > 0) {
        setIsUploading(true);
        await uploadFiles(data.id);
        setIsUploading(false);
      }
      utils.journalEntries.list.invalidate();
      onOpenChange(false);
      resetForm();
      router.refresh();
    },
    onError: (err) => {
      setError(err.message);
      setIsUploading(false);
    },
  });

  useEffect(() => {
    if (open) {
      if (initialFiles && initialFiles.length > 0) {
        setFiles(initialFiles);
      }
      if (initialDescription) {
        setDescription(initialDescription);
      }
      if (initialLines && initialLines.length > 0) {
        setLines(initialLines);
        setStep(3);
      }
      if (initialEntryDate) {
        setEntryDate(initialEntryDate);
      }
      if (initialEntryType) {
        setEntryType(initialEntryType);
      }
    } else {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setStep(1);
    setEntryType("kvitto");
    setEntryDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setLines([{ ...emptyLine }, { ...emptyLine }]);
    setFiles([]);
    setIsAnalyzing(false);
    setIsUploading(false);
    setError(null);
    setSelectedTemplate(null);
  };

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

  const handleAISuggestion = (suggestion: {
    description: string;
    lines: Array<{
      accountNumber: number;
      accountName: string;
      debit: number;
      credit: number;
    }>;
  }) => {
    setLines(
      suggestion.lines.map((l) => ({
        accountNumber: l.accountNumber,
        accountName: l.accountName,
        debit: l.debit || undefined,
        credit: l.credit || undefined,
      }))
    );
    if (suggestion.description && !description) {
      setDescription(suggestion.description);
    }
  };

  const handleSelectTemplate = (template: VerificationTemplate) => {
    setSelectedTemplate(template);
    setStep("template-input");
  };

  const handleSelectManual = () => {
    setStep(3);
  };

  const handleTemplateSubmit = (
    transactions: ScaledTransaction[],
    title: string,
    comment?: string
  ) => {
    setDescription(title + (comment ? ` - ${comment}` : ""));
    setLines(
      transactions.map((t) => ({
        accountNumber: t.accountNumber,
        accountName: t.accountName,
        debit: t.debit,
        credit: t.credit,
      }))
    );
    setStep(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      setError(`Verifikationen balanserar inte. Debet: ${totalDebit}, Kredit: ${totalCredit}`);
      return;
    }

    createEntry.mutate({
      workspaceId,
      fiscalPeriodId,
      entryDate,
      description,
      entryType,
      sourceType: selectedTemplate ? "manual" : "manual",
      lines: validLines,
    });
  };

  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const getBackStep = (): Step => {
    if (step === 2) return 1;
    if (step === "template-input") return 2;
    if (step === 3) return selectedTemplate ? "template-input" : 2;
    return 1;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-h-[70vh] overflow-hidden flex flex-col",
        showAIChat ? "min-w-5xl" : "min-w-2xl"
      )}>
        <DialogHeader>
          <DialogTitle>Ny verifikation</DialogTitle>
        </DialogHeader>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              tabIndex={-1}
              onClick={toggleAIChat}
              className={cn(
                "absolute top-2 right-12",
                !showAIChat && "text-muted-foreground"
              )}
            >
              <SidebarIcon className="size-4" weight={showAIChat ? "fill" : "regular"} />
              <span className="sr-only">{showAIChat ? "Dölj AI-assistent" : "Visa AI-assistent"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {showAIChat ? "Dölj AI-assistent" : "Visa AI-assistent"}
          </TooltipContent>
        </Tooltip>

        <div className={cn(
          "flex-1 overflow-hidden",
          showAIChat ? "grid grid-cols-2 gap-4" : ""
        )}>
          {/* Left side - Step content */}
          <div className="flex flex-col overflow-hidden">
            {step === 1 && (
              /* Step 1: Entry Type Selection */
              <div className="flex flex-col h-full">
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors mb-4",
                    isAnalyzing
                      ? "border-primary bg-primary/5"
                      : isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <input {...getInputProps()} />
                  {isAnalyzing ? (
                    <>
                      <Spinner className="size-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Analyserar kvitto...</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        AI läser av och fyller i formuläret
                      </p>
                    </>
                  ) : (
                    <>
                      <CloudArrowUp className="size-8 mx-auto mb-2 text-muted-foreground" weight="duotone" />
                      <p className="text-sm text-muted-foreground">
                        {isDragActive
                          ? "Släpp filen här..."
                          : "Ladda upp kvitto för automatisk ifyllning"}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  {entryTypes.map((type) => {
                    const isSelected = entryType === type.value;
                    const Icon = type.icon;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setEntryType(type.value)}
                        disabled={isAnalyzing}
                        className={cn(
                          "relative flex items-center gap-3 w-full rounded-xl border-2 p-4 text-left transition-all",
                          "hover:border-primary/50 hover:bg-muted/50",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card"
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-lg",
                            isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="size-5" weight="duotone" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{type.label}</h3>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                        {isSelected && (
                          <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3" weight="bold" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-4 border-t mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isAnalyzing}
                    className="flex-1"
                  >
                    Avbryt
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={isAnalyzing}
                    className="flex-1"
                  >
                    Fortsätt
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              /* Step 2: Template Selection */
              <TemplateSelector
                templates={VERIFICATION_TEMPLATES}
                categories={[...TEMPLATE_CATEGORIES]}
                direction={getDirectionFilter()}
                onSelectTemplate={handleSelectTemplate}
                onSelectManual={handleSelectManual}
                onBack={() => setStep(1)}
              />
            )}

            {step === "template-input" && selectedTemplate && (
              /* Step 2.5: Template Input */
              <TemplateInputForm
                template={selectedTemplate}
                defaultDate={entryDate}
                onSubmit={handleTemplateSubmit}
                onBack={() => {
                  setSelectedTemplate(null);
                  setStep(2);
                }}
              />
            )}

            {step === 3 && (
              /* Step 3: Form Entry */
              <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                <FieldGroup className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="period">Period</FieldLabel>
                      <Select value={fiscalPeriodId} onValueChange={setFiscalPeriodId}>
                        <SelectTrigger id="period">
                          <SelectValue placeholder="Välj period" />
                        </SelectTrigger>
                        <SelectContent>
                          {periods.map((period) => (
                            <SelectItem key={period.id} value={period.id}>
                              {period.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="date">Datum</FieldLabel>
                      <Input
                        id="date"
                        type="date"
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        required
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="description">Beskrivning</FieldLabel>
                    <Input
                      id="description"
                      type="text"
                      placeholder="T.ex. Inköp av dator"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Underlag</FieldLabel>
                    <div
                      {...getRootProps()}
                      className={cn(
                        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                        isDragActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <input {...getInputProps()} />
                      <CloudArrowUp className="size-8 mx-auto mb-2 text-muted-foreground" weight="duotone" />
                      <p className="text-sm text-muted-foreground">
                        {isDragActive
                          ? "Släpp filen här..."
                          : "Dra och släpp kvitto eller faktura, eller klicka för att välja"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, PNG, JPG (max 25MB)
                      </p>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                          >
                            <File className="size-4 text-muted-foreground shrink-0" weight="duotone" />
                            <span className="text-sm truncate flex-1">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(0)} KB
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              onClick={() => removeFile(index)}
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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
                          disabled={createEntry.isPending}
                        />
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddLine}
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
                      <span
                        className={
                          isBalanced ? "text-green-600" : "text-red-600"
                        }
                      >
                        {isBalanced ? "Balanserat" : "Obalanserat"}
                      </span>
                    </div>
                  </div>

                  {error && <FieldError>{error}</FieldError>}
                </FieldGroup>

                <div className="flex gap-3 pt-4 border-t mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(getBackStep())}
                    disabled={createEntry.isPending}
                  >
                    <ArrowLeft className="size-4 mr-2" />
                    Tillbaka
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEntry.isPending || isUploading || !isBalanced}
                    className="flex-1"
                  >
                    {createEntry.isPending || isUploading ? (
                      <>
                        <Spinner className="mr-2" />
                        {isUploading ? "Laddar upp filer..." : "Sparar..."}
                      </>
                    ) : (
                      "Spara verifikation"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Right side - AI Chat (toggleable) */}
          {showAIChat && (
            <div className="border-l pl-4 overflow-hidden">
              <AIChat
                onSuggestion={handleAISuggestion}
                context={{ entryType, description }}
                className="h-full"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
