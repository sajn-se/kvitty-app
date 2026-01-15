import { os, ORPCError } from "@orpc/server";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { createHash } from "crypto";

// Context passed through all procedures
export type ApiContext = {
  db: typeof db;
  workspaceId?: string;
  apiKeyId?: string;
};

// Authenticated context (after middleware validates API key)
export type AuthenticatedContext = ApiContext & {
  workspaceId: string;
  apiKeyId: string;
};

// Hash an API key for comparison
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

// Generate a new API key
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const key = `kv_${Buffer.from(randomBytes).toString("base64url")}`;
  const prefix = key.slice(0, 12);
  const hash = hashApiKey(key);
  return { key, prefix, hash };
}

// Base procedure builder
const baseProcedure = os.$context<ApiContext>();

// Authenticated procedure - requires valid API key
export const authenticatedProcedure = baseProcedure.use(
  async ({ context, next }) => {
    if (!context.workspaceId || !context.apiKeyId) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "API key required. Include Authorization: Bearer kv_xxx header.",
      });
    }

    return next({
      context: {
        ...context,
        workspaceId: context.workspaceId,
        apiKeyId: context.apiKeyId,
      } as AuthenticatedContext,
    });
  }
);

// Validate API key from Authorization header and return context
export async function validateApiKey(
  authHeader: string | null
): Promise<{ workspaceId: string; apiKeyId: string } | null> {
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(kv_\S+)$/i);
  if (!match) return null;

  const key = match[1];
  const keyHash = hashApiKey(key);

  const apiKey = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)),
  });

  if (!apiKey) return null;

  // Update last used timestamp (fire and forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id))
    .catch(() => {});

  return {
    workspaceId: apiKey.workspaceId,
    apiKeyId: apiKey.id,
  };
}
