"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Clock, CheckCircle, XCircle, WarningCircle, Paperclip, Archive } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import type { InboxEmailStatus } from "@/lib/db/schema";

export type InboxEmail = {
  id: string;
  fromEmail: string;
  subject: string | null;
  emailBody: string | null;
  receivedAt: Date;
  status: InboxEmailStatus;
  rejectionReason: string | null;
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

const statusConfig: Record<
  InboxEmailStatus,
  { label: string; icon: React.ElementType; variant: "secondary" | "default" | "destructive" }
> = {
  pending: {
    label: "Väntande",
    icon: Clock,
    variant: "secondary",
  },
  processed: {
    label: "Behandlad",
    icon: CheckCircle,
    variant: "default",
  },
  rejected: {
    label: "Avvisad",
    icon: XCircle,
    variant: "destructive",
  },
  error: {
    label: "Fel",
    icon: WarningCircle,
    variant: "destructive",
  },
  archived: {
    label: "Arkiverad",
    icon: Archive,
    variant: "secondary",
  },
};

export const createColumns = (): ColumnDef<InboxEmail>[] => [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as InboxEmailStatus;
      const config = statusConfig[status];
      const StatusIcon = config.icon;
      return (
        <Badge variant={config.variant} className="gap-1">
          <StatusIcon className="size-3" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "subject",
    header: "Ämne",
    cell: ({ row }) => {
      const subject = row.getValue("subject") as string | null;
      return (
        <span className="font-medium truncate max-w-[250px] block">
          {subject || "(Inget ämne)"}
        </span>
      );
    },
  },
  {
    accessorKey: "fromEmail",
    header: "Från",
    cell: ({ row }) => (
      <span className="text-muted-foreground truncate max-w-[200px] block">
        {row.getValue("fromEmail")}
      </span>
    ),
  },
  {
    id: "attachments",
    header: "Bilagor",
    cell: ({ row }) => {
      const attachments = row.original.attachments;
      const count = attachments.length;
      const linkedCount = attachments.filter((a) => a.links.length > 0).length;

      if (count === 0) {
        return <span className="text-muted-foreground">—</span>;
      }

      return (
        <div className="flex items-center gap-1.5">
          <Paperclip className="size-4 text-muted-foreground" />
          <span>{count}</span>
          {linkedCount > 0 && (
            <span className="text-xs text-green-600">
              ({linkedCount} kopplad{linkedCount > 1 ? "e" : ""})
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "receivedAt",
    header: "Mottagen",
    cell: ({ row }) => {
      const date = row.getValue("receivedAt") as Date;
      return (
        <span className="text-muted-foreground text-sm">
          {formatDistanceToNow(new Date(date), {
            addSuffix: true,
            locale: sv,
          })}
        </span>
      );
    },
  },
];
