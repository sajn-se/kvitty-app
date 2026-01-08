"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FilePdf,
  PaperPlaneTilt,
  Check,
  Trash,
  Bell,
  GearSix,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { generateInvoicePdf } from "@/lib/utils/invoice-pdf";
import { InvoiceMetadataSection } from "@/components/invoices/invoice-metadata-section";
import { InvoiceLinesSection } from "@/components/invoices/invoice-lines-section";
import { InvoiceTotals } from "@/components/invoices/invoice-totals";
import { AddProductDialog } from "@/components/invoices/add-product-dialog";
import { SendInvoiceDialog } from "@/components/invoices/send-invoice-dialog";
import { SendReminderDialog } from "@/components/invoices/send-reminder-dialog";
import { EditInvoiceMetadataDialog } from "@/components/invoices/edit-invoice-metadata-dialog";
import { EditInvoiceSettingsDialog } from "@/components/invoices/edit-invoice-settings-dialog";

interface InvoiceDetailClientProps {
  invoiceId: string;
}

export function InvoiceDetailClient({ invoiceId }: InvoiceDetailClientProps) {
  const { workspace } = useWorkspace();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [sendInvoiceOpen, setSendInvoiceOpen] = useState(false);
  const [sendReminderOpen, setSendReminderOpen] = useState(false);
  const [editMetadataOpen, setEditMetadataOpen] = useState(false);
  const [editSettingsOpen, setEditSettingsOpen] = useState(false);

  const { data: invoice, isLoading } = trpc.invoices.get.useQuery({
    workspaceId: workspace.id,
    id: invoiceId,
  });

  const sendInvoice = trpc.invoices.sendInvoice.useMutation({
    onSuccess: () => utils.invoices.get.invalidate({ workspaceId: workspace.id, id: invoiceId }),
  });

  const markAsPaid = trpc.invoices.markAsPaid.useMutation({
    onSuccess: () => utils.invoices.get.invalidate({ workspaceId: workspace.id, id: invoiceId }),
  });

  const deleteInvoice = trpc.invoices.delete.useMutation({
    onSuccess: () => router.push(`/${workspace.slug}/fakturor`),
  });

  const addTextLine = trpc.invoices.addLine.useMutation({
    onSuccess: () => utils.invoices.get.invalidate({ workspaceId: workspace.id, id: invoiceId }),
  });

  const handleDownloadPdf = () => {
    if (!invoice) return;
    const doc = generateInvoicePdf({
      workspace,
      invoice,
      customer: invoice.customer,
      lines: invoice.lines,
    });
    doc.save(`faktura-${invoice.invoiceNumber}.pdf`);
  };

  const handleAddTextLine = () => {
    if (!invoice) return;
    addTextLine.mutate({
      workspaceId: workspace.id,
      invoiceId,
      lineType: "text",
      description: "Ny textrad",
      quantity: 1,
      unitPrice: 0,
      vatRate: 0,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Fakturan hittades inte</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/${workspace.slug}/fakturor`}>Tillbaka till fakturor</Link>
        </Button>
      </div>
    );
  }

  const isDraft = invoice.status === "draft";

  // Check if invoice is overdue (sent and past due date)
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = invoice.status === "sent" && invoice.dueDate < today;

  return (
    <div className="p-6 space-y-6 min-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href={`/${workspace.slug}/fakturor`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold">
                Faktura #{invoice.invoiceNumber}
              </h1>
              <Badge
                variant={
                  invoice.status === "draft"
                    ? "secondary"
                    : invoice.status === "sent"
                    ? "default"
                    : "outline"
                }
              >
                {invoice.status === "draft"
                  ? "Utkast"
                  : invoice.status === "sent"
                  ? "Skickad"
                  : "Betald"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{invoice.customer.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" onClick={handleDownloadPdf}>
            <FilePdf className="size-4 mr-2" />
            Ladda ner PDF
          </Button>
          {isDraft && (
            <>
              <Button variant="outline" onClick={() => setEditSettingsOpen(true)}>
                <GearSix className="size-4 mr-2" />
                Inställningar
              </Button>
              <Button onClick={() => setSendInvoiceOpen(true)}>
                <PaperPlaneTilt className="size-4 mr-2" />
                Skicka faktura
              </Button>
            </>
          )}
          {invoice.status === "sent" && (
            <Button
              onClick={() => markAsPaid.mutate({ workspaceId: workspace.id, id: invoiceId })}
              disabled={markAsPaid.isPending}
            >
              {markAsPaid.isPending ? (
                <Spinner className="size-4 mr-2" />
              ) : (
                <Check className="size-4 mr-2" />
              )}
              Markera som betald
            </Button>
          )}
          {isOverdue && (
            <Button variant="outline" onClick={() => setSendReminderOpen(true)}>
              <Bell className="size-4 mr-2" />
              Skicka påminnelse
            </Button>
          )}
          {isDraft && (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700"
              onClick={() => {
                if (confirm("Är du säker på att du vill ta bort denna faktura?")) {
                  deleteInvoice.mutate({ workspaceId: workspace.id, id: invoiceId });
                }
              }}
            >
              <Trash className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Metadata Section */}
      <InvoiceMetadataSection
        invoice={invoice}
        workspace={workspace}
        isDraft={isDraft}
        onEdit={() => setEditMetadataOpen(true)}
      />

      {/* Lines Section */}
      <Card>
        <CardHeader>
          <CardTitle>Rader</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceLinesSection
            workspaceId={workspace.id}
            invoiceId={invoiceId}
            lines={invoice.lines}
            isDraft={isDraft}
            rotRutType={invoice.rotRutType}
            onAddProduct={isDraft ? () => setAddProductOpen(true) : undefined}
            onAddTextLine={isDraft ? handleAddTextLine : undefined}
          />
        </CardContent>
      </Card>

      {/* Totals */}
      <InvoiceTotals invoice={invoice} />

      {/* Add Product Dialog */}
      <AddProductDialog
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        workspaceId={workspace.id}
        invoiceId={invoiceId}
      />

      {/* Send Invoice Dialog */}
      <SendInvoiceDialog
        open={sendInvoiceOpen}
        onOpenChange={setSendInvoiceOpen}
        invoiceId={invoiceId}
        workspaceId={workspace.id}
        customerEmail={invoice.customer.email}
        customerContacts={invoice.customer.contacts}
        invoiceNumber={invoice.invoiceNumber}
        shareToken={invoice.shareToken}
        sentMethod={invoice.sentMethod}
        openedCount={invoice.openedCount}
        lastOpenedAt={invoice.lastOpenedAt}
      />

      {/* Send Reminder Dialog */}
      <SendReminderDialog
        open={sendReminderOpen}
        onOpenChange={setSendReminderOpen}
        invoiceId={invoiceId}
        workspaceId={workspace.id}
        invoiceNumber={invoice.invoiceNumber}
        customerName={invoice.customer.name}
        customerEmail={invoice.customer.email}
        total={invoice.total}
        dueDate={invoice.dueDate}
      />

      {/* Edit Metadata Dialog */}
      <EditInvoiceMetadataDialog
        open={editMetadataOpen}
        onOpenChange={setEditMetadataOpen}
        invoice={invoice}
      />

      {/* Edit Settings Dialog */}
      <EditInvoiceSettingsDialog
        open={editSettingsOpen}
        onOpenChange={setEditSettingsOpen}
        invoice={invoice}
        workspace={workspace}
      />
    </div>
  );
}
