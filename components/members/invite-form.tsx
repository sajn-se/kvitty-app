"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface InviteFormProps {
  workspaceId: string;
  workspaceSlug: string;
}

export function InviteForm({ workspaceId }: InviteFormProps) {
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");

  const createMutation = trpc.invites.create.useMutation({
    onSuccess: () => {
      toast.success("Inbjudan skickad!", {
        description: `En inbjudan har skickats till ${email}`,
      });
      setEmail("");
      utils.invites.list.invalidate({ workspaceId });
    },
    onError: (error) => {
      toast.error("Kunde inte skicka inbjudan", {
        description: error.message,
      });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    createMutation.mutate({ workspaceId, email: email.trim() });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bjud in nya medlemmar</CardTitle>
        <CardDescription>
          Ange e-postadressen till personen du vill bjuda in. En inbjudan
          skickas automatiskt via e-post och är giltig i 7 dagar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-postadress</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="kollega@exempel.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={createMutation.isPending}
              />
              <Button
                type="submit"
                disabled={createMutation.isPending || !email.trim()}
              >
                {createMutation.isPending ? <Spinner /> : "Skicka inbjudan"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
