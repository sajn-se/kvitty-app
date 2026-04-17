"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import { Paperclip, ChatCircle, Trash, FilePdf, Image as ImageIcon, File, FileXls, FileCsv, Pencil, Download, Sparkle, Lightning, Envelope, LinkBreak } from "@phosphor-icons/react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc/client";
import { VERIFICATION_TEMPLATES } from "@/lib/consts/verification-templates";
import type { bankTransactions } from "@/lib/db/schema";
import { EditBankTransactionDialog } from "./edit-bank-transaction-dialog";
import { SearchInboxDialog } from "./search-inbox-dialog";
import { DocumentMatchSuggestions } from "./document-match-suggestions";
import { MentionTextarea } from "@/components/comments/mention-textarea";
import { CommentContent } from "@/components/comments/comment-content";
import { FeatureGate } from "@/components/feature-gate";
import { FLAGS } from "@/lib/feature-flags/types";

type BankTransaction = typeof bankTransactions.$inferSelect;

interface BankTransactionDetailSheetProps {
  transaction: BankTransaction | null;
  workspaceId: string;
  workspaceSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BankTransactionDetailSheet({
  transaction,
  workspaceId,
  workspaceSlug,
  open,
  onOpenChange,
}: BankTransactionDetailSheetProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { upload: fileUpload, isUploading } = useFileUpload();
  const [comment, setComment] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchInboxDialogOpen, setSearchInboxDialogOpen] = useState(false);

  const { data: details } = trpc.bankTransactions.get.useQuery(
    { workspaceId, bankTransactionId: transaction?.id ?? "" },
    { enabled: !!transaction }
  );

  // Evaluate categorization rules for this transaction
  const { data: ruleMatches } = trpc.categorizationRules.evaluate.useQuery(
    {
      workspaceId,
      description: transaction?.reference || "",
      amount: parseFloat(transaction?.amount || "0"),
    },
    { enabled: !!transaction && open }
  );

  const recordMatchMutation = trpc.categorizationRules.recordMatch.useMutation();

  const addComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      setComment("");
      utils.bankTransactions.get.invalidate({
        workspaceId,
        bankTransactionId: transaction?.id,
      });
      utils.bankTransactions.list.invalidate({ workspaceId });
    },
  });

  const deleteComment = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.bankTransactions.get.invalidate({
        workspaceId,
        bankTransactionId: transaction?.id,
      });
      utils.bankTransactions.list.invalidate({ workspaceId });
    },
  });

  const deleteAttachment = trpc.attachments.delete.useMutation({
    onSuccess: () => {
      utils.bankTransactions.get.invalidate({
        workspaceId,
        bankTransactionId: transaction?.id,
      });
      utils.bankTransactions.list.invalidate({ workspaceId });
    },
  });

  const unlinkInboxAttachment = trpc.inbox.unlinkAttachment.useMutation({
    onSuccess: () => {
      utils.bankTransactions.get.invalidate({
        workspaceId,
        bankTransactionId: transaction?.id,
      });
      utils.bankTransactions.list.invalidate({ workspaceId });
      utils.inbox.list.invalidate({ workspaceId });
      toast.success("Kopplingen har tagits bort");
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte ta bort kopplingen");
    },
  });

  const deleteTransaction = trpc.bankTransactions.delete.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      router.refresh();
    },
  });

  const handleAddComment = () => {
    if (!comment.trim() || addComment.isPending || !transaction) return;
    addComment.mutate({
      workspaceId,
      bankTransactionId: transaction.id,
      content: comment,
      mentions,
    });
  };

  if (!transaction) return null;

  const formatCurrency = (value: string | null) => {
    if (!value) return "—";
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
    }).format(parseFloat(value));
  };

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  async function uploadFiles(files: FileList | File[]) {
    if (!files.length || !transaction) return;

    const allFiles = Array.from(files);
    const validFiles = allFiles.filter(f => f.size <= MAX_FILE_SIZE);
    const tooLargeFiles = allFiles.filter(f => f.size > MAX_FILE_SIZE);

    if (tooLargeFiles.length > 0) {
      toast.error("Vissa filer är för stora", {
        description: `${tooLargeFiles.map(f => f.name).join(", ")} (max 25MB)`,
      });
    }

    if (!validFiles.length) return;

    try {
      const uploads = validFiles.map(async (file) => {
        const { url } = await fileUpload(file, { workspaceSlug });

        await utils.client.attachments.create.mutate({
          workspaceId,
          bankTransactionId: transaction.id,
          fileName: file.name,
          fileUrl: url,
          fileSize: file.size,
          mimeType: file.type,
        });
      });

      await Promise.all(uploads);

      utils.bankTransactions.get.invalidate({
        workspaceId,
        bankTransactionId: transaction.id,
      });
      utils.bankTransactions.list.invalidate({ workspaceId });

      toast.success(validFiles.length === 1 ? "Fil uppladdad" : `${validFiles.length} filer uppladdade`);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Uppladdning misslyckades", {
        description: error instanceof Error ? error.message : "Försök igen senare",
      });
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files?.length) uploadFiles(files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files?.length) uploadFiles(files);
  }

  function formatFileSize(bytes: number | null) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getFileIcon(mimeType: string | null, fileName: string) {
    if (mimeType?.startsWith("image/")) {
      return ImageIcon;
    }
    if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      return FilePdf;
    }
    if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      return FileXls;
    }
    if (mimeType === "text/csv" || fileName.endsWith(".csv")) {
      return FileCsv;
    }
    return File;
  }

  function isImageFile(mimeType: string | null) {
    return mimeType?.startsWith("image/") ?? false;
  }

  async function handleDownloadFile(fileUrl: string, fileName: string) {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const downloadBlob = new Blob([blob], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(downloadBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Nedladdning misslyckades");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:!w-[600px] data-[side=right]:sm:!max-w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle>{transaction.reference || "Banktransaktion"}</SheetTitle>
          <SheetDescription>
            {transaction.accountingDate || "Inget datum"}
          </SheetDescription>
          <div className="absolute top-3 right-12 flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setSearchInboxDialogOpen(true)}
                >
                  <Envelope className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sök i inbox</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Pencil className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redigera</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={deleteTransaction.isPending}
                >
                  {deleteTransaction.isPending ? (
                    <Spinner />
                  ) : (
                    <Trash className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ta bort</TooltipContent>
            </Tooltip>
          </div>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0 mt-6 px-4">
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-muted-foreground">Konto</p>
              <p className="font-medium">{transaction.accountNumber || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bokföringsdag</p>
              <p className="font-medium">{transaction.accountingDate || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reskontradag</p>
              <p className="font-medium">{transaction.ledgerDate || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Valutadag</p>
              <p className="font-medium">{transaction.currencyDate || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Belopp</p>
              <p className="font-medium">{formatCurrency(transaction.amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bokfört saldo</p>
              <p className="font-medium">
                {formatCurrency(transaction.bookedBalance)}
              </p>
            </div>
            {details?.createdByUser && (
              <div>
                <p className="text-muted-foreground">Skapad av</p>
                <p className="font-medium">
                  {details.createdByUser.name || details.createdByUser.email}
                </p>
              </div>
            )}
            {transaction.createdAt && (
              <div>
                <p className="text-muted-foreground">Skapad</p>
                <p className="font-medium">
                  {new Date(transaction.createdAt).toLocaleDateString("sv-SE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Rule Suggestions */}
          {ruleMatches && ruleMatches.length > 0 && (
            <div className="mb-6 p-4 bg-muted/50 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sparkle className="size-4 text-primary" />
                <h4 className="text-sm font-medium">Förslag baserat på regler</h4>
              </div>
              <div className="space-y-2">
                {ruleMatches.slice(0, 3).map((match) => {
                  const template = match.actionType === "suggest_template" || match.actionType === "auto_book"
                    ? VERIFICATION_TEMPLATES.find((t) => t.id === match.actionValue)
                    : null;

                  return (
                    <div
                      key={match.ruleId}
                      className="flex items-center justify-between gap-3 p-3 bg-background border rounded-md"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {template?.name || match.actionValue}
                          </span>
                          {match.actionType === "auto_book" && (
                            <Badge variant="secondary" className="shrink-0">
                              <Lightning className="size-3 mr-1" />
                              Auto
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          Regel: {match.ruleName}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          recordMatchMutation.mutate({ workspaceId, id: match.ruleId });
                          toast.success("Mall vald", {
                            description: `Använder mall: ${template?.name || match.actionValue}`,
                          });
                          // TODO: Navigate to booking with pre-selected template
                        }}
                      >
                        Använd
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Document Match Suggestions */}
          <FeatureGate flag={FLAGS.AI_DOCUMENT_EXTRACTION}>
            <DocumentMatchSuggestions
              workspaceId={workspaceId}
              bankTransactionId={transaction.id}
            />
          </FeatureGate>

          <Tabs defaultValue="attachments" className="flex flex-col flex-1 min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attachments" className="gap-2">
                <Paperclip className="size-4" />
                Bilagor ({(details?.attachments?.length || 0) + (details?.inboxAttachmentLinks?.length || 0)})
              </TabsTrigger>
              <TabsTrigger value="comments" className="gap-2">
                <ChatCircle className="size-4" />
                Kommentarer ({details?.comments?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attachments" className="space-y-4 mt-4 overflow-y-auto flex-1">
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isUploading ? (
                  <Spinner className="size-6 mb-2" />
                ) : (
                  <Paperclip className="size-6 mb-2 text-muted-foreground" />
                )}
                <p className="text-sm text-muted-foreground">
                  {isUploading ? "Laddar upp..." : "Dra och släpp eller klicka för att ladda upp"}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  PDF, bilder, Excel, CSV (max 25MB)
                </p>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileInputChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.csv,.xls,.xlsx"
                  multiple
                />
              </label>

              <div className="space-y-2">
                {/* Regular attachments */}
                {details?.attachments?.map((attachment) => {
                  const FileIcon = getFileIcon(attachment.mimeType, attachment.fileName);
                  const isImage = isImageFile(attachment.mimeType);

                  return (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 p-3 border rounded-lg group"
                    >
                      {isImage ? (
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
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(attachment.fileUrl, attachment.fileName)}
                          className="text-sm font-medium hover:underline truncate block text-left"
                        >
                          {attachment.fileName}
                        </button>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.fileSize)}
                        </p>
                        {attachment.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(attachment.createdAt).toLocaleDateString("sv-SE", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => handleDownloadFile(attachment.fileUrl, attachment.fileName)}
                          title="Ladda ner fil"
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            deleteAttachment.mutate({
                              workspaceId,
                              bankTransactionId: transaction.id,
                              attachmentId: attachment.id,
                            })
                          }
                        >
                          <Trash className="size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Linked inbox attachments */}
                {details?.inboxAttachmentLinks?.map((link) => {
                  const attachment = link.inboxAttachment;
                  const FileIcon = getFileIcon(attachment.mimeType, attachment.fileName);
                  const isImage = isImageFile(attachment.mimeType);

                  return (
                    <div
                      key={link.id}
                      className="flex items-center gap-3 p-3 border border-dashed rounded-lg group"
                    >
                      {isImage ? (
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
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(attachment.fileUrl, attachment.fileName)}
                          className="text-sm font-medium hover:underline truncate block text-left"
                        >
                          {attachment.fileName}
                        </button>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.fileSize)}
                        </p>
                        <p className="text-xs text-primary">
                          <Envelope className="size-3 inline mr-1" />
                          {attachment.inboxEmail?.subject || "Från inbox"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => handleDownloadFile(attachment.fileUrl, attachment.fileName)}
                          title="Ladda ner fil"
                        >
                          <Download className="size-4" />
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() =>
                                unlinkInboxAttachment.mutate({
                                  workspaceId,
                                  linkId: link.id,
                                })
                              }
                              disabled={unlinkInboxAttachment.isPending}
                            >
                              <LinkBreak className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ta bort koppling</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}

                {(!details?.attachments || details.attachments.length === 0) &&
                  (!details?.inboxAttachmentLinks || details.inboxAttachmentLinks.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Inga bilagor
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="relative flex flex-col mt-4 flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-[180px]">
                {details?.comments?.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {c.createdByUser?.name?.[0] ||
                          c.createdByUser?.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {c.createdByUser?.name || c.createdByUser?.email}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={() =>
                            deleteComment.mutate({
                              workspaceId,
                              bankTransactionId: transaction.id,
                              commentId: c.id,
                            })
                          }
                        >
                          <Trash className="size-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("sv-SE")}
                      </p>
                      <CommentContent content={c.content} className="text-sm mt-1" />
                    </div>
                  </div>
                ))}
                {(!details?.comments || details.comments.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Inga kommentarer
                  </p>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-4 border-t bg-background">
                <MentionTextarea
                  workspaceId={workspaceId}
                  placeholder="Skriv en kommentar..."
                  value={comment}
                  onChange={setComment}
                  onMentionsChange={setMentions}
                  onSubmit={handleAddComment}
                  className="min-h-[80px]"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">⌘+Enter för att skicka</span>
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!comment.trim() || addComment.isPending}
                  >
                    {addComment.isPending ? <Spinner /> : "Lägg till kommentar"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>

      <EditBankTransactionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        transaction={transaction}
        workspaceId={workspaceId}
      />

      <SearchInboxDialog
        open={searchInboxDialogOpen}
        onOpenChange={setSearchInboxDialogOpen}
        workspaceId={workspaceId}
        bankTransactionId={transaction.id}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort transaktion</AlertDialogTitle>
            <AlertDialogDescription>
              Vill du ta bort denna transaktion? Denna åtgärd kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                deleteTransaction.mutate({
                  workspaceId,
                  bankTransactionId: transaction.id,
                });
                setDeleteDialogOpen(false);
              }}
              disabled={deleteTransaction.isPending}
            >
              {deleteTransaction.isPending ? <Spinner /> : "Ta bort"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

