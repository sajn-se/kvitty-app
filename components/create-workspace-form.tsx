"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [name, setName] = useState("");

  const createWorkspace = trpc.workspaces.create.useMutation({
    onSuccess: (workspace) => {
      router.push(`/${workspace.slug}`);
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createWorkspace.mutate({ name });
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm w-full">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-8 items-center justify-center rounded-md">
              <Receipt className="size-6" weight="duotone" />
            </div>
            <h1 className="text-xl font-bold">Välkommen till Kvitty</h1>
            <FieldDescription>
              Skapa din första arbetsyta för att komma igång
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="name">Namn på arbetsyta</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="t.ex. Mitt Företag AB"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={createWorkspace.isPending}
            />
          </Field>
          {createWorkspace.error && (
            <p className="text-sm text-red-500 text-center">
              Kunde inte skapa arbetsyta. Försök igen.
            </p>
          )}
          <Field>
            <Button
              type="submit"
              disabled={createWorkspace.isPending || !name.trim()}
            >
              {createWorkspace.isPending ? <Spinner /> : "Skapa arbetsyta"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
