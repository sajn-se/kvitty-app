import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

interface CreateNotificationParams {
  userId: string;
  workspaceId: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
}

export async function createNotification({
  userId,
  workspaceId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId,
      workspaceId,
      type,
      title,
      message,
      link,
    })
    .returning();

  return notification;
}
