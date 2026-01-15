"use client";

import { useQueryState, parseAsInteger, parseAsStringLiteral } from "nuqs";
import { trpc } from "@/lib/trpc/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash, Eye } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/components/workspace-provider";

const DEFAULT_PAGE_SIZE = 20;

const filterOptions = ["all", "unread", "read"] as const;

export function NotificationsTable() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { workspace } = useWorkspace();
  const workspaceId = workspace.id;

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE)
  );
  const [filter, setFilter] = useQueryState(
    "filter",
    parseAsStringLiteral(filterOptions).withDefault("all")
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter as typeof filterOptions[number]);
    setPage(1);
  };

  const { data, isLoading } = trpc.notifications.list.useQuery({
    workspaceId,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    unreadOnly: filter === "unread",
  });

  const { data: unreadCount = 0 } = trpc.notifications.getUnreadCount.useQuery({
    workspaceId,
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate({ workspaceId });
      utils.notifications.getUnreadCount.invalidate({ workspaceId });
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate({ workspaceId });
      utils.notifications.getUnreadCount.invalidate({ workspaceId });
    },
  });

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsReadMutation.mutateAsync({ notificationId });
  };

  const handleDelete = async (notificationId: string) => {
    await deleteMutation.mutateAsync({ notificationId });
  };

  const handleRowClick = async (notification: typeof notifications[0]) => {
    if (!notification.readAt) {
      await markAsReadMutation.mutateAsync({
        notificationId: notification.id,
      });
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const notifications = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const filteredNotifications =
    filter === "read"
      ? notifications.filter((n) => n.readAt !== null)
      : notifications;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={handleFilterChange}>
          <TabsList variant="line">
            <TabsTrigger value="all">Alla</TabsTrigger>
            <TabsTrigger value="unread">
              Olästa
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Lästa</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Titel</TableHead>
              <TableHead>Meddelande</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Laddar...
                </TableCell>
              </TableRow>
            ) : filteredNotifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Inga notifikationer
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notification) => (
                <TableRow
                  key={notification.id}
                  className={cn(
                    "cursor-pointer",
                    !notification.readAt && "bg-blue-50 dark:bg-blue-950/20"
                  )}
                  onClick={() => handleRowClick(notification)}
                >
                  <TableCell>
                    {!notification.readAt && (
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {notification.title}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">
                    {notification.message}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: sv,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!notification.readAt && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        itemLabel="notifikationer"
      />
    </div>
  );
}
