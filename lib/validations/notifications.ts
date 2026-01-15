import { z } from "zod";

export const listNotificationsSchema = z.object({
  workspaceId: z.string(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  unreadOnly: z.boolean().default(false),
});

export const markAsReadSchema = z.object({
  notificationId: z.string(),
});

export const markAllAsReadSchema = z.object({
  workspaceId: z.string(),
});

export const deleteNotificationSchema = z.object({
  notificationId: z.string(),
});

export const getUnreadCountSchema = z.object({
  workspaceId: z.string(),
});
