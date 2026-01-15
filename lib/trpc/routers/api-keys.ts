import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, workspaceProcedure, protectedProcedure } from "../init";
import { apiKeys, workspaceMembers, workspaces } from "@/lib/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { generateApiKey } from "@/lib/api/init";

export const apiKeysRouter = router({
  // List all API keys for the workspace (without revealing the actual keys)
  list: workspaceProcedure.query(async ({ ctx }) => {
    const keys = await ctx.db.query.apiKeys.findMany({
      where: and(
        eq(apiKeys.workspaceId, ctx.workspaceId),
        isNull(apiKeys.revokedAt)
      ),
      columns: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        createdAt: true,
        createdBy: true,
      },
      orderBy: (keys, { desc }) => [desc(keys.createdAt)],
    });

    return keys;
  }),

  // List all API keys created by the current user across all their workspaces
  listMyKeys: protectedProcedure.query(async ({ ctx }) => {
    // Get all workspaces the user is a member of
    const memberships = await ctx.db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.userId, ctx.session.user.id),
      columns: { workspaceId: true },
    });

    const workspaceIds = memberships.map((m) => m.workspaceId);

    if (workspaceIds.length === 0) {
      return [];
    }

    const keys = await ctx.db.query.apiKeys.findMany({
      where: and(
        eq(apiKeys.createdBy, ctx.session.user.id),
        inArray(apiKeys.workspaceId, workspaceIds),
        isNull(apiKeys.revokedAt)
      ),
      with: {
        workspace: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      columns: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        createdAt: true,
        workspaceId: true,
      },
      orderBy: (keys, { desc }) => [desc(keys.createdAt)],
    });

    return keys;
  }),

  // Get workspaces available for creating API keys
  getAvailableWorkspaces: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.userId, ctx.session.user.id),
      with: {
        workspace: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return memberships.map((m) => m.workspace);
  }),

  // Create a new API key
  create: workspaceProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const { key, prefix, hash } = generateApiKey();

      const [apiKey] = await ctx.db
        .insert(apiKeys)
        .values({
          workspaceId: ctx.workspaceId,
          name: input.name,
          keyHash: hash,
          keyPrefix: prefix,
          createdBy: ctx.session.user.id,
        })
        .returning();

      // Return the full key only once - it cannot be retrieved again
      return {
        id: apiKey.id,
        name: apiKey.name,
        key, // Full key - only shown once!
        keyPrefix: apiKey.keyPrefix,
        createdAt: apiKey.createdAt,
      };
    }),

  // Create API key from user settings (needs workspaceId in input)
  createForWorkspace: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      name: z.string().min(1).max(100)
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is a member of the workspace
      const membership = await ctx.db.query.workspaceMembers.findFirst({
        where: and(
          eq(workspaceMembers.userId, ctx.session.user.id),
          eq(workspaceMembers.workspaceId, input.workspaceId)
        ),
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Du har inte tillgång till denna arbetsyta"
        });
      }

      const { key, prefix, hash } = generateApiKey();

      const [apiKey] = await ctx.db
        .insert(apiKeys)
        .values({
          workspaceId: input.workspaceId,
          name: input.name,
          keyHash: hash,
          keyPrefix: prefix,
          createdBy: ctx.session.user.id,
        })
        .returning();

      // Get workspace info for the response
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, input.workspaceId),
        columns: { name: true, slug: true },
      });

      return {
        id: apiKey.id,
        name: apiKey.name,
        key, // Full key - only shown once!
        keyPrefix: apiKey.keyPrefix,
        createdAt: apiKey.createdAt,
        workspace,
      };
    }),

  // Revoke an API key
  revoke: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.apiKeys.findFirst({
        where: and(
          eq(apiKeys.id, input.id),
          eq(apiKeys.workspaceId, ctx.workspaceId),
          isNull(apiKeys.revokedAt)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .update(apiKeys)
        .set({ revokedAt: new Date() })
        .where(eq(apiKeys.id, input.id));

      return { success: true };
    }),

  // Revoke API key from user settings (by key ID, verifies ownership)
  revokeMyKey: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.apiKeys.findFirst({
        where: and(
          eq(apiKeys.id, input.id),
          eq(apiKeys.createdBy, ctx.session.user.id),
          isNull(apiKeys.revokedAt)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .update(apiKeys)
        .set({ revokedAt: new Date() })
        .where(eq(apiKeys.id, input.id));

      return { success: true };
    }),
});
