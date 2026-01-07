"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  businessTypes,
  type BusinessType,
  updateWorkspaceSchema,
} from "@/lib/validations/workspace";
import { z } from "zod";
import type { Workspace } from "@/lib/db/schema";

interface WorkspaceSettingsFormProps {
  workspace: Workspace;
}

const businessTypeLabels: Record<BusinessType, string> = {
  aktiebolag: "Aktiebolag (AB)",
  enskild_firma: "Enskild firma",
  handelsbolag: "Handelsbolag (HB)",
  kommanditbolag: "Kommanditbolag (KB)",
  ekonomisk_forening: "Ekonomisk förening",
  ideell_forening: "Ideell förening",
  stiftelse: "Stiftelse",
  other: "Annat",
};

const formSchema = updateWorkspaceSchema.extend({
  workspaceId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function WorkspaceSettingsForm({
  workspace,
}: WorkspaceSettingsFormProps) {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      businessType: workspace.businessType ?? null,
      orgNumber: workspace.orgNumber ?? "",
      orgName: workspace.orgName ?? "",
      contactName: workspace.contactName ?? "",
      contactPhone: workspace.contactPhone ?? "",
      contactEmail: workspace.contactEmail ?? "",
      address: workspace.address ?? "",
      postalCode: workspace.postalCode ?? "",
      city: workspace.city ?? "",
      bankgiro: workspace.bankgiro ?? "",
      plusgiro: workspace.plusgiro ?? "",
      iban: workspace.iban ?? "",
      bic: workspace.bic ?? "",
      swishNumber: workspace.swishNumber ?? "",
      paymentTermsDays: workspace.paymentTermsDays ?? 30,
      invoiceNotes: workspace.invoiceNotes ?? "",
      deliveryTerms: workspace.deliveryTerms ?? "",
      latePaymentInterest: workspace.latePaymentInterest
        ? Number(workspace.latePaymentInterest)
        : null,
      defaultPaymentMethod: workspace.defaultPaymentMethod ?? "",
      addOcrNumber: workspace.addOcrNumber ?? false,
      vatReportingFrequency: workspace.vatReportingFrequency ?? "quarterly",
      inboxEmailSlug: workspace.inboxEmailSlug ?? "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  const updateMutation = trpc.workspaces.update.useMutation({
    onSuccess: (updated) => {
      if (updated.slug !== workspace.slug) {
        router.push(`/${updated.slug}/installningar`);
      } else {
        reset({
          workspaceId: updated.id,
          name: updated.name,
          slug: updated.slug,
          businessType: updated.businessType ?? null,
          orgNumber: updated.orgNumber ?? "",
          orgName: updated.orgName ?? "",
          contactName: updated.contactName ?? "",
          contactPhone: updated.contactPhone ?? "",
          contactEmail: updated.contactEmail ?? "",
          address: updated.address ?? "",
          postalCode: updated.postalCode ?? "",
          city: updated.city ?? "",
          bankgiro: updated.bankgiro ?? "",
          plusgiro: updated.plusgiro ?? "",
          iban: updated.iban ?? "",
          bic: updated.bic ?? "",
          swishNumber: updated.swishNumber ?? "",
          paymentTermsDays: updated.paymentTermsDays ?? 30,
          invoiceNotes: updated.invoiceNotes ?? "",
          deliveryTerms: updated.deliveryTerms ?? "",
          latePaymentInterest: updated.latePaymentInterest
            ? Number(updated.latePaymentInterest)
            : null,
          defaultPaymentMethod: updated.defaultPaymentMethod ?? "",
          addOcrNumber: updated.addOcrNumber ?? false,
          vatReportingFrequency: updated.vatReportingFrequency ?? "quarterly",
          inboxEmailSlug: updated.inboxEmailSlug ?? "",
        });
        router.refresh();
      }
    },
  });

  function onSubmit(data: FormValues) {
    updateMutation.mutate({
      workspaceId: data.workspaceId,
      name: data.name,
      slug: data.slug,
      businessType: data.businessType,
      orgNumber: data.orgNumber ? data.orgNumber.replace(/\D/g, "") : undefined,
      orgName: data.orgName || null,
      contactName: data.contactName || null,
      contactPhone: data.contactPhone || null,
      contactEmail: data.contactEmail || null,
      address: data.address || null,
      postalCode: data.postalCode || null,
      city: data.city || null,
      bankgiro: data.bankgiro || null,
      plusgiro: data.plusgiro || null,
      iban: data.iban || null,
      bic: data.bic || null,
      swishNumber: data.swishNumber || null,
      paymentTermsDays: data.paymentTermsDays,
      invoiceNotes: data.invoiceNotes || null,
      deliveryTerms: data.deliveryTerms || null,
      latePaymentInterest: data.latePaymentInterest,
      defaultPaymentMethod: data.defaultPaymentMethod || null,
      addOcrNumber: data.addOcrNumber,
      vatReportingFrequency: data.vatReportingFrequency || null,
      inboxEmailSlug: data.inboxEmailSlug || null,
    });
  }

  const isSubmitting = updateMutation.isPending;

  return (
    <form id="workspace-settings-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Grundläggande information</CardTitle>
            <CardDescription>Arbetsytans namn och URL-slug</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Namn</FieldLabel>
                <Input
                  id="name"
                  placeholder="Arbetsytans namn"
                  disabled={isSubmitting}
                  {...register("name")}
                />
                <FieldDescription>
                  Namnet som visas i sidomenyn och på arbetsytan
                </FieldDescription>
                {errors.name && <FieldError errors={[errors.name]} />}
              </Field>

              <Field data-invalid={!!errors.slug}>
                <FieldLabel htmlFor="slug">URL-slug</FieldLabel>
                <Input
                  id="slug"
                  placeholder="abcd"
                  maxLength={4}
                  disabled={isSubmitting}
                  {...register("slug", {
                    onChange: (e) => {
                      e.target.value = e.target.value.toLowerCase();
                    },
                  })}
                />
                <FieldDescription>
                  4 tecken (a-z, 0-9). Används i webbadressen
                </FieldDescription>
                {errors.slug && <FieldError errors={[errors.slug]} />}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Företagsinformation</CardTitle>
            <CardDescription>
              Information om företaget som används för fakturering och AGI XML
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="businessType"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="businessType">Företagstyp</FieldLabel>
                    <Select
                      value={field.value ?? "__none__"}
                      onValueChange={(v) =>
                        field.onChange(v === "__none__" ? null : v)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="businessType" className="w-full">
                        <SelectValue placeholder="Välj företagstyp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Ingen</SelectItem>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {businessTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Typ av företag eller organisation
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field data-invalid={!!errors.orgNumber}>
                <FieldLabel htmlFor="orgNumber">Organisationsnummer</FieldLabel>
                <Input
                  id="orgNumber"
                  placeholder="XXXXXX-XXXX"
                  maxLength={13}
                  disabled={isSubmitting}
                  {...register("orgNumber")}
                />
                <FieldDescription>
                  10-12 siffror (t.ex. 165592-5403)
                </FieldDescription>
                {errors.orgNumber && <FieldError errors={[errors.orgNumber]} />}
              </Field>

              <Field data-invalid={!!errors.orgName}>
                <FieldLabel htmlFor="orgName">Företagsnamn</FieldLabel>
                <Input
                  id="orgName"
                  placeholder="Företagsnamn"
                  maxLength={200}
                  disabled={isSubmitting}
                  {...register("orgName")}
                />
                <FieldDescription>Det officiella företagsnamnet</FieldDescription>
                {errors.orgName && <FieldError errors={[errors.orgName]} />}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kontaktinformation</CardTitle>
            <CardDescription>Kontaktuppgifter för företaget</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={!!errors.contactName}>
                <FieldLabel htmlFor="contactName">Kontaktperson</FieldLabel>
                <Input
                  id="contactName"
                  placeholder="Namn på kontaktperson"
                  maxLength={100}
                  disabled={isSubmitting}
                  {...register("contactName")}
                />
                <FieldDescription>
                  Namn på den person som ska kontaktas
                </FieldDescription>
                {errors.contactName && (
                  <FieldError errors={[errors.contactName]} />
                )}
              </Field>

              <Field data-invalid={!!errors.contactPhone}>
                <FieldLabel htmlFor="contactPhone">Telefonnummer</FieldLabel>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+46 70 123 45 67"
                  maxLength={20}
                  disabled={isSubmitting}
                  {...register("contactPhone")}
                />
                <FieldDescription>
                  Telefonnummer till kontaktpersonen
                </FieldDescription>
                {errors.contactPhone && (
                  <FieldError errors={[errors.contactPhone]} />
                )}
              </Field>

              <Field data-invalid={!!errors.contactEmail}>
                <FieldLabel htmlFor="contactEmail">E-postadress</FieldLabel>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="kontakt@foretag.se"
                  disabled={isSubmitting}
                  {...register("contactEmail")}
                />
                <FieldDescription>
                  E-postadress till kontaktpersonen
                </FieldDescription>
                {errors.contactEmail && (
                  <FieldError errors={[errors.contactEmail]} />
                )}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adress</CardTitle>
            <CardDescription>Företagets adress</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={!!errors.address}>
                <FieldLabel htmlFor="address">Gatuadress</FieldLabel>
                <Textarea
                  id="address"
                  placeholder="Gatan 123"
                  maxLength={200}
                  disabled={isSubmitting}
                  {...register("address")}
                />
                <FieldDescription>Gatuadress</FieldDescription>
                {errors.address && <FieldError errors={[errors.address]} />}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!errors.postalCode}>
                  <FieldLabel htmlFor="postalCode">Postnummer</FieldLabel>
                  <Input
                    id="postalCode"
                    placeholder="123 45"
                    maxLength={10}
                    disabled={isSubmitting}
                    {...register("postalCode")}
                  />
                  <FieldDescription>Postnummer</FieldDescription>
                  {errors.postalCode && (
                    <FieldError errors={[errors.postalCode]} />
                  )}
                </Field>

                <Field data-invalid={!!errors.city}>
                  <FieldLabel htmlFor="city">Stad</FieldLabel>
                  <Input
                    id="city"
                    placeholder="Stockholm"
                    maxLength={100}
                    disabled={isSubmitting}
                    {...register("city")}
                  />
                  <FieldDescription>Stad</FieldDescription>
                  {errors.city && <FieldError errors={[errors.city]} />}
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Betalningsinformation</CardTitle>
            <CardDescription>
              Betalningsuppgifter som visas på fakturor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!errors.bankgiro}>
                  <FieldLabel htmlFor="bankgiro">Bankgiro</FieldLabel>
                  <Input
                    id="bankgiro"
                    placeholder="123-4567"
                    maxLength={20}
                    disabled={isSubmitting}
                    {...register("bankgiro")}
                  />
                  <FieldDescription>Bankgironummer</FieldDescription>
                  {errors.bankgiro && <FieldError errors={[errors.bankgiro]} />}
                </Field>

                <Field data-invalid={!!errors.plusgiro}>
                  <FieldLabel htmlFor="plusgiro">Plusgiro</FieldLabel>
                  <Input
                    id="plusgiro"
                    placeholder="12 34 56-7"
                    maxLength={20}
                    disabled={isSubmitting}
                    {...register("plusgiro")}
                  />
                  <FieldDescription>Plusgironummer</FieldDescription>
                  {errors.plusgiro && <FieldError errors={[errors.plusgiro]} />}
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!errors.iban}>
                  <FieldLabel htmlFor="iban">IBAN</FieldLabel>
                  <Input
                    id="iban"
                    placeholder="SE35 5000 0000 0549 1000 0003"
                    maxLength={34}
                    disabled={isSubmitting}
                    {...register("iban")}
                  />
                  <FieldDescription>
                    För internationella betalningar
                  </FieldDescription>
                  {errors.iban && <FieldError errors={[errors.iban]} />}
                </Field>

                <Field data-invalid={!!errors.bic}>
                  <FieldLabel htmlFor="bic">BIC/SWIFT</FieldLabel>
                  <Input
                    id="bic"
                    placeholder="ESSESESS"
                    maxLength={11}
                    disabled={isSubmitting}
                    {...register("bic")}
                  />
                  <FieldDescription>Bankens BIC-kod</FieldDescription>
                  {errors.bic && <FieldError errors={[errors.bic]} />}
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!errors.swishNumber}>
                  <FieldLabel htmlFor="swishNumber">Swish-nummer</FieldLabel>
                  <Input
                    id="swishNumber"
                    placeholder="123 456 78 90"
                    maxLength={20}
                    disabled={isSubmitting}
                    {...register("swishNumber")}
                  />
                  <FieldDescription>Swish för företag</FieldDescription>
                  {errors.swishNumber && (
                    <FieldError errors={[errors.swishNumber]} />
                  )}
                </Field>

                <Controller
                  name="paymentTermsDays"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="paymentTermsDays">
                        Betalningsvillkor (dagar)
                      </FieldLabel>
                      <Input
                        id="paymentTermsDays"
                        type="number"
                        min={1}
                        max={365}
                        disabled={isSubmitting}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : 30
                          )
                        }
                      />
                      <FieldDescription>Standard: 30 dagar netto</FieldDescription>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Field data-invalid={!!errors.invoiceNotes}>
                <FieldLabel htmlFor="invoiceNotes">Fakturatext</FieldLabel>
                <Textarea
                  id="invoiceNotes"
                  placeholder="Standardtext som visas på fakturor..."
                  maxLength={1000}
                  rows={3}
                  disabled={isSubmitting}
                  {...register("invoiceNotes")}
                />
                <FieldDescription>
                  Visas längst ner på alla fakturor
                </FieldDescription>
                {errors.invoiceNotes && (
                  <FieldError errors={[errors.invoiceNotes]} />
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!errors.deliveryTerms}>
                  <FieldLabel htmlFor="deliveryTerms">
                    Leveransvillkor (standard)
                  </FieldLabel>
                  <Input
                    id="deliveryTerms"
                    placeholder="T.ex. Fritt vårt lager"
                    maxLength={200}
                    disabled={isSubmitting}
                    {...register("deliveryTerms")}
                  />
                  <FieldDescription>
                    Standardtext för leveransvillkor på fakturor
                  </FieldDescription>
                  {errors.deliveryTerms && (
                    <FieldError errors={[errors.deliveryTerms]} />
                  )}
                </Field>

                <Controller
                  name="latePaymentInterest"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="latePaymentInterest">
                        Dröjsmålsränta (%)
                      </FieldLabel>
                      <Input
                        id="latePaymentInterest"
                        type="number"
                        placeholder="12"
                        min={0}
                        max={100}
                        step={0.1}
                        disabled={isSubmitting}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                      />
                      <FieldDescription>
                        Standard dröjsmålsränta vid försenad betalning
                      </FieldDescription>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Momsrapportering</CardTitle>
            <CardDescription>
              Frekvens för momsrapportering till Skatteverket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="vatReportingFrequency"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="vatReportingFrequency">
                      Momsrapporteringsfrekvens
                    </FieldLabel>
                    <Select
                      value={field.value ?? "quarterly"}
                      onValueChange={(v) => field.onChange(v)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="vatReportingFrequency" className="w-full">
                        <SelectValue placeholder="Välj frekvens" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Månadsvis</SelectItem>
                        <SelectItem value="quarterly">Kvartalsvis</SelectItem>
                        <SelectItem value="yearly">Årsvis</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Hur ofta du rapporterar moms till Skatteverket
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>E-postinkorg</CardTitle>
            <CardDescription>
              Ta emot kvitton och bilagor via e-post
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={!!errors.inboxEmailSlug}>
                <FieldLabel htmlFor="inboxEmailSlug">Inkorgsadress</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="inboxEmailSlug"
                    placeholder={workspace.name.toLowerCase().replace(/[^a-z0-9]/g, "")}
                    maxLength={30}
                    disabled={isSubmitting}
                    {...register("inboxEmailSlug", {
                      onChange: (e) => {
                        e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "");
                      },
                    })}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>.{workspace.slug}@inbox.kvitty.se</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  {form.watch("inboxEmailSlug") ? (
                    <>
                      Skicka kvitton till{" "}
                      <code className="bg-muted px-1 py-0.5 rounded text-xs">
                        {form.watch("inboxEmailSlug")}.{workspace.slug}@inbox.kvitty.se
                      </code>
                    </>
                  ) : (
                    "Endast små bokstäver och siffror tillåts"
                  )}
                </FieldDescription>
                {errors.inboxEmailSlug && (
                  <FieldError errors={[errors.inboxEmailSlug]} />
                )}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {updateMutation.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">
              {updateMutation.error.message}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            form="workspace-settings-form"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? <Spinner /> : "Spara ändringar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
