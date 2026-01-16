"use client";

import Link from "next/link";
import { FilePdf, PaperPlaneTilt, Check, DotsThree, Trash, Eye, BookOpen, CheckCircle, Bell, CopySimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TablePagination } from "@/components/ui/table-pagination";
import type { InvoiceStatus } from "@/lib/db/schema";

interface Invoice {
  id: string;
  invoiceNumber: number;
  customer: {
    name: string;
    email: string | null;
  };
  invoiceDate: string;
  dueDate: string;
  total: string;
  paidAmount: string | null;
  status: InvoiceStatus;
  sentJournalEntryId: string | null;
  journalEntryId: string | null;
}

interface InvoicesTableProps {
  invoices: Invoice[];
  workspaceSlug: string;
  onDownloadPdf: (invoiceId: string) => void;
  onMarkAsSent: (invoiceId: string) => void;
  onMarkAsPaid: (invoiceId: string) => void;
  onDelete: (invoiceId: string) => void;
  onCreateSentVerification?: (invoiceId: string) => void;
  onCreatePaidVerification?: (invoiceId: string) => void;
  onSendReminder?: (invoice: Invoice) => void;
  onDuplicate?: (invoiceId: string) => void;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

// Display status types (includes calculated statuses)
type DisplayStatus = "draft" | "sent" | "overdue" | "paid" | "overpaid";

const statusLabels: Record<DisplayStatus, string> = {
  draft: "Utkast",
  sent: "Publicerad",
  overdue: "Försenad",
  paid: "Betald",
  overpaid: "Överbetald",
};

const statusColors: Record<DisplayStatus, "secondary" | "default" | "outline" | "destructive"> = {
  draft: "secondary",
  sent: "default",
  overdue: "destructive",
  paid: "outline",
  overpaid: "outline",
};

function getDisplayStatus(invoice: Invoice): DisplayStatus {
  const today = new Date().toISOString().split("T")[0];

  if (invoice.status === "draft") {
    return "draft";
  }

  if (invoice.status === "paid") {
    // Check if overpaid
    if (invoice.paidAmount) {
      const paid = parseFloat(invoice.paidAmount);
      const total = parseFloat(invoice.total);
      if (paid > total) {
        return "overpaid";
      }
    }
    return "paid";
  }

  // Status is "sent"
  if (invoice.dueDate < today) {
    return "overdue";
  }

  return "sent";
}

// Get verification status for display in Bokford column
function getVerificationStatus(invoice: Invoice): {
  isComplete: boolean;
  tooltip: string;
} {
  if (invoice.status === "draft") {
    return { isComplete: false, tooltip: "" };
  }

  if (invoice.status === "paid") {
    const hasSent = !!invoice.sentJournalEntryId;
    const hasPaid = !!invoice.journalEntryId;

    if (hasSent && hasPaid) {
      return { isComplete: true, tooltip: "Intakt och betalning bokford" };
    }
    if (!hasSent && !hasPaid) {
      return { isComplete: false, tooltip: "Varken intakt eller betalning bokford" };
    }
    if (!hasSent) {
      return { isComplete: false, tooltip: "Intakt ej bokford" };
    }
    return { isComplete: false, tooltip: "Betalning ej bokford" };
  }

  // Status is "sent"
  if (invoice.sentJournalEntryId) {
    return { isComplete: true, tooltip: "Intakt bokford" };
  }
  return { isComplete: false, tooltip: "Intakt ej bokford" };
}

function VerificationStatusCell({ invoice }: { invoice: Invoice }) {
  if (invoice.status === "draft") {
    return <span className="text-muted-foreground">-</span>;
  }

  const { isComplete, tooltip } = getVerificationStatus(invoice);

  return (
    <Tooltip>
      <TooltipTrigger>
        {isComplete ? (
          <CheckCircle className="size-4 text-green-600" />
        ) : (
          <span className="text-amber-600 text-xs font-medium">Ej bokford</span>
        )}
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function InvoicesTable({
  invoices,
  workspaceSlug,
  onDownloadPdf,
  onMarkAsSent,
  onMarkAsPaid,
  onDelete,
  onCreateSentVerification,
  onCreatePaidVerification,
  onSendReminder,
  onDuplicate,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
}: InvoicesTableProps) {
  const formatCurrency = (value: string) => {
    return parseFloat(value).toLocaleString("sv-SE", {
      minimumFractionDigits: 2,
    }) + " kr";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sv-SE");
  };

  // Check if invoice needs verification
  const needsSentVerification = (invoice: Invoice) =>
    invoice.status !== "draft" && !invoice.sentJournalEntryId;

  const needsPaidVerification = (invoice: Invoice) =>
    invoice.status === "paid" && !invoice.journalEntryId;

  return (
    <>
    <div className="bg-background rounded-xl border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-4 w-24">Fakturanr</TableHead>
          <TableHead className="px-4">Kund</TableHead>
          <TableHead className="px-4 text-right">Belopp (inkl moms)</TableHead>
          <TableHead className="px-4">Status</TableHead>
          <TableHead className="px-4 w-20">Bokförd</TableHead>
          <TableHead className="px-4">Fakturadatum</TableHead>
          <TableHead className="px-4">Förfallodatum</TableHead>
          <TableHead className="px-4 w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="px-4"><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell className="px-4"><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell className="px-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
              <TableCell className="px-4"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
              <TableCell className="px-4"><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell className="px-4"><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell className="px-4"><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell className="px-4"><Skeleton className="size-7 rounded-md" /></TableCell>
            </TableRow>
          ))
        ) : invoices.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
              Inga fakturor hittades.
            </TableCell>
          </TableRow>
        ) : (
          invoices.map((invoice) => {
            const displayStatus = getDisplayStatus(invoice);

            return (
              <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="px-4">
                  <Link
                    href={`/${workspaceSlug}/fakturor/${invoice.id}`}
                    className="font-mono hover:underline"
                  >
                    {invoice.invoiceNumber}
                  </Link>
                </TableCell>
                <TableCell className="px-4">
                  <Link
                    href={`/${workspaceSlug}/fakturor/${invoice.id}`}
                    className="hover:underline"
                  >
                    {invoice.customer.name}
                  </Link>
                </TableCell>
                <TableCell className="px-4 text-right font-mono">
                  {formatCurrency(invoice.total)}
                </TableCell>
                <TableCell className="px-4">
                  <Badge variant={statusColors[displayStatus]}>
                    {statusLabels[displayStatus]}
                  </Badge>
                </TableCell>
                <TableCell className="px-4">
                  <VerificationStatusCell invoice={invoice} />
                </TableCell>
                <TableCell className="px-4">{formatDate(invoice.invoiceDate)}</TableCell>
                <TableCell className="px-4">{formatDate(invoice.dueDate)}</TableCell>
                <TableCell className="px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <DotsThree className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/${workspaceSlug}/fakturor/${invoice.id}`} className="whitespace-nowrap">
                          <Eye className="size-4 mr-2" />
                          Visa faktura
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownloadPdf(invoice.id)} className="whitespace-nowrap">
                        <FilePdf className="size-4 mr-2" />
                        Ladda ner PDF
                      </DropdownMenuItem>
                      {onDuplicate && (
                        <DropdownMenuItem onClick={() => onDuplicate(invoice.id)} className="whitespace-nowrap">
                          <CopySimple className="size-4 mr-2" />
                          Duplicera faktura
                        </DropdownMenuItem>
                      )}
                      {invoice.status === "draft" && (
                        <DropdownMenuItem onClick={() => onMarkAsSent(invoice.id)} className="whitespace-nowrap">
                          <PaperPlaneTilt className="size-4 mr-2" />
                          Markera som skickad
                        </DropdownMenuItem>
                      )}
                      {invoice.status === "sent" && (
                        <DropdownMenuItem onClick={() => onMarkAsPaid(invoice.id)} className="whitespace-nowrap">
                          <Check className="size-4 mr-2" />
                          Markera som betald
                        </DropdownMenuItem>
                      )}
                      {/* Send reminder for overdue invoices */}
                      {displayStatus === "overdue" && onSendReminder && (
                        <DropdownMenuItem onClick={() => onSendReminder(invoice)} className="whitespace-nowrap">
                          <Bell className="size-4 mr-2" />
                          Skicka påminnelse
                        </DropdownMenuItem>
                      )}
                      {/* Bokför nu actions for missing verifications */}
                      {needsSentVerification(invoice) && onCreateSentVerification && (
                        <DropdownMenuItem onClick={() => onCreateSentVerification(invoice.id)} className="whitespace-nowrap">
                          <BookOpen className="size-4 mr-2" />
                          Bokför intäkt
                        </DropdownMenuItem>
                      )}
                      {needsPaidVerification(invoice) && onCreatePaidVerification && (
                        <DropdownMenuItem onClick={() => onCreatePaidVerification(invoice.id)} className="whitespace-nowrap">
                          <BookOpen className="size-4 mr-2" />
                          Bokför betalning
                        </DropdownMenuItem>
                      )}
                      {invoice.status === "draft" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 whitespace-nowrap"
                            onClick={() => onDelete(invoice.id)}
                          >
                            <Trash className="size-4 mr-2" />
                            Ta bort
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
    </div>

    <TablePagination
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      itemLabel="fakturor"
    />
    </>
  );
}
