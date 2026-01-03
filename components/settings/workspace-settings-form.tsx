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
    },
  });

  const updateMutation = trpc.workspaces.update.useMutation({
    onSuccess: (updated) => {
      if (updated.slug !== workspace.slug) {
        router.push(`/${updated.slug}/settings`);
      } else {
        form.reset({
          workspaceId: workspace.id,
          name: updated.name,
          slug: updated.slug,
          businessType: updated.businessType,
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
        });
        router.refresh();
      }
    },
  });

  function onSubmit(data: FormValues) {
    const payload: Parameters<typeof updateMutation.mutate>[0] = {
      workspaceId: workspace.id,
      name: data.name,
    };

    if (data.slug !== workspace.slug) {
      payload.slug = data.slug;
    }

    if (data.businessType !== workspace.businessType) {
      payload.businessType = data.businessType;
    }

    if (data.orgNumber !== (workspace.orgNumber ?? "")) {
      payload.orgNumber = data.orgNumber || "";
    }

    if (data.orgName !== (workspace.orgName ?? "")) {
      payload.orgName = data.orgName || null;
    }

    if (data.contactName !== (workspace.contactName ?? "")) {
      payload.contactName = data.contactName || null;
    }

    if (data.contactPhone !== (workspace.contactPhone ?? "")) {
      payload.contactPhone = data.contactPhone || null;
    }

    if (data.contactEmail !== (workspace.contactEmail ?? "")) {
      payload.contactEmail = data.contactEmail || null;
    }

    if (data.address !== (workspace.address ?? "")) {
      payload.address = data.address || null;
    }

    if (data.postalCode !== (workspace.postalCode ?? "")) {
      payload.postalCode = data.postalCode || null;
    }

    if (data.city !== (workspace.city ?? "")) {
      payload.city = data.city || null;
    }

    if (data.bankgiro !== (workspace.bankgiro ?? "")) {
      payload.bankgiro = data.bankgiro || null;
    }

    if (data.plusgiro !== (workspace.plusgiro ?? "")) {
      payload.plusgiro = data.plusgiro || null;
    }

    if (data.iban !== (workspace.iban ?? "")) {
      payload.iban = data.iban || null;
    }

    if (data.bic !== (workspace.bic ?? "")) {
      payload.bic = data.bic || null;
    }

    if (data.swishNumber !== (workspace.swishNumber ?? "")) {
      payload.swishNumber = data.swishNumber || null;
    }

    if (data.paymentTermsDays !== (workspace.paymentTermsDays ?? 30)) {
      payload.paymentTermsDays = data.paymentTermsDays;
    }

    if (data.invoiceNotes !== (workspace.invoiceNotes ?? "")) {
      payload.invoiceNotes = data.invoiceNotes || null;
    }

    updateMutation.mutate(payload);
  }

  const isDirty = form.formState.isDirty;
  const isSubmitting = updateMutation.isPending;

  return (
    <form id="workspace-settings-form" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Grundläggande information</CardTitle>
            <CardDescription>
              Arbetsytans namn och URL-slug
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="workspace-settings-name">
                      Namn
                    </FieldLabel>
                    <Input
                      {...field}
                      id="workspace-settings-name"
                      placeholder="Arbetsytans namn"
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      Namnet som visas i sidomenyn och på arbetsytan
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="slug"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="workspace-settings-slug">
                      URL-slug
                    </FieldLabel>
                    <Input
                      {...field}
                      id="workspace-settings-slug"
                      placeholder="abcd"
                      pattern="[a-z0-9]{4}"
                      maxLength={4}
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => {
                        field.onChange(e.target.value.toLowerCase());
                      }}
                    />
                    <FieldDescription>
                      4 tecken (a-z, 0-9). Används i webbadressen: /{field.value}/...
                    </FieldDescription>
                    {fieldState.invalid && (
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
            <CardTitle>Företagsinformation</CardTitle>
            <CardDescription>
              Information om företaget som används för fakturering och AGI XML
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="businessType"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="workspace-settings-businessType">
                      Företagstyp
                    </FieldLabel>
                    <Select
                      value={field.value ?? "__none__"}
                      onValueChange={(value) => {
                        field.onChange(value === "__none__" ? null : value);
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        id="workspace-settings-businessType"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
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
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="orgNumber"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="workspace-settings-orgNumber">
                      Organisationsnummer
                    </FieldLabel>
                    <Input
                      {...field}
                      id="workspace-settings-orgNumber"
                      placeholder="165592540321"
                      pattern="\d{10,12}"
                      maxLength={12}
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      10-12 siffror (t.ex. 165592540321)
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="orgName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="workspace-settings-orgName">
                      Företagsnamn
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="workspace-settings-orgName"
                      placeholder="Företagsnamn"
                      maxLength={200}
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      Det officiella företagsnamnet
                    </FieldDescription>
                    {fieldState.invalid && (
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
            <CardTitle>Kontaktinformation</CardTitle>
            <CardDescription>
              Kontaktuppgifter för företaget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="contactName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="workspace-settings-contactName">
                      Kontaktperson
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="workspace-settings-contactName"
                      placeholder="Namn på kontaktperson"
                      maxLength={100}
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      Namn på den person som ska kontaktas
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="contactPhone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="workspace-settings-contactPhone">
                      Telefonnummer
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="workspace-settings-contactPhone"
                      type="tel"
                      placeholder="+46 70 123 45 67"
                      maxLength={20}
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      Telefonnummer till kontaktpersonen
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="contactEmail"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="workspace-settings-contactEmail">
                      E-postadress
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="workspace-settings-contactEmail"
                      type="email"
                      placeholder="kontakt@foretag.se"
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      E-postadress till kontaktpersonen
                    </FieldDescription>
                    {fieldState.invalid && (
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
            <CardTitle>Adress</CardTitle>
            <CardDescription>Företagets adress</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="workspace-settings-address">
                      Gatuadress
                    </FieldLabel>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      id="workspace-settings-address"
                      placeholder="Gatan 123"
                      maxLength={200}
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>Gatuadress</FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="postalCode"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="workspace-settings-postalCode">
                        Postnummer
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        id="workspace-settings-postalCode"
                        placeholder="123 45"
                        maxLength={10}
                        disabled={isSubmitting}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription>Postnummer</FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="city"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="workspace-settings-city">
                        Stad
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        id="workspace-settings-city"
                        placeholder="Stockholm"
                        maxLength={100}
                        disabled={isSubmitting}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription>Stad</FieldDescription>
                      {fieldState.invalid && (
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
            <CardTitle>Betalningsinformation</CardTitle>
            <CardDescription>
              Betalningsuppgifter som visas på fakturor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="bankgiro"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="workspace-settings-bankgiro">
                        Bankgiro
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        id="workspace-settings-bankgiro"
                        placeholder="123-4567"
                        maxLength={20}
                        disabled={isSubmitting}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription>Bankgironummer</FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="plusgiro"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="workspace-settings-plusgiro">
                        Plusgiro
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        id="workspace-settings-plusgiro"
                        placeholder="12 34 56-7"
                        maxLength={20}
                        disabled={isSubmitting}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription>Plusgironummer</FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="iban"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="workspace-settings-iban">
                        IBAN
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        id="workspace-settings-iban"
                        placeholder="SE35 5000 0000 0549 1000 0003"
                        maxLength={34}
                        disabled={isSubmitting}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription>För internationella betalningar</FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="bic"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="workspace-settings-bic">
                        BIC/SWIFT
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        id="workspace-settings-bic"
                        placeholder="ESSESESS"
                        maxLength={11}
                        disabled={isSubmitting}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription>Bankens BIC-kod</FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="swishNumber"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="workspace-settings-swishNumber">
                        Swish-nummer
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        id="workspace-settings-swishNumber"
                        placeholder="123 456 78 90"
                        maxLength={20}
                        disabled={isSubmitting}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription>Swish för företag</FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="paymentTermsDays"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="workspace-settings-paymentTermsDays">
                        Betalningsvillkor (dagar)
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? 30}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                        id="workspace-settings-paymentTermsDays"
                        type="number"
                        min={1}
                        max={365}
                        disabled={isSubmitting}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription>Standard: 30 dagar netto</FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Controller
                name="invoiceNotes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="workspace-settings-invoiceNotes">
                      Fakturatext
                    </FieldLabel>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      id="workspace-settings-invoiceNotes"
                      placeholder="Standardtext som visas på fakturor..."
                      maxLength={1000}
                      rows={3}
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      Visas längst ner på alla fakturor
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
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
