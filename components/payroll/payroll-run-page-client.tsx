"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Calculator,
  Check,
  Download,
  FileCode,
  Money,
  EnvelopeSimple,
  FileText,
  CaretDown,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { useWorkspace } from "@/components/workspace-provider";
import { AddPayrollEntryDialog } from "@/components/payroll/add-payroll-entry-dialog";
import { AgiPreviewDialog } from "@/components/payroll/agi-preview-dialog";
import { PayrollRunEntriesTable } from "@/components/payroll/payroll-run-entries-table";
import { AGIDeadlineCard } from "@/components/payroll/agi-deadline-card";
import { SalaryStatementsList } from "@/components/payroll/salary-statements-list";

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Utkast", color: "bg-gray-100 text-gray-700" },
  calculated: { label: "Beräknad", color: "bg-blue-100 text-blue-700" },
  approved: { label: "Godkänd", color: "bg-green-100 text-green-700" },
  paid: { label: "Utbetald", color: "bg-purple-100 text-purple-700" },
  reported: { label: "Rapporterad", color: "bg-teal-100 text-teal-700" },
};

interface PayrollRunPageClientProps {
  runId: string;
  workspaceSlug: string;
}

export function PayrollRunPageClient({ runId, workspaceSlug }: PayrollRunPageClientProps) {
  const router = useRouter();
  const { workspace } = useWorkspace();

  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [agiPreviewOpen, setAgiPreviewOpen] = useState(false);
  const [generatingSalaryStatementId, setGeneratingSalaryStatementId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: run, isLoading } = trpc.payroll.getRun.useQuery({
    id: runId,
    workspaceId: workspace.id,
  });

  const { data: employeesData } = trpc.employees.list.useQuery({
    workspaceId: workspace.id,
  });
  const employees = employeesData?.items;

  const removeEntry = trpc.payroll.removeEntry.useMutation({
    onSuccess: () => {
      utils.payroll.getRun.invalidate();
    },
  });

  const calculateRun = trpc.payroll.calculateRun.useMutation({
    onSuccess: () => {
      utils.payroll.getRun.invalidate();
    },
  });

  const approveRun = trpc.payroll.approveRun.useMutation({
    onSuccess: () => {
      utils.payroll.getRun.invalidate();
    },
  });

  const generateAGI = trpc.payroll.generateAGI.useMutation({
    onSuccess: () => {
      utils.payroll.getRun.invalidate();
      setAgiPreviewOpen(true);
    },
  });

  const markAsPaid = trpc.payroll.markAsPaid.useMutation({
    onSuccess: () => {
      utils.payroll.getRun.invalidate();
      toast.success("Lönekörningen har markerats som betald");
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte markera som betald");
    },
  });

  const generateAllSalaryStatements = trpc.payroll.generateAllSalaryStatements.useMutation({
    onSuccess: (data, variables) => {
      utils.payroll.getRun.invalidate();
      utils.payroll.getSalaryStatements.invalidate();
      if (variables.sendEmail) {
        toast.success(`Lönebesked har genererats och skickats till ${data.successful} anställda`);
      } else {
        toast.success(`Lönebesked har genererats för ${data.successful} anställda`);
      }
      if (data.failed > 0) {
        toast.error(`${data.failed} lönebesked kunde inte genereras`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte generera lönebesked");
    },
  });

  const generateSalaryStatement = trpc.payroll.generateSalaryStatement.useMutation({
    onSuccess: (data, variables) => {
      utils.payroll.getRun.invalidate();
      utils.payroll.getSalaryStatements.invalidate();
      setGeneratingSalaryStatementId(null);
      if (variables.sendEmail) {
        toast.success("Lönebesked har skickats");
      } else {
        toast.success("Lönebesked har genererats");
      }
    },
    onError: (error) => {
      setGeneratingSalaryStatementId(null);
      toast.error(error.message || "Kunde inte generera lönebesked");
    },
  });

  const handleGenerateSalaryStatement = (entryId: string, sendEmail: boolean) => {
    setGeneratingSalaryStatementId(entryId);
    generateSalaryStatement.mutate({
      payrollEntryId: entryId,
      workspaceId: workspace.id,
      sendEmail,
    });
  };

  const formatCurrency = (value: string | number | null) => {
    if (!value) return "0 kr";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `${num.toLocaleString("sv-SE")} kr`;
  };

  if (!run && !isLoading) {
    return (
      <div className="container py-6">
        <p>Lönekörning hittades inte.</p>
      </div>
    );
  }

  const status = run ? (statusLabels[run.status] || statusLabels.draft) : statusLabels.draft;
  const isDraft = run?.status === "draft";
  const canApprove = run?.status === "calculated" && (run?.entries.length ?? 0) > 0;
  const canGenerateAGI = run?.status === "approved";
  const canMarkAsPaid = run?.status === "approved" && !!run?.agiXml;
  const canSendSalaryStatements = (run?.status === "approved" || run?.status === "paid" || run?.status === "reported") && (run?.entries.length ?? 0) > 0;

  const availableEmployees = employees?.filter(
    (emp) => !run?.entries.some((entry) => entry.employeeId === emp.id)
  );

  return (
    <>
      <PageHeader
        workspaceSlug={workspaceSlug}
        workspaceName={workspace.name}
        breadcrumbs={[
          { label: "Personal", href: `/${workspaceSlug}/personal` },
          { label: "Lönekörningar", href: `/${workspaceSlug}/personal/lon` },
        ]}
        currentPage={isLoading ? "Laddar..." : `${run!.period.substring(0, 4)}-${run!.period.substring(4)} • Körning ${run!.runNumber}`}
      />

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            {isLoading ? (
              <>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-40 mt-2" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Lönekörning {run!.period.substring(0, 4)}-{run!.period.substring(4)}
                  </h1>
                  <Badge variant="outline" className={status.color}>
                    {status.label}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Körning {run!.runNumber} • Utbetalning {run!.paymentDate}
                </p>
              </>
            )}
          </div>

          {!isLoading && run && (
            <div className="flex gap-2">
              {isDraft && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => calculateRun.mutate({ payrollRunId: run.id, workspaceId: workspace.id })}
                    disabled={calculateRun.isPending || run.entries.length === 0}
                  >
                    {calculateRun.isPending ? <Spinner /> : <Calculator className="size-4 mr-2" />}
                    Beräkna
                  </Button>
                  <Button onClick={() => setAddEmployeeOpen(true)}>
                    <Plus className="size-4 mr-2" />
                    Lägg till anställd
                  </Button>
                </>
              )}
              {canApprove && (
                <Button
                  onClick={() => approveRun.mutate({ payrollRunId: run.id, workspaceId: workspace.id })}
                  disabled={approveRun.isPending}
                >
                  {approveRun.isPending ? <Spinner /> : <Check className="size-4 mr-2" />}
                  Godkänn
                </Button>
              )}
              {canGenerateAGI && (
                <Button
                  onClick={() => generateAGI.mutate({ payrollRunId: run.id, workspaceId: workspace.id })}
                  disabled={generateAGI.isPending}
                >
                  {generateAGI.isPending ? <Spinner /> : <FileCode className="size-4 mr-2" />}
                  Generera arbetsgivardeklaration
                </Button>
              )}
              {run.agiXml && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([run.agiXml!], { type: "application/xml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `AGI_${run.period}_${run.runNumber}.xml`;
                    a.click();
                  }}
                >
                  <Download className="size-4 mr-2" />
                  Ladda ner arbetsgivardeklaration
                </Button>
              )}
              {canMarkAsPaid && (
                <Button
                  onClick={() => markAsPaid.mutate({ payrollRunId: run.id, workspaceId: workspace.id })}
                  disabled={markAsPaid.isPending}
                >
                  {markAsPaid.isPending ? <Spinner /> : <Money className="size-4 mr-2" />}
                  Markera som betald
                </Button>
              )}
              {canSendSalaryStatements && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={generateAllSalaryStatements.isPending}>
                      {generateAllSalaryStatements.isPending ? (
                        <Spinner />
                      ) : (
                        <FileText className="size-4 mr-2" />
                      )}
                      Lönebesked
                      <CaretDown className="size-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        generateAllSalaryStatements.mutate({
                          payrollRunId: run.id,
                          workspaceId: workspace.id,
                          sendEmail: false,
                        })
                      }
                    >
                      <FileText className="size-4 mr-2" />
                      Generera lönebesked
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        generateAllSalaryStatements.mutate({
                          payrollRunId: run.id,
                          workspaceId: workspace.id,
                          sendEmail: true,
                        })
                      }
                    >
                      <EnvelopeSimple className="size-4 mr-2" />
                      Skicka lönebesked via e-post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Bruttolön</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <p className="text-2xl font-bold">{formatCurrency(run!.totalGrossSalary)}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Skatteavdrag</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">{formatCurrency(run!.totalTaxDeduction)}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Arbetsgivaravgift</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <p className="text-2xl font-bold">{formatCurrency(run!.totalEmployerContributions)}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Nettolön</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <p className="text-2xl font-bold">{formatCurrency(run!.totalNetSalary)}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {run?.agiDeadline && (
          <AGIDeadlineCard
            payrollRunId={run.id}
            workspaceId={workspace.id}
            agiDeadline={run.agiDeadline}
            agiConfirmedAt={run.agiConfirmedAt}
            hasAGI={!!run.agiXml}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <PayrollRunEntriesTable
              entries={run?.entries.map((entry) => ({
                id: entry.id,
                employee: {
                  firstName: entry.employee.firstName,
                  lastName: entry.employee.lastName,
                },
                grossSalary: entry.grossSalary,
                taxDeduction: entry.taxDeduction,
                employerContributions: entry.employerContributions,
                netSalary: entry.netSalary,
              })) ?? []}
              isDraft={isDraft ?? false}
              onRemove={(entryId) => removeEntry.mutate({ id: entryId, workspaceId: workspace.id })}
              isRemoving={removeEntry.isPending}
              showSalaryStatementActions={canSendSalaryStatements}
              onGenerateSalaryStatement={handleGenerateSalaryStatement}
              isGeneratingSalaryStatement={generateSalaryStatement.isPending}
              generatingSalaryStatementId={generatingSalaryStatementId}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {canSendSalaryStatements && run && (
          <SalaryStatementsList
            payrollRunId={run.id}
            workspaceId={workspace.id}
            onGenerateStatement={handleGenerateSalaryStatement}
            isGenerating={generateSalaryStatement.isPending}
            generatingId={generatingSalaryStatementId}
          />
        )}

        {run && (
          <AddPayrollEntryDialog
            payrollRunId={run.id}
            workspaceId={workspace.id}
            open={addEmployeeOpen}
            onOpenChange={setAddEmployeeOpen}
            availableEmployees={availableEmployees || []}
            onSuccess={() => utils.payroll.getRun.invalidate()}
          />
        )}

        {run && (
          <AgiPreviewDialog
            open={agiPreviewOpen}
            onOpenChange={setAgiPreviewOpen}
            agiXml={run.agiXml}
            period={run.period}
            runNumber={run.runNumber}
          />
        )}
      </div>
    </>
  );
}

