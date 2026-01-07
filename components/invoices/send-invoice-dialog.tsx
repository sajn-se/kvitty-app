"use client";

import { useState, useEffect } from "react";
import { PaperPlaneTilt, Link as LinkIcon, FilePdf, Copy, Check, Plus, X } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import type { CustomerContact } from "@/lib/db/schema";

interface SendInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  workspaceId: string;
  customerEmail?: string | null;
  customerContacts?: CustomerContact[];
  invoiceNumber: number;
  shareToken?: string | null;
  sentMethod?: string | null;
  openedCount?: number;
  lastOpenedAt?: Date | null;
}

export function SendInvoiceDialog({
  open,
  onOpenChange,
  invoiceId,
  workspaceId,
  customerEmail,
  customerContacts = [],
  invoiceNumber,
  shareToken,
  sentMethod,
  openedCount,
  lastOpenedAt,
}: SendInvoiceDialogProps) {
  const [sendMethod, setSendMethod] = useState<"pdf" | "link">("pdf");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [customEmails, setCustomEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const utils = trpc.useUtils();

  // Contacts that have email addresses
  const contactsWithEmail = customerContacts.filter((c) => c.email);

  // Pre-select primary contact on open
  useEffect(() => {
    if (open) {
      const primaryContact = contactsWithEmail.find((c) => c.isPrimary);
      if (primaryContact) {
        setSelectedContactIds([primaryContact.id]);
      } else if (contactsWithEmail.length > 0) {
        setSelectedContactIds([contactsWithEmail[0].id]);
      } else if (customerEmail) {
        // Fallback to customer company email if no contacts
        setCustomEmails([customerEmail]);
      }
    }
  }, [open, customerContacts, customerEmail]);

  const sendInvoice = trpc.invoices.sendInvoice.useMutation({
    onSuccess: () => {
      utils.invoices.get.invalidate({ workspaceId, id: invoiceId });
      toast.success("Fakturan har skickats");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte skicka fakturan");
    },
  });

  const getAllSelectedEmails = (): string[] => {
    const contactEmails = contactsWithEmail
      .filter((c) => selectedContactIds.includes(c.id))
      .map((c) => c.email!)
      .filter(Boolean);
    return [...contactEmails, ...customEmails];
  };

  const handleSend = () => {
    const emails = getAllSelectedEmails();
    if (emails.length === 0) {
      toast.error("Välj minst en mottagare");
      return;
    }

    sendInvoice.mutate({
      id: invoiceId,
      workspaceId,
      emails,
      sendMethod,
    });
  };

  const handleContactToggle = (contactId: string, checked: boolean) => {
    setSelectedContactIds((prev) =>
      checked ? [...prev, contactId] : prev.filter((id) => id !== contactId)
    );
  };

  const handleAddCustomEmail = () => {
    const email = newEmail.trim();
    if (!email) return;

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Ogiltig e-postadress");
      return;
    }

    if (customEmails.includes(email)) {
      toast.error("E-postadressen finns redan");
      return;
    }

    setCustomEmails((prev) => [...prev, email]);
    setNewEmail("");
  };

  const handleRemoveCustomEmail = (email: string) => {
    setCustomEmails((prev) => prev.filter((e) => e !== email));
  };

  const invoiceUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/faktura/${invoiceId}?token=${shareToken}`
    : null;

  const handleCopyLink = () => {
    if (invoiceUrl) {
      navigator.clipboard.writeText(invoiceUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast.success("Länk kopierad");
    }
  };

  const selectedCount = getAllSelectedEmails().length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Skicka faktura #{invoiceNumber}</DialogTitle>
          <DialogDescription>
            Välj mottagare och hur du vill skicka fakturan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Recipients Section */}
          <div className="space-y-3">
            <Label>Mottagare</Label>

            {/* Contact checkboxes */}
            {contactsWithEmail.length > 0 && (
              <div className="space-y-2 border rounded-md p-3">
                {contactsWithEmail.map((contact) => (
                  <label
                    key={contact.id}
                    className="flex items-start gap-3 cursor-pointer py-1"
                  >
                    <Checkbox
                      checked={selectedContactIds.includes(contact.id)}
                      onCheckedChange={(checked) =>
                        handleContactToggle(contact.id, !!checked)
                      }
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{contact.name}</span>
                        {contact.role && (
                          <span className="text-muted-foreground text-xs">
                            ({contact.role})
                          </span>
                        )}
                        {contact.isPrimary && (
                          <Badge variant="secondary" className="text-xs">
                            Primär
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground truncate block">
                        {contact.email}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* No contacts message */}
            {contactsWithEmail.length === 0 && !customerEmail && (
              <p className="text-sm text-muted-foreground py-2">
                Inga kontakter med e-post finns. Lägg till en e-postadress nedan.
              </p>
            )}

            {/* Company email fallback */}
            {contactsWithEmail.length === 0 && customerEmail && (
              <div className="border rounded-md p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={customEmails.includes(customerEmail)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCustomEmails((prev) => [...prev, customerEmail]);
                      } else {
                        setCustomEmails((prev) => prev.filter((e) => e !== customerEmail));
                      }
                    }}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-sm">Företagets e-post</span>
                    <span className="text-sm text-muted-foreground block">
                      {customerEmail}
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Custom emails */}
            {customEmails.filter((e) => e !== customerEmail).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customEmails
                  .filter((e) => e !== customerEmail)
                  .map((email) => (
                    <Badge
                      key={email}
                      variant="outline"
                      className="gap-1 pr-1"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomEmail(email)}
                        className="ml-1 hover:bg-muted rounded p-0.5"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
              </div>
            )}

            {/* Add custom email */}
            <div className="flex gap-2">
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Annan e-postadress..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomEmail();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddCustomEmail}
                disabled={!newEmail.trim()}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {/* Send Method Section */}
          <div className="space-y-3">
            <Label>Skicka som</Label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSendMethod("pdf")}
                className={`w-full text-left p-3 border rounded-md transition-colors ${
                  sendMethod === "pdf"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`size-4 rounded-full border-2 flex items-center justify-center ${
                      sendMethod === "pdf"
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {sendMethod === "pdf" && (
                      <div className="size-2 rounded-full bg-white" />
                    )}
                  </div>
                  <FilePdf className="size-4" />
                  <div>
                    <div className="font-medium">PDF-bilaga</div>
                    <div className="text-sm text-muted-foreground">
                      Skicka fakturan som PDF-bilaga i e-post
                    </div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSendMethod("link")}
                className={`w-full text-left p-3 border rounded-md transition-colors ${
                  sendMethod === "link"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`size-4 rounded-full border-2 flex items-center justify-center ${
                      sendMethod === "link"
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {sendMethod === "link" && (
                      <div className="size-2 rounded-full bg-white" />
                    )}
                  </div>
                  <LinkIcon className="size-4" />
                  <div>
                    <div className="font-medium">Länk</div>
                    <div className="text-sm text-muted-foreground">
                      Skicka en länk till fakturan (spåras när den öppnas)
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {sentMethod === "email_link" && shareToken && (
            <div className="space-y-2 p-4 bg-muted rounded-md">
              <Label className="text-sm font-medium">Delningslänk</Label>
              <div className="flex gap-2">
                <Input value={invoiceUrl || ""} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  title="Kopiera länk"
                >
                  {linkCopied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {sentMethod === "email_link" && (
            <div className="space-y-2 p-4 bg-muted rounded-md">
              <Label className="text-sm font-medium">Öppningsstatistik</Label>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Antal öppningar:</span>
                  <span className="font-medium">{openedCount || 0}</span>
                </div>
                {lastOpenedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Senast öppnad:</span>
                    <span className="font-medium">
                      {new Date(lastOpenedAt).toLocaleString("sv-SE")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button
            onClick={handleSend}
            disabled={sendInvoice.isPending || selectedCount === 0}
          >
            {sendInvoice.isPending ? (
              <>
                <Spinner className="size-4 mr-2" />
                Skickar...
              </>
            ) : (
              <>
                <PaperPlaneTilt className="size-4 mr-2" />
                Skicka{selectedCount > 1 ? ` till ${selectedCount}` : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
