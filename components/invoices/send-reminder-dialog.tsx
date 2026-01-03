"use client";

import { useState } from "react";
import { Bell } from "@phosphor-icons/react";
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
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

interface SendReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  workspaceId: string;
  invoiceNumber: number;
  customerName: string;
  customerEmail?: string | null;
  total: string;
  dueDate: string;
}

export function SendReminderDialog({
  open,
  onOpenChange,
  invoiceId,
  workspaceId,
  invoiceNumber,
  customerName,
  customerEmail,
  total,
  dueDate,
}: SendReminderDialogProps) {
  const [email, setEmail] = useState(customerEmail || "");
  const [customMessage, setCustomMessage] = useState("");
  const utils = trpc.useUtils();

  const sendReminder = trpc.invoices.sendReminder.useMutation({
    onSuccess: () => {
      utils.invoices.get.invalidate({ workspaceId, id: invoiceId });
      utils.invoices.list.invalidate({ workspaceId });
      toast.success("Betalningspåminnelse har skickats");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte skicka påminnelsen");
    },
  });

  const handleSend = () => {
    if (!email.trim()) {
      toast.error("E-postadress krävs");
      return;
    }

    sendReminder.mutate({
      workspaceId,
      invoiceId,
      email: email.trim(),
      customMessage: customMessage.trim() || undefined,
    });
  };

  // Calculate days overdue
  const today = new Date();
  const dueDateObj = new Date(dueDate);
  const diffTime = today.getTime() - dueDateObj.getTime();
  const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formatCurrency = (value: string) => {
    return parseFloat(value).toLocaleString("sv-SE", {
      minimumFractionDigits: 2,
    }) + " kr";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sv-SE");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Skicka betalningspåminnelse</DialogTitle>
          <DialogDescription>
            Skicka en påminnelse till kunden om den förfallna fakturan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invoice details */}
          <div className="space-y-3 p-4 bg-muted rounded-md">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fakturanummer:</span>
              <span className="font-medium">#{invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kund:</span>
              <span className="font-medium">{customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Belopp:</span>
              <span className="font-medium">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Förfallodatum:</span>
              <span className="font-medium">{formatDate(dueDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dagar försenad:</span>
              <span className="font-medium text-red-600">{daysOverdue} dagar</span>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <Label htmlFor="reminder-email">E-postadress</Label>
            <Input
              id="reminder-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kund@example.com"
            />
          </div>

          {/* Custom message */}
          <div className="space-y-2">
            <Label htmlFor="custom-message">Eget meddelande (valfritt)</Label>
            <Textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Lägg till ett personligt meddelande till påminnelsen..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Meddelandet läggs till i påminnelsemailet tillsammans med fakturainformationen.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button onClick={handleSend} disabled={sendReminder.isPending || !email.trim()}>
            {sendReminder.isPending ? (
              <>
                <Spinner className="size-4 mr-2" />
                Skickar...
              </>
            ) : (
              <>
                <Bell className="size-4 mr-2" />
                Skicka påminnelse
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
