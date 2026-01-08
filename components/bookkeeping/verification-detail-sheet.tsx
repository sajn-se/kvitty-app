"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ListBullets,
  ClockCounterClockwise,
  ChatCircle,
  Trash,
  Pencil,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency } from "@/lib/utils";
import { EditJournalEntryDialog } from "@/components/journal-entry/edit-journal-entry-dialog";

type JournalEntry = {
  id: string;
  verificationNumber: number;
  entryDate: string;
  description: string;
  entryType: string;
  fiscalPeriodId: string;
  createdAt?: Date | string;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  lines: Array<{
    id: string;
    accountNumber: number;
    accountName: string;
    debit: string | null;
    credit: string | null;
    description: string | null;
  }>;
};

interface VerificationDetailSheetProps {
  entry: JournalEntry | null;
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerificationDetailSheet({
  entry,
  workspaceId,
  open,
  onOpenChange,
}: VerificationDetailSheetProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [comment, setComment] = useState("");

  const { data: details } = trpc.journalEntries.get.useQuery(
    { workspaceId, id: entry?.id ?? "" },
    { enabled: !!entry }
  );

  const { data: auditLogs } = trpc.journalEntries.getAuditLogs.useQuery(
    { workspaceId, entityId: entry?.id ?? "" },
    { enabled: !!entry }
  );

  const { data: entryComments } = trpc.comments.listForJournalEntry.useQuery(
    { workspaceId, journalEntryId: entry?.id ?? "" },
    { enabled: !!entry }
  );

  const addComment = trpc.comments.createForJournalEntry.useMutation({
    onSuccess: () => {
      setComment("");
      utils.comments.listForJournalEntry.invalidate({
        workspaceId,
        journalEntryId: entry?.id,
      });
    },
    onError: (err) => {
      toast.error("Kunde inte lägga till kommentar", {
        description: err.message,
      });
    },
  });

  const deleteComment = trpc.comments.deleteForJournalEntry.useMutation({
    onSuccess: () => {
      utils.comments.listForJournalEntry.invalidate({
        workspaceId,
        journalEntryId: entry?.id,
      });
    },
    onError: (err) => {
      toast.error("Kunde inte ta bort kommentar", {
        description: err.message,
      });
    },
  });

  const deleteEntry = trpc.journalEntries.delete.useMutation({
    onSuccess: () => {
      toast.success("Verifikation borttagen");
      onOpenChange(false);
      utils.journalEntries.list.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error("Kunde inte ta bort verifikation", {
        description: error.message,
      });
    },
  });

  if (!entry) return null;

  const entryLines = details?.lines || entry.lines;
  const isPeriodLocked = details?.fiscalPeriod?.isLocked ?? false;

  function getEntryTypeLabel(type: string): string {
    switch (type) {
      case "kvitto":
        return "Kvitto";
      case "inkomst":
        return "Inkomst";
      case "leverantorsfaktura":
        return "Leverantörsfaktura";
      case "lon":
        return "Lön";
      case "utlagg":
        return "Utlägg";
      case "opening_balance":
        return "Ingående balans";
      default:
        return "Annat";
    }
  }

  function getActionLabel(action: string): string {
    switch (action) {
      case "create":
        return "Skapades";
      case "update":
        return "Uppdaterades";
      case "delete":
        return "Raderades";
      default:
        return action;
    }
  }

  function formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const handleAddComment = () => {
    if (!comment.trim() || !entry) return;
    addComment.mutate({
      workspaceId,
      journalEntryId: entry.id,
      content: comment,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="data-[side=right]:!w-[600px] data-[side=right]:sm:!max-w-[600px] flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>V{entry.verificationNumber}</SheetTitle>
          <SheetDescription>{entry.entryDate}</SheetDescription>
          <div className="absolute top-3 right-12 flex gap-2">
            {!isPeriodLocked && (
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setEditDialogOpen(true)}
              >
                <Pencil className="size-4" />
              </Button>
            )}
            <Button
              variant="destructive"
              size="icon-sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteEntry.isPending || isPeriodLocked}
            >
              {deleteEntry.isPending ? (
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
              <p className="text-muted-foreground">Beskrivning</p>
              <p className="font-medium">{entry.description || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Typ</p>
              <Badge variant="secondary">
                {getEntryTypeLabel(entry.entryType)}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Skapad av</p>
              <p className="font-medium">
                {entry.createdByUser?.name ||
                  entry.createdByUser?.email ||
                  details?.createdByUser?.name ||
                  details?.createdByUser?.email ||
                  "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Skapad</p>
              <p className="font-medium">
                {entry.createdAt || details?.createdAt
                  ? formatDateTime(
                      (entry.createdAt || details?.createdAt) as Date | string
                    )
                  : "—"}
              </p>
            </div>
            {isPeriodLocked && (
              <div className="col-span-2">
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                  Perioden är låst
                </Badge>
              </div>
            )}
          </div>

          <Tabs defaultValue="lines" className="flex flex-col flex-1 min-h-0">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lines" className="gap-2">
                <ListBullets className="size-4" />
                Konteringar ({entryLines.length})
              </TabsTrigger>
              <TabsTrigger value="comments" className="gap-2">
                <ChatCircle className="size-4" />
                Kommentarer ({entryComments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <ClockCounterClockwise className="size-4" />
                Historik ({auditLogs?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="lines"
              className="space-y-4 mt-4 overflow-y-auto flex-1"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Konto</TableHead>
                    <TableHead>Kontonamn</TableHead>
                    <TableHead className="text-right w-[100px]">
                      Debet
                    </TableHead>
                    <TableHead className="text-right w-[100px]">
                      Kredit
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entryLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="font-mono">
                        {line.accountNumber}
                      </TableCell>
                      <TableCell>{line.accountName}</TableCell>
                      <TableCell className="text-right font-mono">
                        {line.debit
                          ? formatCurrency(parseFloat(line.debit))
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {line.credit
                          ? formatCurrency(parseFloat(line.credit))
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end gap-8 pt-2 border-t text-sm">
                <div>
                  <span className="text-muted-foreground mr-2">
                    Summa debet:
                  </span>
                  <span className="font-mono font-medium">
                    {formatCurrency(
                      entryLines.reduce(
                        (sum, l) => sum + parseFloat(l.debit || "0"),
                        0
                      )
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground mr-2">
                    Summa kredit:
                  </span>
                  <span className="font-mono font-medium">
                    {formatCurrency(
                      entryLines.reduce(
                        (sum, l) => sum + parseFloat(l.credit || "0"),
                        0
                      )
                    )}
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="comments"
              className="relative flex flex-col mt-4 flex-1 min-h-0"
            >
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-[140px]">
                {entryComments && entryComments.length > 0 ? (
                  entryComments.map((c) => (
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
                                journalEntryId: entry.id,
                                commentId: c.id,
                              })
                            }
                          >
                            <Trash className="size-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString("sv-SE")}
                        </p>
                        <p className="text-sm mt-1">{c.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
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
                    onClick={handleAddComment}
                    disabled={!comment.trim() || addComment.isPending}
                  >
                    {addComment.isPending ? <Spinner /> : "Lägg till kommentar"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="history"
              className="space-y-4 mt-4 overflow-y-auto flex-1"
            >
              {auditLogs && auditLogs.length > 0 ? (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <ClockCounterClockwise className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {getActionLabel(log.action)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.user?.name ||
                            log.user?.email ||
                            "Okänd användare"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ingen historik
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>

      {details && (
        <EditJournalEntryDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          entry={{
            ...entry,
            fiscalPeriodId: details.fiscalPeriodId,
            lines: details.lines.map((l) => ({
              id: l.id,
              accountNumber: l.accountNumber,
              accountName: l.accountName,
              debit: l.debit,
              credit: l.credit,
              description: l.description,
            })),
          }}
          workspaceId={workspaceId}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort verifikation</AlertDialogTitle>
            <AlertDialogDescription>
              Vill du ta bort verifikation V{entry.verificationNumber}? Denna
              åtgärd kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                deleteEntry.mutate({
                  workspaceId,
                  id: entry.id,
                });
                setDeleteDialogOpen(false);
              }}
              disabled={deleteEntry.isPending}
            >
              {deleteEntry.isPending ? <Spinner /> : "Ta bort"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
