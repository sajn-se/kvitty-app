"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface PayrollEntry {
  id: string;
  grossSalary: string;
  taxDeduction: string;
  employerContributions: string;
  netSalary: string;
  payrollRun: {
    id: string;
    period: string;
    runNumber: number;
    paymentDate: string;
    status: string;
    fiscalPeriod: {
      label: string;
      urlSlug: string;
    };
  };
}

interface PersonalDetailClientProps {
  entries: PayrollEntry[];
  availableYears: string[];
  selectedYear?: string;
  workspaceSlug: string;
}

export function PersonalDetailClient({
  entries,
  availableYears,
  selectedYear,
  workspaceSlug,
}: PersonalDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      const queryString = params.toString();
      router.replace(queryString ? `?${queryString}` : "?", { scroll: false });
    },
    [router, searchParams]
  );

  const formatCurrency = (value: string | null) => {
    if (!value) return "0 kr";
    return `${parseFloat(value).toLocaleString("sv-SE")} kr`;
  };

  const formatPeriod = (period: string) => {
    return `${period.substring(0, 4)}-${period.substring(4)}`;
  };

  const hasFilters = selectedYear;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lönehistorik</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={selectedYear || "all"}
              onValueChange={(value) =>
                updateParams({ year: value === "all" ? null : value })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Välj år" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla år</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateParams({ year: null })}
              >
                <X className="size-4 mr-1" />
                Rensa
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>
              {selectedYear
                ? `Inga löner registrerade för ${selectedYear}`
                : "Inga löner registrerade"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Körning</TableHead>
                <TableHead>Utbetalningsdatum</TableHead>
                <TableHead className="text-right">Bruttolön</TableHead>
                <TableHead className="text-right">Skatteavdrag</TableHead>
                <TableHead className="text-right">Arb.avg</TableHead>
                <TableHead className="text-right">Nettolön</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {formatPeriod(entry.payrollRun.period)}
                  </TableCell>
                  <TableCell>Körning {entry.payrollRun.runNumber}</TableCell>
                  <TableCell>{entry.payrollRun.paymentDate}</TableCell>
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
                  <TableCell>
                    <Link
                      href={`/${workspaceSlug}/personal/lon/${entry.payrollRun.id}`}
                    >
                      <Button variant="ghost" size="sm">
                        Öppna
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

