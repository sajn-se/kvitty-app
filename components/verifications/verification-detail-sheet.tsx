"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, ChatCircle, Trash, Upload } from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import type { verifications } from "@/lib/db/schema";

type Verification = typeof verifications.$inferSelect;

interface VerificationDetailSheetProps {
  verification: Verification | null;
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerificationDetailSheet({
  verification,
  workspaceId,
  open,
  onOpenChange,
}: VerificationDetailSheetProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [comment, setComment] = useState("");

  const { data: details } = trpc.verifications.get.useQuery(
    { workspaceId, verificationId: verification?.id ?? "" },
    { enabled: !!verification }
  );

  const addComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      setComment("");
      utils.verifications.get.invalidate({
        workspaceId,
        verificationId: verification?.id,
      });
    },
  });

  const deleteComment = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.verifications.get.invalidate({
        workspaceId,
        verificationId: verification?.id,
      });
    },
  });

  const deleteAttachment = trpc.attachments.delete.useMutation({
    onSuccess: () => {
      utils.verifications.get.invalidate({
        workspaceId,
        verificationId: verification?.id,
      });
    },
  });

  const deleteVerification = trpc.verifications.delete.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      router.refresh();
    },
  });

  if (!verification) return null;

  const formatCurrency = (value: string | null) => {
    if (!value) return "—";
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
    }).format(parseFloat(value));
  };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !verification) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `/api/upload?filename=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          body: file,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();

      // Add attachment record via tRPC
      await utils.client.attachments.create.mutate({
        workspaceId,
        verificationId: verification.id,
        fileName: file.name,
        fileUrl: url,
        fileSize: file.size,
        mimeType: file.type,
      });

      utils.verifications.get.invalidate({
        workspaceId,
        verificationId: verification.id,
      });
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>{verification.reference || "Verifikation"}</SheetTitle>
          <SheetDescription>
            {verification.accountingDate || "Inget datum"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Kontor</p>
              <p className="font-medium">{verification.office || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bokföringsdag</p>
              <p className="font-medium">{verification.accountingDate || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reskontradag</p>
              <p className="font-medium">{verification.ledgerDate || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Valutadag</p>
              <p className="font-medium">{verification.currencyDate || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Belopp</p>
              <p className="font-medium">{formatCurrency(verification.amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bokfört saldo</p>
              <p className="font-medium">
                {formatCurrency(verification.bookedBalance)}
              </p>
            </div>
          </div>

          <Tabs defaultValue="attachments">
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

            <TabsContent value="attachments" className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="size-4 mr-2" />
                      Ladda upp fil
                    </span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="space-y-2">
                {details?.attachments?.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <a
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline truncate flex-1"
                    >
                      {attachment.fileName}
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() =>
                        deleteAttachment.mutate({
                          workspaceId,
                          verificationId: verification.id,
                          attachmentId: attachment.id,
                        })
                      }
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                ))}
                {(!details?.attachments || details.attachments.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Inga bilagor
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Skriv en kommentar..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <Button
                size="sm"
                onClick={() =>
                  addComment.mutate({
                    workspaceId,
                    verificationId: verification.id,
                    content: comment,
                  })
                }
                disabled={!comment.trim() || addComment.isPending}
              >
                {addComment.isPending ? <Spinner /> : "Lägg till kommentar"}
              </Button>

              <div className="space-y-4 pt-4">
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
                              verificationId: verification.id,
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
            </TabsContent>
          </Tabs>

          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                deleteVerification.mutate({
                  workspaceId,
                  verificationId: verification.id,
                })
              }
              disabled={deleteVerification.isPending}
            >
              {deleteVerification.isPending ? (
                <Spinner />
              ) : (
                <>
                  <Trash className="size-4 mr-2" />
                  Ta bort verifikation
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
