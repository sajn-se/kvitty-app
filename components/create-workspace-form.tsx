"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Files, Calculator, CaretDownIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import { WorkspaceModeSelector } from "./workspace-mode-selector";
import type { WorkspaceMode, BusinessType } from "@/lib/validations/workspace";

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

const modeInfo: Record<
  WorkspaceMode,
  {
    title: string;
    description: string;
    icon: typeof Files;
    price: string;
    benefits: string[];
  }
> = {
  simple: {
    title: "Enkel",
    description: "Samla underlag och kvitton för din externa bokförare",
    icon: Files,
    price: "Gratis",
    benefits: [
      "Kvittohantering",
      "Obegränsade verifikationer",
      "Obegränsad lagring",
      "Bjud in teammedlemmar",
      "Automatiska säkerhetskopior",
      "Uppdateringar ingår",
      "Teknisk support",
    ],
  },
  full_bookkeeping: {
    title: "Bokföring",
    description: "Komplett bokföringssystem med löner, moms och arbetsgivardeklaration",
    icon: Calculator,
    price: "Gratis",
    benefits: [
      "Traditionell bokföring",
      "Kvittohantering",
      "Obegränsade verifikationer",
      "Obegränsad lagring",
      "Exportera till SIE-fil",
      "Bjud in teammedlemmar",
      "Automatiska säkerhetskopior",
      "Uppdateringar ingår",
      "Teknisk support",
    ],
  },
};

interface CreateWorkspaceFormProps {
  userName?: string | null;
}

export function CreateWorkspaceForm({ userName }: CreateWorkspaceFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<WorkspaceMode>("full_bookkeeping");
  const [businessType, setBusinessType] = useState<BusinessType | undefined>();
  const [orgNumber, setOrgNumber] = useState("");
  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const createWorkspace = trpc.workspaces.create.useMutation({
    onSuccess: (workspace) => {
      router.push(`/${workspace.slug}`);
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createWorkspace.mutate({
      name,
      mode,
      businessType,
      orgNumber: orgNumber ? orgNumber.replace(/\D/g, "") : undefined,
      orgName: orgName || undefined,
      contactEmail: contactEmail || undefined,
    });
  }

  function handleContinue() {
    setStep(2);
  }

  const isFullMode = mode === "full_bookkeeping";

  const selectedModeInfo = modeInfo[mode];
  const ModeIcon = selectedModeInfo.icon;

  return (
    <div className="flex flex-col gap-6 max-w-lg w-full">
      {step === 1 ? (
        <FieldGroup>
          <Field>
            <FieldLabel>Välj typ av arbetsyta</FieldLabel>
            <WorkspaceModeSelector
              value={mode}
              onChange={setMode}
              disabled={createWorkspace.isPending}
            />
          </Field>

          <Field>
            <Button
              type="button"
              onClick={handleContinue}
              disabled={createWorkspace.isPending}
              className="w-full"
            >
              Fortsätt
            </Button>
          </Field>
        </FieldGroup>
      ) : (
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ModeIcon className="size-5" weight="duotone" />
                  </div>
                  <div>
                    <CardTitle>{selectedModeInfo.title}</CardTitle>
                    <CardDescription>{selectedModeInfo.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Field>
              <FieldLabel htmlFor="name">Namn på arbetsyta</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="t.ex. Mitt Företag"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createWorkspace.isPending}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="orgNumber">Organisationsnummer</FieldLabel>
                <Input
                  id="orgNumber"
                  type="text"
                  placeholder="XXXXXX-XXXX"
                  value={orgNumber}
                  onChange={(e) => setOrgNumber(e.target.value)}
                  disabled={createWorkspace.isPending}
                  maxLength={13}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="orgName">Företagsnamn</FieldLabel>
                <Input
                  id="orgName"
                  type="text"
                  placeholder="Företaget AB"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  disabled={createWorkspace.isPending}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="contactEmail">Kontakt e-post</FieldLabel>
              <Input
                id="contactEmail"
                type="email"
                placeholder="info@foretaget.se"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                disabled={createWorkspace.isPending}
              />
            </Field>

            {isFullMode && (
              <>
                <FieldSeparator>Företagsinformation</FieldSeparator>

                <Field>
                  <FieldLabel htmlFor="businessType">Företagsform</FieldLabel>
                  <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        id="businessType"
                        variant="outline"
                        className="w-full justify-between"
                        disabled={createWorkspace.isPending}
                      >
                        <span>{businessType ? businessTypeLabels[businessType] : "Välj företagsform"}</span>
                        <CaretDownIcon className="size-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                      <DropdownMenuRadioGroup
                        value={businessType}
                        onValueChange={(v) => {
                          setBusinessType(v as BusinessType);
                          setDropdownOpen(false);
                        }}
                      >
                        {Object.entries(businessTypeLabels).map(([value, label]) => (
                          <DropdownMenuRadioItem key={value} value={value}>
                            {label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Field>
              </>
            )}

            {createWorkspace.error && (
              <p className="text-sm text-red-500 text-center">
                Kunde inte skapa arbetsyta. Försök igen.
              </p>
            )}

            <div className="flex gap-3">
              <Field className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={createWorkspace.isPending}
                  className="w-full"
                >
                  Tillbaka
                </Button>
              </Field>
              <Field className="flex-1">
                <Button
                  type="submit"
                  disabled={createWorkspace.isPending || !name.trim()}
                  className="w-full"
                >
                  {createWorkspace.isPending ? <Spinner /> : "Skapa arbetsyta"}
                </Button>
              </Field>
            </div>
          </FieldGroup>
        </form>
      )}
    </div>
  );
}
