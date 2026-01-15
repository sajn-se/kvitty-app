import { db } from "@/lib/db";
import { aiUsage } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

const AI_MONTHLY_QUOTA = 50;

export class AIRateLimitError extends Error {
  constructor(
    public remaining: number,
    public limit: number,
    public resetDate: Date
  ) {
    super("AI usage limit exceeded");
    this.name = "AIRateLimitError";
  }
}

function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthResetDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

/**
 * Check if user can make an AI request and increment counter if allowed.
 * Throws AIRateLimitError if limit exceeded.
 */
export async function checkAndIncrementAIUsage(userId: string) {
  const yearMonth = getCurrentYearMonth();
  const resetDate = getMonthResetDate();

  // Upsert: insert or increment atomically
  const result = await db
    .insert(aiUsage)
    .values({
      userId,
      yearMonth,
      requestCount: 1,
    })
    .onConflictDoUpdate({
      target: [aiUsage.userId, aiUsage.yearMonth],
      set: {
        requestCount: sql`${aiUsage.requestCount} + 1`,
        updatedAt: new Date(),
      },
    })
    .returning();

  const currentCount = result[0].requestCount;

  if (currentCount > AI_MONTHLY_QUOTA) {
    throw new AIRateLimitError(0, AI_MONTHLY_QUOTA, resetDate);
  }

  return {
    currentCount,
    limit: AI_MONTHLY_QUOTA,
    remaining: AI_MONTHLY_QUOTA - currentCount,
    resetDate,
  };
}

/**
 * Get current AI usage for a user without incrementing.
 * Useful for displaying usage info in UI.
 */
export async function getAIUsage(userId: string) {
  const yearMonth = getCurrentYearMonth();
  const resetDate = getMonthResetDate();

  const usage = await db.query.aiUsage.findFirst({
    where: and(eq(aiUsage.userId, userId), eq(aiUsage.yearMonth, yearMonth)),
  });

  const currentCount = usage?.requestCount ?? 0;
  return {
    currentCount,
    limit: AI_MONTHLY_QUOTA,
    remaining: Math.max(0, AI_MONTHLY_QUOTA - currentCount),
    resetDate,
  };
}
