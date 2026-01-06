"use client";

import { useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

interface AllowedEmailsSectionProps {
  workspaceId: string;
}

export function AllowedEmailsSection({
  workspaceId,
}: AllowedEmailsSectionProps) {
  const [newEmail, setNewEmail] = useState("");
  const utils = trpc.useUtils();

  const { data: allowedEmails, isLoading } = trpc.allowedEmails.list.useQuery({
    workspaceId,
  });

  const createMutation = trpc.allowedEmails.create.useMutation({
    onSuccess: () => {
      setNewEmail("");
      utils.allowedEmails.list.invalidate({ workspaceId });
      toast.success("E-postadress tillagd");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.allowedEmails.delete.useMutation({
    onSuccess: () => {
      utils.allowedEmails.list.invalidate({ workspaceId });
      toast.success("E-postadress borttagen");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    createMutation.mutate({
      workspaceId,
      email: newEmail.trim(),
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({
      workspaceId,
      id,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dina tillåtna e-postadresser</CardTitle>
        <CardDescription>
          E-postadresser du kan skicka kvitton från till denna arbetsytas inkorg.
          När du skickar från en av dessa adresser kommer bilagorna automatiskt
          att kopplas till dig.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <Input
            type="email"
            placeholder="din.email@exempel.se"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={createMutation.isPending}
            className="flex-1"
          />
          <Button type="submit" disabled={createMutation.isPending || !newEmail.trim()}>
            {createMutation.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <>
                <Plus className="size-4 mr-2" />
                Lägg till
              </>
            )}
          </Button>
        </form>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner className="size-6" />
          </div>
        ) : allowedEmails?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Du har inte lagt till några tillåtna e-postadresser ännu.
          </p>
        ) : (
          <div className="space-y-2">
            {allowedEmails?.map((allowedEmail) => (
              <div
                key={allowedEmail.id}
                className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg"
              >
                <span className="text-sm font-medium">{allowedEmail.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(allowedEmail.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
