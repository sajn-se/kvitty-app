import { streamText } from "ai";
import { z } from "zod";
import { bookkeepingModel } from "@/lib/ai";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/ai/assistant-prompt";
import { createChatTools } from "@/lib/ai/chat-tools";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspaceMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  checkAndIncrementAIUsage,
  AIRateLimitError,
} from "@/lib/ai/rate-limiter";

export const maxDuration = 30;

const requestSchema = z.object({
  messages: z.array(z.any()),
  workspaceId: z.string(),
  fiscalPeriodId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages, workspaceId, fiscalPeriodId } = requestSchema.parse(body);

    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    if (!membership) {
      return new Response("Forbidden", { status: 403 });
    }

    // Check AI usage limit
    try {
      await checkAndIncrementAIUsage(session.user.id);
    } catch (error) {
      if (error instanceof AIRateLimitError) {
        return Response.json(
          {
            error: "AI usage limit exceeded",
            message:
              "Du har nått din månatliga gräns för AI-förfrågningar (50 st). Gränsen återställs den 1:a nästa månad.",
            limit: error.limit,
            remaining: error.remaining,
          },
          { status: 429 }
        );
      }
      throw error;
    }

    const tools = createChatTools(workspaceId, fiscalPeriodId);

    const result = streamText({
      model: bookkeepingModel,
      system: ASSISTANT_SYSTEM_PROMPT,
      messages,
      tools,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Assistant API error:", error);
    if (error instanceof z.ZodError) {
      return new Response("Invalid request body", { status: 400 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
