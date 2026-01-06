"use client";

import { useState } from "react";
import {
  CaretDown,
  CaretUp,
  Paperclip,
  Link as LinkIcon,
  LinkBreak,
  Clock,
  CheckCircle,
  XCircle,
  WarningCircle,
  File,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { LinkAttachmentDialog } from "./link-attachment-dialog";
import type { WorkspaceMode } from "@/lib/db/schema";

type InboxEmail = {
  id: string;
  fromEmail: string;
  subject: string | null;
  receivedAt: Date;
  status: "pending" | "processed" | "rejected" | "error";
  attachments: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number | null;
    mimeType: string | null;
    links: {
      id: string;
      journalEntryId: string | null;
      bankTransactionId: string | null;
    }[];
  }[];
};

type Props = {
  email: InboxEmail;
  workspaceId: string;
  workspaceMode: WorkspaceMode;
};

const statusConfig = {
  pending: {
    label: "Väntande",
    icon: Clock,
    variant: "secondary" as const,
  },
  processed: {
    label: "Behandlad",
    icon: CheckCircle,
    variant: "default" as const,
  },
  rejected: {
    label: "Avvisad",
    icon: XCircle,
    variant: "destructive" as const,
  },
  error: {
    label: "Fel",
    icon: WarningCircle,
    variant: "destructive" as const,
  },
};

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Security: Only allow safe URL protocols
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function InboxEmailCard({ email, workspaceId, workspaceMode }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [linkingAttachment, setLinkingAttachment] = useState<{
    id: string;
    fileName: string;
  } | null>(null);
  const [unlinkConfirm, setUnlinkConfirm] = useState<{
    linkId: string;
    fileName: string;
  } | null>(null);

  const utils = trpc.useUtils();
  const unlinkMutation = trpc.inbox.unlinkAttachment.useMutation({
    onSuccess: () => {
      utils.inbox.list.invalidate({ workspaceId });
      toast.success("Kopplingen har tagits bort");
      setUnlinkConfirm(null);
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte ta bort kopplingen");
    },
  });

  const StatusIcon = statusConfig[email.status].icon;
  const hasAttachments = email.attachments.length > 0;
  const linkedCount = email.attachments.filter((a) => a.links.length > 0).length;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={statusConfig[email.status].variant}>
                  <StatusIcon className="size-3 mr-1" />
                  {statusConfig[email.status].label}
                </Badge>
                {hasAttachments && (
                  <Badge variant="outline">
                    <Paperclip className="size-3 mr-1" />
                    {email.attachments.length === 1 ? "1 bilaga" : `${email.attachments.length} bilagor`}
                    {linkedCount > 0 && ` (${linkedCount} ${linkedCount === 1 ? "kopplad" : "kopplade"})`}
                  </Badge>
                )}
              </div>
              <p className="font-medium truncate">
                {email.subject || "(Inget ämne)"}
              </p>
              <p className="text-sm text-muted-foreground">
                Från: {email.fromEmail}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(email.receivedAt), {
                  addSuffix: true,
                  locale: sv,
                })}
              </p>
            </div>

            {hasAttachments && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <CaretUp className="size-4 mr-1" />
                    Dölj bilagor
                  </>
                ) : (
                  <>
                    <CaretDown className="size-4 mr-1" />
                    Visa bilagor
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        {expanded && hasAttachments && (
          <CardContent className="pt-0">
            <div className="border-t pt-4 space-y-3">
              {email.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <File className="size-8 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      {isSafeUrl(attachment.fileUrl) ? (
                        <a
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sm hover:underline truncate block"
                        >
                          {attachment.fileName}
                        </a>
                      ) : (
                        <span className="font-medium text-sm truncate block">
                          {attachment.fileName}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {attachment.mimeType}
                        {attachment.fileSize && (
                          <> · {formatFileSize(attachment.fileSize)}</>
                        )}
                      </p>
                      {attachment.links.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          <LinkIcon className="size-3 inline mr-1" />
                          Kopplad till {attachment.links.length}{" "}
                          {workspaceMode === "full_bookkeeping"
                            ? "verifikation(er)"
                            : "transaktion(er)"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {attachment.links.length > 0 ? (
                      <>
                        {attachment.links.map((link, index) => (
                          <Button
                            key={link.id}
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setUnlinkConfirm({
                                linkId: link.id,
                                fileName: attachment.fileName,
                              })
                            }
                            disabled={unlinkMutation.isPending}
                          >
                            {unlinkMutation.isPending && unlinkConfirm?.linkId === link.id ? (
                              <Spinner className="size-4 mr-1" />
                            ) : (
                              <LinkBreak className="size-4 mr-1" />
                            )}
                            Ta bort koppling{attachment.links.length > 1 ? ` ${index + 1}` : ""}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setLinkingAttachment({
                              id: attachment.id,
                              fileName: attachment.fileName,
                            })
                          }
                        >
                          <LinkIcon className="size-4 mr-1" />
                          Lägg till koppling
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setLinkingAttachment({
                            id: attachment.id,
                            fileName: attachment.fileName,
                          })
                        }
                      >
                        <LinkIcon className="size-4 mr-1" />
                        Koppla
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {linkingAttachment && (
        <LinkAttachmentDialog
          open={!!linkingAttachment}
          onOpenChange={(open) => !open && setLinkingAttachment(null)}
          attachmentId={linkingAttachment.id}
          attachmentName={linkingAttachment.fileName}
          workspaceId={workspaceId}
          workspaceMode={workspaceMode}
        />
      )}

      <AlertDialog open={!!unlinkConfirm} onOpenChange={(open) => !open && setUnlinkConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort koppling?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort kopplingen för &quot;{unlinkConfirm?.fileName}&quot;?
              Detta påverkar inte själva filen eller transaktionen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlinkMutation.isPending}>
              Avbryt
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (unlinkConfirm) {
                  unlinkMutation.mutate({
                    workspaceId,
                    linkId: unlinkConfirm.linkId,
                  });
                }
              }}
              disabled={unlinkMutation.isPending}
            >
              {unlinkMutation.isPending ? (
                <>
                  <Spinner className="size-4 mr-2" />
                  Tar bort...
                </>
              ) : (
                "Ta bort koppling"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
