import { router, workspaceProcedure } from "../init";
import { workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const membersRouter = router({
  list: workspaceProcedure.query(async ({ ctx }) => {
    const members = await ctx.db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.workspaceId, ctx.workspaceId),
      with: {
        user: true,
      },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      joinedAt: m.joinedAt,
    }));
  }),
});
