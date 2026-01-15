import { generateObject } from "ai";
import { z } from "zod";
import { bookkeepingModel } from "@/lib/ai";
import { BOOKKEEPING_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getSession } from "@/lib/session";
import {
  checkAndIncrementAIUsage,
  AIRateLimitError,
} from "@/lib/ai/rate-limiter";

// Response schema - always get message + optional suggestion
const responseSchema = z.object({
  message: z.string().describe("Ditt svar till användaren på svenska"),
  suggestion: z.object({
    description: z.string().describe("Kort beskrivning av verifikationen"),
    lines: z.array(
      z.object({
        accountNumber: z.number().describe("Kontonummer från BAS-kontoplanen"),
        accountName: z.string().describe("Kontonamn"),
        debit: z.number().describe("Debetbelopp i kr, 0 om inget"),
        credit: z.number().describe("Kreditbelopp i kr, 0 om inget"),
      })
    ).describe("Bokföringsrader som balanserar"),
  }).nullable().optional().describe("Bokföringsförslag om användaren beskriver en transaktion"),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
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

    const { messages, context } = await req.json();

    let systemPrompt = BOOKKEEPING_SYSTEM_PROMPT;
    if (context?.entryType) {
      systemPrompt += `\n\nKontext: Verifikationstyp: ${context.entryType}`;
    }
    if (context?.description) {
      systemPrompt += `\nBeskrivning: ${context.description}`;
    }

    const { object } = await generateObject({
      model: bookkeepingModel,
      schema: responseSchema,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    return Response.json(object);
  } catch (error) {
    console.error("Chat API error:", error);

    // Handle JSON validation failures from Groq
    if (
      error instanceof Error &&
      error.message.includes("Failed to generate JSON")
    ) {
      // Extract the failed generation from the error if available
      const apiError = error as Error & {
        data?: { error?: { failed_generation?: string } };
      };
      const failedGeneration = apiError.data?.error?.failed_generation;

      // Return the failed generation as a message if available
      if (failedGeneration) {
        return Response.json({
          message: failedGeneration,
          suggestion: null,
        });
      }

      return Response.json({
        message:
          "Jag kunde inte bearbeta din förfrågan just nu. Försök igen med en mer specifik fråga.",
        suggestion: null,
      });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
