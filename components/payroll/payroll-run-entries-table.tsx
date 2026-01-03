"use client";

import { Trash, FileText, EnvelopeSimple, CaretDown } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";

interface PayrollEntry {
  id: string;
  employee: {
    firstName: string;
    lastName: string;
  };
  grossSalary: string;
  taxDeduction: string;
  employerContributions: string;
  netSalary: string;
}

interface PayrollRunEntriesTableProps {
  entries: PayrollEntry[];
  isDraft: boolean;
  onRemove: (entryId: string) => void;
  isRemoving?: boolean;
  showSalaryStatementActions?: boolean;
  onGenerateSalaryStatement?: (entryId: string, sendEmail: boolean) => void;
  isGeneratingSalaryStatement?: boolean;
  generatingSalaryStatementId?: string | null;
}

export function PayrollRunEntriesTable({
  entries,
  isDraft,
  onRemove,
  isRemoving = false,
  showSalaryStatementActions = false,
  onGenerateSalaryStatement,
  isGeneratingSalaryStatement = false,
  generatingSalaryStatementId = null,
}: PayrollRunEntriesTableProps) {
  const formatCurrency = (value: string | number | null) => {
    if (!value) return "0 kr";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `${num.toLocaleString("sv-SE")} kr`;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Anställd</TableHead>
          <TableHead className="text-right">Bruttolön</TableHead>
          <TableHead className="text-right">Skatteavdrag</TableHead>
          <TableHead className="text-right">Arb.avg</TableHead>
          <TableHead className="text-right">Nettolön</TableHead>
          {isDraft && <TableHead className="w-[50px]"></TableHead>}
          {showSalaryStatementActions && <TableHead className="w-[50px]"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="font-medium">
              {entry.employee.firstName} {entry.employee.lastName}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(entry.grossSalary)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(entry.taxDeduction)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(entry.employerContributions)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(entry.netSalary)}
            </TableCell>
            {isDraft && (
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(entry.id)}
                  disabled={isRemoving}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash className="size-4" />
                </Button>
              </TableCell>
            )}
            {showSalaryStatementActions && onGenerateSalaryStatement && (
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isGeneratingSalaryStatement && generatingSalaryStatementId === entry.id}
                      className="text-muted-foreground"
                    >
                      {isGeneratingSalaryStatement && generatingSalaryStatementId === entry.id ? (
                        <Spinner className="size-4" />
                      ) : (
                        <FileText className="size-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onGenerateSalaryStatement(entry.id, false)}
                    >
                      <FileText className="size-4 mr-2" />
                      Generera lönebesked
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onGenerateSalaryStatement(entry.id, true)}
                    >
                      <EnvelopeSimple className="size-4 mr-2" />
                      Skicka lönebesked
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

