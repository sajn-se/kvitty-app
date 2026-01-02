"use client";

import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface PendingInvitesProps {
  workspaceId: string;
}

export function PendingInvites({ workspaceId }: PendingInvitesProps) {
  const utils = trpc.useUtils();
  const { data: invites, isLoading } = trpc.invites.list.useQuery({
    workspaceId,
  });

  const revokeMutation = trpc.invites.revoke.useMutation({
    onSuccess: () => {
      toast.success("Inbjudan återkallad");
      utils.invites.list.invalidate({ workspaceId });
    },
  });

  const resendMutation = trpc.invites.resend.useMutation({
    onSuccess: () => {
      toast.success("Inbjudan skickad igen");
    },
    onError: (error) => {
      toast.error("Kunde inte skicka inbjudan", {
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Väntande inbjudningar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invites || invites.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Väntande inbjudningar</CardTitle>
        <CardDescription>
          Inbjudningar som skickats men ännu inte accepterats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-postadress</TableHead>
              <TableHead>Skickad av</TableHead>
              <TableHead>Skapad</TableHead>
              <TableHead>Upphör</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((invite) => (
              <TableRow key={invite.id}>
                <TableCell className="font-medium">{invite.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {invite.createdBy}
                </TableCell>
                <TableCell>
                  {new Date(invite.createdAt).toLocaleDateString("sv-SE")}
                </TableCell>
                <TableCell>
                  {invite.expiresAt
                    ? new Date(invite.expiresAt).toLocaleDateString("sv-SE")
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        resendMutation.mutate({
                          workspaceId,
                          inviteId: invite.id,
                        })
                      }
                      disabled={resendMutation.isPending}
                    >
                      {resendMutation.isPending ? <Spinner /> : "Skicka igen"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        revokeMutation.mutate({
                          workspaceId,
                          inviteId: invite.id,
                        })
                      }
                      disabled={revokeMutation.isPending}
                    >
                      {revokeMutation.isPending ? <Spinner /> : "Återkalla"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
