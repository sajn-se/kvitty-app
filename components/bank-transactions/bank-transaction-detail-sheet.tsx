"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useS3Upload } from "@/lib/hooks/use-s3-upload";
import { Paperclip, ChatCircle, Trash, FilePdf, Image as ImageIcon, File, FileXls, FileCsv, Pencil } from "@phosphor-icons/react";
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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import type { bankTransactions } from "@/lib/db/schema";
import { EditBankTransactionDialog } from "./edit-bank-transaction-dialog";

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
  const { upload: s3Upload, isUploading } = useS3Upload();
  const [comment, setComment] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: details } = trpc.bankTransactions.get.useQuery(
    { workspaceId, bankTransactionId: transaction?.id ?? "" },
    { enabled: !!transaction }
  );

  const addComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      setComment("");
      utils.bankTransactions.get.invalidate({
        workspaceId,
        bankTransactionId: transaction?.id,
      });
    },
  });

  const deleteComment = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.bankTransactions.get.invalidate({
        workspaceId,
        bankTransactionId: transaction?.id,
      });
    },
  });

  const deleteAttachment = trpc.attachments.delete.useMutation({
    onSuccess: () => {
      utils.bankTransactions.get.invalidate({
        workspaceId,
        bankTransactionId: transaction?.id,
      });
    },
  });

  const deleteTransaction = trpc.bankTransactions.delete.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      router.refresh();
    },
  });

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
        const { cloudFrontUrl } = await s3Upload(file, { workspaceSlug });

        await utils.client.attachments.create.mutate({
          workspaceId,
          bankTransactionId: transaction.id,
          fileName: file.name,
          fileUrl: cloudFrontUrl,
          fileSize: file.size,
          mimeType: file.type,
        });
      });

      await Promise.all(uploads);

      utils.bankTransactions.get.invalidate({
        workspaceId,
        bankTransactionId: transaction.id,
      });

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:!w-[600px] data-[side=right]:sm:!max-w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle>{transaction.reference || "Banktransaktion"}</SheetTitle>
          <SheetDescription>
            {transaction.accountingDate || "Inget datum"}
          </SheetDescription>
          <div className="absolute top-3 right-12 flex gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setEditDialogOpen(true)}
            >
              <Pencil className="size-4" />
            </Button>
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

          <Tabs defaultValue="attachments" className="flex flex-col flex-1 min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attachments" className="gap-2">
                <Paperclip className="size-4" />
                Bilagor ({details?.attachments?.length || 0})
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
                        <a
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:underline truncate block"
                        >
                          {attachment.fileName}
                        </a>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.fileSize)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  );
                })}
                {(!details?.attachments || details.attachments.length === 0) && (
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
                      <p className="text-sm mt-1">{c.content}</p>
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
                <Textarea
                  placeholder="Skriv en kommentar..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      addComment.mutate({
                        workspaceId,
                        bankTransactionId: transaction.id,
                        content: comment,
                      })
                    }
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

