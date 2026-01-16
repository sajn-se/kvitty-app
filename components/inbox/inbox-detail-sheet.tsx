"use client";

import { useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  WarningCircle,
  Paperclip,
  Link as LinkIcon,
  LinkBreak,
  File,
  FilePdf,
  Image as ImageIcon,
  FileXls,
  FileCsv,
  Archive,
} from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { LinkAttachmentDialog } from "./link-attachment-dialog";
import type { InboxEmail } from "./inbox-columns";
import type { WorkspaceMode, InboxEmailStatus } from "@/lib/db/schema";

interface InboxDetailSheetProps {
  email: InboxEmail | null;
  workspaceId: string;
  workspaceMode: WorkspaceMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<
  InboxEmailStatus,
  { label: string; icon: React.ElementType; variant: "secondary" | "default" | "destructive" }
> = {
  pending: { label: "Väntande", icon: Clock, variant: "secondary" },
  processed: { label: "Behandlad", icon: CheckCircle, variant: "default" },
  rejected: { label: "Avvisad", icon: XCircle, variant: "destructive" },
  error: { label: "Fel", icon: WarningCircle, variant: "destructive" },
  archived: { label: "Arkiverad", icon: Archive, variant: "secondary" },
};

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string | null, fileName: string) {
  if (mimeType?.startsWith("image/")) return ImageIcon;
  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) return FilePdf;
  if (
    mimeType?.includes("spreadsheet") ||
    mimeType?.includes("excel") ||
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".xls")
  )
    return FileXls;
  if (mimeType === "text/csv" || fileName.endsWith(".csv")) return FileCsv;
  return File;
}

function isImageFile(mimeType: string | null) {
  return mimeType?.startsWith("image/") ?? false;
}

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function InboxDetailSheet({
  email,
  workspaceId,
  workspaceMode,
  open,
  onOpenChange,
}: InboxDetailSheetProps) {
  const utils = trpc.useUtils();
  const [linkingAttachment, setLinkingAttachment] = useState<{
    id: string;
    fileName: string;
  } | null>(null);
  const [unlinkConfirm, setUnlinkConfirm] = useState<{
    linkId: string;
    fileName: string;
  } | null>(null);

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

  const archiveMutation = trpc.inbox.updateStatus.useMutation({
    onSuccess: () => {
      utils.inbox.list.invalidate({ workspaceId });
      toast.success("E-postmeddelandet har arkiverats");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte arkivera e-postmeddelandet");
    },
  });

  if (!email) return null;

  const StatusIcon = statusConfig[email.status].icon;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="data-[side=right]:!w-[550px] data-[side=right]:sm:!max-w-[550px] flex flex-col"
        >
          <SheetHeader>
            <SheetTitle className="truncate pr-8">
              {email.subject || "(Inget ämne)"}
            </SheetTitle>
            <SheetDescription>
              Från: {email.fromEmail}
            </SheetDescription>
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="text-sm text-muted-foreground">
                {format(new Date(email.receivedAt), "d MMMM yyyy 'kl.' HH:mm", {
                  locale: sv,
                })}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={statusConfig[email.status].variant}
                  className="gap-1"
                >
                  <StatusIcon className="size-3" />
                  {statusConfig[email.status].label}
                </Badge>
                {email.status !== "archived" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      archiveMutation.mutate({
                        workspaceId,
                        emailId: email.id,
                        status: "archived",
                      })
                    }
                    disabled={archiveMutation.isPending}
                  >
                    {archiveMutation.isPending ? (
                      <Spinner className="size-3 mr-1" />
                    ) : (
                      <Archive className="size-3 mr-1" />
                    )}
                    Arkivera
                  </Button>
                )}
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 flex flex-col min-h-0 mt-4 px-4 overflow-y-auto">

            {/* Rejection reason */}
            {email.status === "rejected" && email.rejectionReason && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm">
                <p className="font-medium text-destructive">Anledning till avvisning</p>
                <p className="text-muted-foreground mt-1">
                  {email.rejectionReason === "sender_not_allowed"
                    ? "Avsändaren finns inte i listan över godkända e-postadresser."
                    : email.rejectionReason}
                </p>
              </div>
            )}

            {/* Email body */}
            {email.emailBody && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Meddelande</h3>
                <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {email.emailBody}
                </div>
              </div>
            )}

            {/* Attachments */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">
                  Bilagor ({email.attachments.length})
                </h3>
              </div>

              {email.attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Inga bilagor
                </p>
              ) : (
                <div className="space-y-2">
                  {email.attachments.map((attachment) => {
                    const FileIcon = getFileIcon(attachment.mimeType, attachment.fileName);
                    const isImage = isImageFile(attachment.mimeType);

                    return (
                      <div
                        key={attachment.id}
                        className="flex items-start gap-3 p-3 border rounded-lg group"
                      >
                        {isImage && isSafeUrl(attachment.fileUrl) ? (
                          <a
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            <img
                              src={attachment.fileUrl}
                              alt={attachment.fileName}
                              className="size-12 object-cover rounded border"
                            />
                          </a>
                        ) : (
                          <div className="size-12 flex items-center justify-center bg-muted rounded shrink-0">
                            <FileIcon className="size-6 text-muted-foreground" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          {isSafeUrl(attachment.fileUrl) ? (
                            <a
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium hover:underline truncate block"
                            >
                              {attachment.fileName}
                            </a>
                          ) : (
                            <span className="text-sm font-medium truncate block">
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

                        <div className="flex flex-col gap-1">
                          {attachment.links.length > 0 ? (
                            <>
                              {attachment.links.map((link, index) => (
                                <Button
                                  key={link.id}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() =>
                                    setUnlinkConfirm({
                                      linkId: link.id,
                                      fileName: attachment.fileName,
                                    })
                                  }
                                  disabled={unlinkMutation.isPending}
                                >
                                  {unlinkMutation.isPending &&
                                    unlinkConfirm?.linkId === link.id ? (
                                    <Spinner className="size-3 mr-1" />
                                  ) : (
                                    <LinkBreak className="size-3 mr-1" />
                                  )}
                                  Ta bort
                                  {attachment.links.length > 1 ? ` ${index + 1}` : ""}
                                </Button>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  setLinkingAttachment({
                                    id: attachment.id,
                                    fileName: attachment.fileName,
                                  })
                                }
                              >
                                <LinkIcon className="size-3 mr-1" />
                                Lägg till
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() =>
                                setLinkingAttachment({
                                  id: attachment.id,
                                  fileName: attachment.fileName,
                                })
                              }
                            >
                              <LinkIcon className="size-3 mr-1" />
                              Koppla
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

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

      <AlertDialog
        open={!!unlinkConfirm}
        onOpenChange={(open) => !open && setUnlinkConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort koppling?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort kopplingen för &quot;
              {unlinkConfirm?.fileName}&quot;? Detta påverkar inte själva filen
              eller transaktionen.
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
