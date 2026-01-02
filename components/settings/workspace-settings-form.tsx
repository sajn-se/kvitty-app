"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

interface WorkspaceSettingsFormProps {
  workspaceId: string;
  initialName: string;
  initialSlug: string;
}

export function WorkspaceSettingsForm({
  workspaceId,
  initialName,
  initialSlug,
}: WorkspaceSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);

  const updateMutation = trpc.workspaces.update.useMutation({
    onSuccess: (updated) => {
      if (updated.slug !== initialSlug) {
        router.push(`/${updated.slug}/settings`);
      } else {
        router.refresh();
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate({
      workspaceId,
      name,
      slug: slug !== initialSlug ? slug : undefined,
    });
  }

  const hasChanges = name !== initialName || slug !== initialSlug;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arbetsyta</CardTitle>
        <CardDescription>Uppdatera arbetsytans grundläggande information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Namn</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Arbetsytans namn"
                required
                disabled={updateMutation.isPending}
              />
              <FieldDescription>
                Namnet som visas i sidomenyn och på arbetsytan
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="slug">URL-slug</FieldLabel>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="abcd"
                required
                pattern="[a-z0-9]{4}"
                maxLength={4}
                disabled={updateMutation.isPending}
              />
              <FieldDescription>
                4 tecken (a-z, 0-9). Används i webbadressen: /{slug}/...
              </FieldDescription>
            </Field>
            {updateMutation.error && (
              <p className="text-sm text-red-500">
                {updateMutation.error.message}
              </p>
            )}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending || !hasChanges}
              >
                {updateMutation.isPending ? <Spinner /> : "Spara ändringar"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
