import { router, protectedProcedure } from "../init";
import { notifications } from "@/lib/db/schema";
import { and, eq, isNull, count, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  listNotificationsSchema,
  markAsReadSchema,
  markAllAsReadSchema,
  deleteNotificationSchema,
  getUnreadCountSchema,
} from "@/lib/validations/notifications";

export const notificationsRouter = router({
  list: protectedProcedure
    .input(listNotificationsSchema)
    .query(async ({ ctx, input }) => {
      const whereClause = and(
        eq(notifications.userId, ctx.session.user.id),
        eq(notifications.workspaceId, input.workspaceId),
        input.unreadOnly ? isNull(notifications.readAt) : undefined
      );

      const [items, totalResult] = await Promise.all([
        ctx.db.query.notifications.findMany({
          where: whereClause,
          orderBy: [desc(notifications.createdAt)],
          limit: input.limit,
          offset: input.offset,
        }),
        ctx.db.select({ count: count() }).from(notifications).where(whereClause),
      ]);

      return {
        items,
        total: totalResult[0]?.count ?? 0,
      };
    }),

  getUnreadCount: protectedProcedure
    .input(getUnreadCountSchema)
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({ count: count() })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, ctx.session.user.id),
            eq(notifications.workspaceId, input.workspaceId),
            isNull(notifications.readAt)
          )
        );

      return result[0]?.count ?? 0;
    }),

  markAsRead: protectedProcedure
    .input(markAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.query.notifications.findFirst({
        where: and(
          eq(notifications.id, input.notificationId),
          eq(notifications.userId, ctx.session.user.id)
        ),
      });

      if (!notification) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [updated] = await ctx.db
        .update(notifications)
        .set({
          readAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(notifications.id, input.notificationId))
        .returning();

      return updated;
    }),

  markAllAsRead: protectedProcedure
    .input(markAllAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notifications)
        .set({
          readAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(notifications.userId, ctx.session.user.id),
            eq(notifications.workspaceId, input.workspaceId),
            isNull(notifications.readAt)
          )
        );

      return { success: true };
    }),

  delete: protectedProcedure
    .input(deleteNotificationSchema)
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.query.notifications.findFirst({
        where: and(
          eq(notifications.id, input.notificationId),
          eq(notifications.userId, ctx.session.user.id)
        ),
      });

      if (!notification) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .delete(notifications)
        .where(eq(notifications.id, input.notificationId));

      return { success: true };
    }),
});
