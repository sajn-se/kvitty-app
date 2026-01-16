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
import { Skeleton } from "@/components/ui/skeleton";
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
  isLoading?: boolean;
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
  isLoading = false,
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
          <TableHead className="px-4">Anställd</TableHead>
          <TableHead className="px-4 text-right">Bruttolön</TableHead>
          <TableHead className="px-4 text-right">Skatteavdrag</TableHead>
          <TableHead className="px-4 text-right">Arb.avg</TableHead>
          <TableHead className="px-4 text-right">Nettolön</TableHead>
          {isDraft && <TableHead className="px-4 w-[50px]"></TableHead>}
          {showSalaryStatementActions && <TableHead className="px-4 w-[50px]"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="px-4"><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell className="px-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
              <TableCell className="px-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
              <TableCell className="px-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
              <TableCell className="px-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
              {isDraft && <TableCell className="px-4"><Skeleton className="size-7 rounded-md" /></TableCell>}
              {showSalaryStatementActions && <TableCell className="px-4"><Skeleton className="size-7 rounded-md" /></TableCell>}
            </TableRow>
          ))
        ) : entries.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5 + (isDraft ? 1 : 0) + (showSalaryStatementActions ? 1 : 0)}
              className="h-24 text-center px-4 text-muted-foreground"
            >
              Inga anställda tillagda i denna lönekörning.
            </TableCell>
          </TableRow>
        ) : (
          entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="px-4 font-medium">
                {entry.employee.firstName} {entry.employee.lastName}
              </TableCell>
              <TableCell className="px-4 text-right font-mono">
                {formatCurrency(entry.grossSalary)}
              </TableCell>
              <TableCell className="px-4 text-right font-mono">
                {formatCurrency(entry.taxDeduction)}
              </TableCell>
              <TableCell className="px-4 text-right font-mono">
                {formatCurrency(entry.employerContributions)}
              </TableCell>
              <TableCell className="px-4 text-right font-mono">
                {formatCurrency(entry.netSalary)}
              </TableCell>
              {isDraft && (
                <TableCell className="px-4">
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
                <TableCell className="px-4">
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
          ))
        )}
      </TableBody>
    </Table>
  );
}

