"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/ui/table-pagination";

interface PayrollRun {
  id: string;
  period: string;
  runNumber: number;
  paymentDate: string;
  totalGrossSalary: string | null;
  totalEmployerContributions: string | null;
  status: string;
}

interface PayrollRunsTableProps {
  runs: PayrollRun[];
  workspaceSlug: string;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Utkast", color: "bg-gray-100 text-gray-700" },
  calculated: { label: "Beräknad", color: "bg-blue-100 text-blue-700" },
  approved: { label: "Godkänd", color: "bg-green-100 text-green-700" },
  paid: { label: "Utbetald", color: "bg-purple-100 text-purple-700" },
  reported: { label: "Rapporterad", color: "bg-teal-100 text-teal-700" },
};

export function PayrollRunsTable({
  runs,
  workspaceSlug,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
}: PayrollRunsTableProps) {
  const formatCurrency = (value: string | null) => {
    if (!value) return "0 kr";
    return `${parseFloat(value).toLocaleString("sv-SE")} kr`;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4">Period</TableHead>
            <TableHead className="px-4">Körning</TableHead>
            <TableHead className="px-4">Utbetalningsdatum</TableHead>
            <TableHead className="px-4 text-right">Bruttolön</TableHead>
            <TableHead className="px-4 text-right">Arbetsgivaravgift</TableHead>
            <TableHead className="px-4">Status</TableHead>
            <TableHead className="px-4 w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="px-4"><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell className="px-4"><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="px-4"><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="px-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                <TableCell className="px-4 text-right"><Skeleton className="h-4 w-28 ml-auto" /></TableCell>
                <TableCell className="px-4"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell className="px-4"><Skeleton className="h-7 w-16" /></TableCell>
              </TableRow>
            ))
          ) : runs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Inga lönekörningar hittades.
              </TableCell>
            </TableRow>
          ) : (
            runs.map((run) => {
              const status = statusLabels[run.status] || statusLabels.draft;
              return (
                <TableRow key={run.id}>
                  <TableCell className="px-4 font-medium">
                    {run.period.substring(0, 4)}-{run.period.substring(4)}
                  </TableCell>
                  <TableCell className="px-4">Körning {run.runNumber}</TableCell>
                  <TableCell className="px-4">{run.paymentDate}</TableCell>
                  <TableCell className="px-4 text-right font-mono">
                    {formatCurrency(run.totalGrossSalary)}
                  </TableCell>
                  <TableCell className="px-4 text-right font-mono">
                    {formatCurrency(run.totalEmployerContributions)}
                  </TableCell>
                  <TableCell className="px-4">
                    <Badge variant="outline" className={status.color}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4">
                    <Link href={`/${workspaceSlug}/personal/lon/${run.id}`}>
                      <Button variant="ghost" size="sm">
                        Öppna
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        itemLabel="lönekörningar"
      />
    </>
  );
}

