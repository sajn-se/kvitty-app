"use client";

import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string | null;
    link: string | null;
    readAt: Date | null;
    createdAt: Date;
  };
  workspaceId: string;
  onClose?: () => void;
}

export function NotificationItem({
  notification,
  workspaceId,
  onClose,
}: NotificationItemProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getUnreadCount.invalidate({ workspaceId });
      utils.notifications.list.invalidate({ workspaceId });
    },
  });

  const handleClick = async () => {
    if (!notification.readAt) {
      await markAsReadMutation.mutateAsync({
        notificationId: notification.id,
      });
    }

    if (notification.link) {
      router.push(notification.link);
      onClose?.();
    }
  };

  const isUnread = !notification.readAt;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full px-4 py-3 text-left transition-colors hover:bg-accent",
        isUnread && "bg-blue-50 dark:bg-blue-950/20"
      )}
    >
      <div className="flex items-start gap-3">
        {isUnread && (
          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
        )}
        <div className="flex-1 space-y-1">
          <p className={cn("text-sm", isUnread && "font-semibold")}>
            {notification.title}
          </p>
          {notification.message && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {notification.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: sv,
            })}
          </p>
        </div>
      </div>
    </button>
  );
}
