"use client";

import Link from "next/link";
import { FilePdf, PaperPlaneTilt, Check, DotsThree, Trash, Eye, BookOpen, CheckCircle, Bell } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { InvoiceStatus } from "@/lib/db/schema";

interface Invoice {
  id: string;
  invoiceNumber: number;
  customer: {
    name: string;
    contactPerson: string | null;
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-24">Fakturanr</TableHead>
          <TableHead>Kund</TableHead>
          <TableHead>Kontaktperson</TableHead>
          <TableHead className="text-right">Belopp (inkl moms)</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-20">Bokförd</TableHead>
          <TableHead>Fakturadatum</TableHead>
          <TableHead>Förfallodatum</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => {
          const displayStatus = getDisplayStatus(invoice);

          return (
            <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <Link
                  href={`/${workspaceSlug}/fakturor/${invoice.id}`}
                  className="font-mono hover:underline"
                >
                  {invoice.invoiceNumber}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/${workspaceSlug}/fakturor/${invoice.id}`}
                  className="hover:underline"
                >
                  {invoice.customer.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {invoice.customer.contactPerson || "-"}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(invoice.total)}
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[displayStatus]}>
                  {statusLabels[displayStatus]}
                </Badge>
              </TableCell>
              <TableCell>
                {invoice.status === "draft" ? (
                  <span className="text-muted-foreground">-</span>
                ) : invoice.status === "paid" ? (
                  // For paid invoices, check both verifications
                  invoice.sentJournalEntryId && invoice.journalEntryId ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckCircle className="size-4 text-green-600" />
                      </TooltipTrigger>
                      <TooltipContent>Intäkt och betalning bokförd</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-amber-600 text-xs font-medium">Ej bokförd</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {!invoice.sentJournalEntryId && !invoice.journalEntryId
                          ? "Varken intäkt eller betalning bokförd"
                          : !invoice.sentJournalEntryId
                          ? "Intäkt ej bokförd"
                          : "Betalning ej bokförd"}
                      </TooltipContent>
                    </Tooltip>
                  )
                ) : (
                  // For sent invoices, check sent verification
                  invoice.sentJournalEntryId ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckCircle className="size-4 text-green-600" />
                      </TooltipTrigger>
                      <TooltipContent>Intäkt bokförd</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-amber-600 text-xs font-medium">Ej bokförd</span>
                      </TooltipTrigger>
                      <TooltipContent>Intäkt ej bokförd</TooltipContent>
                    </Tooltip>
                  )
                )}
              </TableCell>
              <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
              <TableCell>{formatDate(invoice.dueDate)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <DotsThree className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/${workspaceSlug}/fakturor/${invoice.id}`}>
                        <Eye className="size-4 mr-2" />
                        Visa faktura
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownloadPdf(invoice.id)}>
                      <FilePdf className="size-4 mr-2" />
                      Ladda ner PDF
                    </DropdownMenuItem>
                    {invoice.status === "draft" && (
                      <DropdownMenuItem onClick={() => onMarkAsSent(invoice.id)}>
                        <PaperPlaneTilt className="size-4 mr-2" />
                        Markera som skickad
                      </DropdownMenuItem>
                    )}
                    {invoice.status === "sent" && (
                      <DropdownMenuItem onClick={() => onMarkAsPaid(invoice.id)}>
                        <Check className="size-4 mr-2" />
                        Markera som betald
                      </DropdownMenuItem>
                    )}
                    {/* Send reminder for overdue invoices */}
                    {displayStatus === "overdue" && onSendReminder && (
                      <DropdownMenuItem onClick={() => onSendReminder(invoice)}>
                        <Bell className="size-4 mr-2" />
                        Skicka påminnelse
                      </DropdownMenuItem>
                    )}
                    {/* Bokför nu actions for missing verifications */}
                    {needsSentVerification(invoice) && onCreateSentVerification && (
                      <DropdownMenuItem onClick={() => onCreateSentVerification(invoice.id)}>
                        <BookOpen className="size-4 mr-2" />
                        Bokför intäkt
                      </DropdownMenuItem>
                    )}
                    {needsPaidVerification(invoice) && onCreatePaidVerification && (
                      <DropdownMenuItem onClick={() => onCreatePaidVerification(invoice.id)}>
                        <BookOpen className="size-4 mr-2" />
                        Bokför betalning
                      </DropdownMenuItem>
                    )}
                    {invoice.status === "draft" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
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
        })}
      </TableBody>
    </Table>
  );
}
