"use client";

import { Download, EnvelopeSimple, Check, Clock } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";

interface SalaryStatementsListProps {
  payrollRunId: string;
  workspaceId: string;
  onGenerateStatement: (entryId: string, sendEmail: boolean) => void;
  isGenerating: boolean;
  generatingId: string | null;
}

export function SalaryStatementsList({
  payrollRunId,
  workspaceId,
  onGenerateStatement,
  isGenerating,
  generatingId,
}: SalaryStatementsListProps) {
  const { data: statements, isLoading } = trpc.payroll.getSalaryStatements.useQuery({
    payrollRunId,
    workspaceId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lönebesked</CardTitle>
          <CardDescription>Genererade lönebesked för denna lönekörning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Spinner className="size-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statements || statements.length === 0) {
    return null;
  }

  const hasAnyStatements = statements.some((s) => s.statement !== null);

  if (!hasAnyStatements) {
    return null;
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lönebesked</CardTitle>
        <CardDescription>
          Genererade lönebesked för denna lönekörning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anställd</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Genererat</TableHead>
              <TableHead>Skickat</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statements.map((item) => (
              <TableRow key={item.payrollEntryId}>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.employeeName}</div>
                    {item.employeeEmail && (
                      <div className="text-sm text-muted-foreground">
                        {item.employeeEmail}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {item.statement ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                      <Check className="size-3 mr-1" />
                      Genererat
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700">
                      <Clock className="size-3 mr-1" />
                      Ej genererat
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {item.statement?.createdAt
                    ? formatDate(item.statement.createdAt)
                    : "-"}
                </TableCell>
                <TableCell>
                  {item.statement?.sentAt ? (
                    <div>
                      <div className="text-sm">{formatDate(item.statement.sentAt)}</div>
                      {item.statement.sentTo && (
                        <div className="text-xs text-muted-foreground">
                          {item.statement.sentTo}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {item.statement?.pdfUrl ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={item.statement.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <Download className="size-4 mr-1" />
                            Ladda ner
                          </a>
                        </Button>
                        {!item.statement.sentAt && item.employeeEmail && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onGenerateStatement(item.payrollEntryId, true)}
                            disabled={isGenerating && generatingId === item.payrollEntryId}
                          >
                            {isGenerating && generatingId === item.payrollEntryId ? (
                              <Spinner className="size-4" />
                            ) : (
                              <>
                                <EnvelopeSimple className="size-4 mr-1" />
                                Skicka
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onGenerateStatement(item.payrollEntryId, false)}
                        disabled={isGenerating && generatingId === item.payrollEntryId}
                      >
                        {isGenerating && generatingId === item.payrollEntryId ? (
                          <Spinner className="size-4" />
                        ) : (
                          "Generera"
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
