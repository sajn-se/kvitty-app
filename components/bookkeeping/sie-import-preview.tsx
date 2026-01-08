"use client";

import { useState, Fragment } from "react";
import { Warning, CaretDown, CaretRight, Check } from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface PreviewLine {
  accountNumber: number;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

interface PreviewVerification {
  sourceId: string;
  date: string;
  description: string;
  lines: PreviewLine[];
  balanced: boolean;
  totalDebit: number;
  totalCredit: number;
}

interface SIEImportPreviewProps {
  verifications: PreviewVerification[];
  selectedIds: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
}

export function SIEImportPreview({
  verifications,
  selectedIds,
  onSelectionChange,
}: SIEImportPreviewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const toggleSelected = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelectionChange(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === verifications.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(verifications.map((v) => v.sourceId)));
    }
  };

  const allSelected = selectedIds.size === verifications.length && verifications.length > 0;
  const someSelected = selectedIds.size > 0 && selectedIds.size < verifications.length;

  if (verifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Inga verifikationer att visa för vald period
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={allSelected}
                data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[100px]">Datum</TableHead>
            <TableHead>Beskrivning</TableHead>
            <TableHead className="w-[100px]">Konton</TableHead>
            <TableHead className="text-right w-[120px]">Belopp</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {verifications.map((verification) => {
            const isExpanded = expandedIds.has(verification.sourceId);
            const isSelected = selectedIds.has(verification.sourceId);

            return (
              <Fragment key={verification.sourceId}>
                <TableRow
                  className={`cursor-pointer ${isSelected ? "" : "opacity-50"}`}
                  onClick={() => toggleExpanded(verification.sourceId)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelected(verification.sourceId)}
                    />
                  </TableCell>
                  <TableCell>
                    {isExpanded ? (
                      <CaretDown className="size-4 text-muted-foreground" />
                    ) : (
                      <CaretRight className="size-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {verification.date}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium truncate max-w-[200px]">
                      {verification.description || "(ingen beskrivning)"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {verification.lines.length} st
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(verification.totalDebit)}
                  </TableCell>
                  <TableCell>
                    {verification.balanced ? (
                      <Check className="size-4 text-green-600" weight="bold" />
                    ) : (
                      <Warning className="size-4 text-yellow-600" weight="bold" />
                    )}
                  </TableCell>
                </TableRow>

                {/* Expanded lines */}
                {isExpanded && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={7} className="p-0">
                      <div className="px-12 py-2">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-muted-foreground text-xs">
                              <th className="text-left font-medium pb-1 w-[80px]">Konto</th>
                              <th className="text-left font-medium pb-1">Namn</th>
                              <th className="text-right font-medium pb-1 w-[100px]">Debet</th>
                              <th className="text-right font-medium pb-1 w-[100px]">Kredit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {verification.lines.map((line, idx) => (
                              <tr key={idx} className="border-t border-border/50">
                                <td className="py-1 font-mono">{line.accountNumber}</td>
                                <td className="py-1 text-muted-foreground">{line.accountName}</td>
                                <td className="py-1 text-right font-mono">
                                  {line.debit > 0 ? formatCurrency(line.debit) : "-"}
                                </td>
                                <td className="py-1 text-right font-mono">
                                  {line.credit > 0 ? formatCurrency(line.credit) : "-"}
                                </td>
                              </tr>
                            ))}
                            <tr className="border-t font-medium">
                              <td colSpan={2} className="py-1 text-right">
                                Summa
                              </td>
                              <td className="py-1 text-right font-mono">
                                {formatCurrency(verification.totalDebit)}
                              </td>
                              <td className="py-1 text-right font-mono">
                                {formatCurrency(verification.totalCredit)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
