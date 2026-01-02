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

interface UserSettingsFormProps {
  initialName: string;
  email: string;
}

export function UserSettingsForm({
  initialName,
  email,
}: UserSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);

  const updateMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate({ name });
  }

  const hasChanges = name !== initialName;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Uppdatera din personliga information</CardDescription>
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
                placeholder="Ditt namn"
                required
                disabled={updateMutation.isPending}
              />
              <FieldDescription>
                Namnet som visas för andra medlemmar i arbetsytan
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">E-postadress</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <FieldDescription>
                Din e-postadress kan inte ändras
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
