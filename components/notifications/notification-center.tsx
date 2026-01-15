"use client";

import { useState } from "react";
import { Bell } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc/client";
import { NotificationItem } from "./notification-item";
import { useWorkspace } from "@/components/workspace-provider";
import Link from "next/link";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("unread");

  const utils = trpc.useUtils();
  const { workspace } = useWorkspace();
  const workspaceId = workspace.id;
  const workspaceSlug = workspace.slug;

  const { data: unreadCount = 0 } = trpc.notifications.getUnreadCount.useQuery(
    { workspaceId },
    {
      refetchInterval: 10000, // 10 seconds
      refetchOnWindowFocus: true,
    }
  );

  const { data, isLoading } = trpc.notifications.list.useQuery(
    {
      workspaceId,
      limit: 10,
      offset: 0,
      unreadOnly: tab === "unread",
    },
    {
      enabled: open,
      refetchOnWindowFocus: true,
    }
  );

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getUnreadCount.invalidate({ workspaceId });
      utils.notifications.list.invalidate({ workspaceId });
    },
  });

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync({ workspaceId });
  };

  const notifications = data?.items ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -right-1 -top-0.5 h-5 min-w-5 px-1 text-xs text-destructive font-semibold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="text-lg font-semibold">Notifikationer</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              Markera alla som lästa
            </Button>
          )}
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "unread")}>
          <div className="px-4 pb-2">
            <TabsList variant="line" className="w-full">
              <TabsTrigger value="all" className="flex-1">
                Alla
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Olästa
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <Separator />

          <TabsContent value={tab} className="m-0">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Laddar...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {tab === "unread"
                    ? "Inga olästa notifikationer"
                    : "Inga notifikationer"}
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      workspaceId={workspaceId}
                      onClose={() => setOpen(false)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="p-2">
          <Link href={`/${workspaceSlug}/notifikationer`}>
            <Button variant="ghost" className="w-full" size="sm">
              Visa alla notifikationer
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
