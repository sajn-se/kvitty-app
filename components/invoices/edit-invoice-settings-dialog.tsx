"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc/client";
import type { Invoice, Customer, Workspace, InvoiceLine } from "@/lib/db/schema";
import { paymentMethods, deliveryMethods, rotRutTypes, rotRutTypeLabels } from "@/lib/validations/invoice";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface InvoiceWithCustomerAndLines extends Invoice {
  customer: Customer;
  lines: InvoiceLine[];
}

interface EditInvoiceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceWithCustomerAndLines;
  workspace: Workspace;
}

export function EditInvoiceSettingsDialog({
  open,
  onOpenChange,
  invoice,
  workspace,
}: EditInvoiceSettingsDialogProps) {
  const utils = trpc.useUtils();

  // State for all settings
  const [deliveryTerms, setDeliveryTerms] = useState(invoice.deliveryTerms || "");
  const [latePaymentInterest, setLatePaymentInterest] = useState<number | "">(
    invoice.latePaymentInterest ? Number(invoice.latePaymentInterest) : ""
  );
  const [paymentTermsDays, setPaymentTermsDays] = useState<number | "">(
    invoice.paymentTermsDays || workspace.paymentTermsDays || 30
  );
  const [paymentMethod, setPaymentMethod] = useState(invoice.paymentMethod || "");
  const [paymentAccount, setPaymentAccount] = useState(invoice.paymentAccount || "");
  const [ocrNumber, setOcrNumber] = useState(invoice.ocrNumber || "");
  const [customNotes, setCustomNotes] = useState(invoice.customNotes || "");
  const [deliveryMethod, setDeliveryMethod] = useState(invoice.deliveryMethod || "");

  // Compliance state
  const [isReverseCharge, setIsReverseCharge] = useState(invoice.isReverseCharge || false);
  const [rotRutType, setRotRutType] = useState<string | null>(invoice.rotRutType || null);
  const [rotRutDeductionManualOverride, setRotRutDeductionManualOverride] = useState(
    invoice.rotRutDeductionManualOverride || false
  );
  const [rotRutDeductionAmount, setRotRutDeductionAmount] = useState<number | "">(
    invoice.rotRutDeductionAmount ? Number(invoice.rotRutDeductionAmount) : ""
  );

  const updateSettings = trpc.invoices.updateSettings.useMutation({
    onSuccess: () => {
      utils.invoices.get.invalidate({ id: invoice.id });
      toast.success("Inställningar sparade");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte spara inställningar");
    },
  });

  const generateOcr = trpc.invoices.generateOcrNumber.useMutation({
    onSuccess: (data) => {
      setOcrNumber(data.ocrNumber || "");
      utils.invoices.get.invalidate({ id: invoice.id });
      toast.success("OCR-nummer genererat");
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte generera OCR-nummer");
    },
  });

  const updateCompliance = trpc.invoices.updateCompliance.useMutation({
    onSuccess: () => {
      utils.invoices.get.invalidate({ id: invoice.id });
      toast.success("Compliance-inställningar sparade");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte spara compliance-inställningar");
    },
  });

  useEffect(() => {
    if (open) {
      setDeliveryTerms(invoice.deliveryTerms || "");
      setLatePaymentInterest(
        invoice.latePaymentInterest ? Number(invoice.latePaymentInterest) : ""
      );
      setPaymentTermsDays(invoice.paymentTermsDays || workspace.paymentTermsDays || 30);
      setPaymentMethod(invoice.paymentMethod || "");
      setPaymentAccount(invoice.paymentAccount || "");
      setOcrNumber(invoice.ocrNumber || "");
      setCustomNotes(invoice.customNotes || "");
      setDeliveryMethod(invoice.deliveryMethod || "");
      // Compliance
      setIsReverseCharge(invoice.isReverseCharge || false);
      setRotRutType(invoice.rotRutType || null);
      setRotRutDeductionManualOverride(invoice.rotRutDeductionManualOverride || false);
      setRotRutDeductionAmount(
        invoice.rotRutDeductionAmount ? Number(invoice.rotRutDeductionAmount) : ""
      );
    }
  }, [open, invoice, workspace.paymentTermsDays]);

  const handleSave = async () => {
    // First save regular settings
    await updateSettings.mutateAsync({
      workspaceId: workspace.id,
      id: invoice.id,
      deliveryTerms: deliveryTerms || null,
      latePaymentInterest: latePaymentInterest !== "" ? Number(latePaymentInterest) : null,
      paymentTermsDays: paymentTermsDays !== "" ? Number(paymentTermsDays) : null,
      paymentMethod: (paymentMethod as any) || null,
      paymentAccount: paymentAccount || null,
      ocrNumber: ocrNumber || null,
      customNotes: customNotes || null,
      deliveryMethod: (deliveryMethod as any) || null,
    });

    // Then save compliance settings if changed
    const complianceChanged =
      isReverseCharge !== invoice.isReverseCharge ||
      rotRutType !== invoice.rotRutType ||
      rotRutDeductionManualOverride !== invoice.rotRutDeductionManualOverride ||
      (rotRutDeductionAmount !== "" &&
        Number(rotRutDeductionAmount) !== Number(invoice.rotRutDeductionAmount || 0));

    if (complianceChanged) {
      await updateCompliance.mutateAsync({
        workspaceId: workspace.id,
        id: invoice.id,
        isReverseCharge,
        rotRutType: rotRutType as "rot" | "rut" | null,
        rotRutDeductionManualOverride,
        rotRutDeductionAmount: rotRutDeductionAmount !== "" ? Number(rotRutDeductionAmount) : null,
      });
    }
  };

  const handleCancel = () => {
    setDeliveryTerms(invoice.deliveryTerms || "");
    setLatePaymentInterest(
      invoice.latePaymentInterest ? Number(invoice.latePaymentInterest) : ""
    );
    setPaymentTermsDays(invoice.paymentTermsDays || workspace.paymentTermsDays || 30);
    setPaymentMethod(invoice.paymentMethod || "");
    setPaymentAccount(invoice.paymentAccount || "");
    setOcrNumber(invoice.ocrNumber || "");
    setCustomNotes(invoice.customNotes || "");
    setDeliveryMethod(invoice.deliveryMethod || "");
    // Compliance
    setIsReverseCharge(invoice.isReverseCharge || false);
    setRotRutType(invoice.rotRutType || null);
    setRotRutDeductionManualOverride(invoice.rotRutDeductionManualOverride || false);
    setRotRutDeductionAmount(
      invoice.rotRutDeductionAmount ? Number(invoice.rotRutDeductionAmount) : ""
    );
    onOpenChange(false);
  };

  const handleGenerateOcr = () => {
    generateOcr.mutate({ workspaceId: workspace.id, invoiceId: invoice.id });
  };

  const isSubmitting = updateSettings.isPending || updateCompliance.isPending;

  // Calculate ROT/RUT amounts from lines
  const laborAmount = invoice.lines
    .filter((line) => line.isLabor && line.lineType !== "text")
    .reduce((sum, line) => sum + Number(line.amount), 0);
  const materialAmount = invoice.lines
    .filter((line) => line.isMaterial && line.lineType !== "text")
    .reduce((sum, line) => sum + Number(line.amount), 0);
  const calculatedDeduction = rotRutType
    ? laborAmount * (rotRutType === "rot" ? 0.3 : 0.5)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fakturasinställningar</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="terms" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="terms">Villkor</TabsTrigger>
            <TabsTrigger value="payment">Betalning</TabsTrigger>
            <TabsTrigger value="delivery">Leverans</TabsTrigger>
            <TabsTrigger value="compliance">Moms</TabsTrigger>
            <TabsTrigger value="notes">Anteckningar</TabsTrigger>
          </TabsList>

          <TabsContent value="terms" className="space-y-4 mt-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="paymentTermsDays">Betalningsvillkor (dagar)</FieldLabel>
                <Input
                  id="paymentTermsDays"
                  type="number"
                  min={1}
                  max={365}
                  value={paymentTermsDays}
                  onChange={(e) =>
                    setPaymentTermsDays(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={isSubmitting}
                />
                <FieldDescription>
                  Antal dagar från fakturadatum till förfallodatum
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="deliveryTerms">Leveransvillkor</FieldLabel>
                <Input
                  id="deliveryTerms"
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  placeholder="T.ex. Fritt vårt lager"
                  maxLength={200}
                  disabled={isSubmitting}
                />
                <FieldDescription>
                  Valfri text som beskriver leveransvillkor
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="latePaymentInterest">Dröjsmålsränta (%)</FieldLabel>
                <Input
                  id="latePaymentInterest"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={latePaymentInterest}
                  onChange={(e) =>
                    setLatePaymentInterest(e.target.value ? Number(e.target.value) : "")
                  }
                  placeholder="T.ex. 12"
                  disabled={isSubmitting}
                />
                <FieldDescription>
                  Ränta vid försenad betalning (lämna tomt för standard)
                </FieldDescription>
              </Field>
            </FieldGroup>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="paymentMethod">Betalningsmetod</FieldLabel>
                <Select value={paymentMethod || "__none__"} onValueChange={(val) => setPaymentMethod(val === "__none__" ? "" : val)}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Välj betalningsmetod" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Standard (visa alla)</SelectItem>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method === "bankgiro"
                          ? "Bankgiro"
                          : method === "plusgiro"
                          ? "Plusgiro"
                          : method === "iban"
                          ? "IBAN"
                          : method === "swish"
                          ? "Swish"
                          : method === "paypal"
                          ? "PayPal"
                          : "Egen"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Välj specifik betalningsmetod att visa på fakturan
                </FieldDescription>
              </Field>

              {paymentMethod && (
                <Field>
                  <FieldLabel htmlFor="paymentAccount">
                    {paymentMethod === "bankgiro"
                      ? "Bankgiro-nummer"
                      : paymentMethod === "plusgiro"
                      ? "Plusgiro-nummer"
                      : paymentMethod === "iban"
                      ? "IBAN-nummer"
                      : paymentMethod === "swish"
                      ? "Swish-nummer"
                      : paymentMethod === "paypal"
                      ? "PayPal-adress"
                      : "Kontonummer"}
                  </FieldLabel>
                  <Input
                    id="paymentAccount"
                    value={paymentAccount}
                    onChange={(e) => setPaymentAccount(e.target.value)}
                    placeholder={
                      paymentMethod === "bankgiro"
                        ? "123-4567"
                        : paymentMethod === "plusgiro"
                        ? "12 34 56-7"
                        : paymentMethod === "iban"
                        ? "SE35 5000 0000 0549 1000 0003"
                        : ""
                    }
                    maxLength={100}
                    disabled={isSubmitting}
                  />
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="ocrNumber">OCR-nummer</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="ocrNumber"
                    value={ocrNumber}
                    onChange={(e) => setOcrNumber(e.target.value)}
                    placeholder="Genereras automatiskt eller skriv eget"
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateOcr}
                    disabled={isSubmitting || generateOcr.isPending}
                  >
                    {generateOcr.isPending ? <Spinner /> : "Generera"}
                  </Button>
                </div>
                <FieldDescription>
                  OCR-nummer för betalningsreferens (10 siffror med kontrollsiffra)
                </FieldDescription>
              </Field>
            </FieldGroup>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4 mt-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="deliveryMethod">Leveransmetod</FieldLabel>
                <Select value={deliveryMethod || "__none__"} onValueChange={(val) => setDeliveryMethod(val === "__none__" ? "" : val)}>
                  <SelectTrigger id="deliveryMethod">
                    <SelectValue placeholder="Välj leveransmetod" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      Standard ({invoice.customer.preferredDeliveryMethod || "manuell"})
                    </SelectItem>
                    {deliveryMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method === "email_pdf"
                          ? "E-post med PDF"
                          : method === "email_link"
                          ? "E-post med länk"
                          : method === "manual"
                          ? "Manuell hantering"
                          : "E-faktura"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Hur fakturan ska levereras till kunden
                </FieldDescription>
              </Field>

              {deliveryMethod === "e_invoice" && invoice.customer.einvoiceAddress && (
                <Field>
                  <FieldLabel>E-faktura-adress</FieldLabel>
                  <div className="text-sm text-muted-foreground">
                    {invoice.customer.einvoiceAddress}
                  </div>
                  <FieldDescription>
                    Kundens Peppol-ID eller e-faktura-adress (ändra i kunduppgifter)
                  </FieldDescription>
                </Field>
              )}
            </FieldGroup>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4 mt-4">
            <FieldGroup>
              {/* Reverse Charge */}
              <Field>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="isReverseCharge"
                    checked={isReverseCharge}
                    onCheckedChange={(checked) => setIsReverseCharge(!!checked)}
                    disabled={isSubmitting || invoice.status !== "draft"}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="isReverseCharge"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Omvänd skattskyldighet
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Köparen ansvarar för momsen (vanligt vid byggtjänster mellan företag)
                    </p>
                  </div>
                </div>
                {isReverseCharge && !invoice.customer.vatNumber && (
                  <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
                    <AlertTriangle className="size-4" />
                    Kunden saknar VAT-nummer. Lägg till i kunduppgifterna.
                  </div>
                )}
              </Field>

              {/* ROT/RUT Selection */}
              <Field>
                <FieldLabel htmlFor="rotRutType">ROT/RUT-avdrag</FieldLabel>
                <Select
                  value={rotRutType || "__none__"}
                  onValueChange={(val) => {
                    setRotRutType(val === "__none__" ? null : val);
                    setRotRutDeductionManualOverride(false);
                    setRotRutDeductionAmount("");
                  }}
                  disabled={isSubmitting || invoice.status !== "draft"}
                >
                  <SelectTrigger id="rotRutType">
                    <SelectValue placeholder="Inget avdrag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Inget avdrag</SelectItem>
                    {rotRutTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {rotRutTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Skattereduktion för privatpersoner vid ROT (bygg) eller RUT (hushåll) arbeten
                </FieldDescription>
              </Field>

              {rotRutType && (
                <>
                  {/* ROT/RUT Amounts Summary */}
                  <div className="rounded-lg bg-muted p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Arbetskostnad (märkt som arbete):</span>
                      <span>{laborAmount.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Material/resor (märkt som material):</span>
                      <span>{materialAmount.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium pt-2 border-t">
                      <span>Beräknad skattereduktion ({rotRutType === "rot" ? "30%" : "50%"}):</span>
                      <span>{calculatedDeduction.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr</span>
                    </div>
                    {laborAmount === 0 && (
                      <p className="text-xs text-muted-foreground pt-2">
                        Ingen arbetskostnad hittad. Markera fakturarader som "Arbetskostnad" för att beräkna avdrag.
                      </p>
                    )}
                  </div>

                  {/* Manual Override */}
                  <Field>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="rotRutDeductionManualOverride"
                        checked={rotRutDeductionManualOverride}
                        onCheckedChange={(checked) => {
                          setRotRutDeductionManualOverride(!!checked);
                          if (!checked) {
                            setRotRutDeductionAmount("");
                          }
                        }}
                        disabled={isSubmitting || invoice.status !== "draft"}
                      />
                      <label
                        htmlFor="rotRutDeductionManualOverride"
                        className="text-sm font-medium leading-none"
                      >
                        Ange manuellt belopp
                      </label>
                    </div>
                  </Field>

                  {rotRutDeductionManualOverride && (
                    <Field>
                      <FieldLabel htmlFor="rotRutDeductionAmount">
                        Skattereduktion (kr)
                      </FieldLabel>
                      <Input
                        id="rotRutDeductionAmount"
                        type="number"
                        min={0}
                        step={0.01}
                        value={rotRutDeductionAmount}
                        onChange={(e) =>
                          setRotRutDeductionAmount(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        placeholder={calculatedDeduction.toFixed(2)}
                        disabled={isSubmitting || invoice.status !== "draft"}
                      />
                    </Field>
                  )}

                  {/* Customer Validation */}
                  {!invoice.customer.personalNumber && (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
                      <AlertTriangle className="size-4" />
                      Kunden saknar personnummer. Lägg till i kunduppgifterna för ROT/RUT.
                    </div>
                  )}
                  {rotRutType === "rot" && !invoice.customer.propertyDesignation && (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
                      <AlertTriangle className="size-4" />
                      Kunden saknar fastighetsbeteckning. Lägg till i kunduppgifterna för ROT.
                    </div>
                  )}
                </>
              )}

              {invoice.status !== "draft" && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50 border border-blue-200 text-sm text-blue-800">
                  Moms- och avdragsinställningar kan endast ändras för utkast.
                </div>
              )}
            </FieldGroup>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="customNotes">Anpassade anteckningar</FieldLabel>
                <Textarea
                  id="customNotes"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Valfri text som visas i fakturafoten (lämna tomt för standard)"
                  rows={5}
                  maxLength={1000}
                  disabled={isSubmitting}
                />
                <FieldDescription>
                  {workspace.invoiceNotes
                    ? `Standard: "${workspace.invoiceNotes}"`
                    : "Ingen standardtext inställd"}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Avbryt
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Spara"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
