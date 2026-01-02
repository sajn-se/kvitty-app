import { z } from "zod";
import { eq } from "drizzle-orm";
import { router, protectedProcedure } from "../init";
import { user } from "@/lib/db/schema";

export const usersRouter = router({
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Namn krävs").max(100, "Namn får max vara 100 tecken"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(user)
        .set({
          name: input.name,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.session.user.id))
        .returning();

      return updated;
    }),
});
