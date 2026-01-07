"use client";

import { Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ReportRow {
  accountNumber?: number;
  accountName?: string;
  label?: string;
  amount: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
  indent?: number;
}

interface ReportGroup {
  name: string;
  rows: ReportRow[];
  subtotal: number;
}

interface ReportTableProps {
  groups: ReportGroup[];
  showAccountNumbers?: boolean;
  totalLabel?: string;
  total?: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function ReportTable({
  groups,
  showAccountNumbers = true,
  totalLabel,
  total,
}: ReportTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showAccountNumbers && <TableHead className="px-4 w-[100px]">Konto</TableHead>}
          <TableHead className="px-4">Beskrivning</TableHead>
          <TableHead className="px-4 text-right w-[150px]">Belopp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group, groupIndex) => (
          <Fragment key={groupIndex}>
            {/* Group header */}
            <TableRow className="bg-muted/30">
              {showAccountNumbers && <TableCell className="px-4" />}
              <TableCell className="px-4 font-semibold">{group.name}</TableCell>
              <TableCell className="px-4" />
            </TableRow>

            {/* Group rows */}
            {group.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {showAccountNumbers && (
                  <TableCell className="px-4 font-mono text-muted-foreground">
                    {row.accountNumber}
                  </TableCell>
                )}
                <TableCell
                  style={{ paddingLeft: row.indent ? `${row.indent}rem` : undefined }}
                  className={cn(
                    "px-4",
                    row.isSubtotal && "font-medium",
                    row.isTotal && "font-bold"
                  )}
                >
                  {row.accountName || row.label}
                </TableCell>
                <TableCell
                  className={cn(
                    "px-4 text-right font-mono",
                    row.amount < 0 && "text-red-600",
                    row.isSubtotal && "font-medium",
                    row.isTotal && "font-bold"
                  )}
                >
                  {formatCurrency(row.amount ?? 0)}
                </TableCell>
              </TableRow>
            ))}

            {/* Group subtotal */}
            {group.rows.length > 0 && (
              <TableRow className="border-t-2">
                {showAccountNumbers && <TableCell className="px-4" />}
                <TableCell className="px-4 font-medium">
                  Summa {group.name.toLowerCase()}
                </TableCell>
                <TableCell
                  className={cn(
                    "px-4 text-right font-mono font-medium",
                    group.subtotal < 0 && "text-red-600"
                  )}
                >
                  {formatCurrency(group.subtotal ?? 0)}
                </TableCell>
              </TableRow>
            )}
          </Fragment>
        ))}

        {/* Total row */}
        {totalLabel && total !== undefined && (
          <TableRow className="bg-muted border-t-4">
            {showAccountNumbers && <TableCell className="px-4" />}
            <TableCell className="px-4 font-bold text-lg">{totalLabel}</TableCell>
            <TableCell
              className={cn(
                "px-4 text-right font-mono font-bold text-lg",
                total < 0 && "text-red-600"
              )}
            >
              {formatCurrency(total ?? 0)}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

// Simpler table for balance sheet with two columns
interface BalanceSheetTableProps {
  leftTitle: string;
  leftGroups: ReportGroup[];
  leftTotal: number;
  rightTitle: string;
  rightGroups: ReportGroup[];
  rightTotal: number;
  showAccountNumbers?: boolean;
}

export function BalanceSheetTable({
  leftTitle,
  leftGroups,
  leftTotal,
  rightTitle,
  rightGroups,
  rightTotal,
  showAccountNumbers = true,
}: BalanceSheetTableProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{leftTitle}</h3>
        <ReportTable
          groups={leftGroups}
          showAccountNumbers={showAccountNumbers}
          totalLabel={`Summa ${leftTitle.toLowerCase()}`}
          total={leftTotal}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">{rightTitle}</h3>
        <ReportTable
          groups={rightGroups}
          showAccountNumbers={showAccountNumbers}
          totalLabel={`Summa ${rightTitle.toLowerCase()}`}
          total={rightTotal}
        />
      </div>
    </div>
  );
}
