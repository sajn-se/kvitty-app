import { router } from "./init";
import { workspacesRouter } from "./routers/workspaces";
import { periodsRouter } from "./routers/periods";
import { verificationsRouter } from "./routers/verifications";
import { attachmentsRouter } from "./routers/attachments";
import { commentsRouter } from "./routers/comments";
import { invitesRouter } from "./routers/invites";
import { membersRouter } from "./routers/members";
import { usersRouter } from "./routers/users";

export const appRouter = router({
  workspaces: workspacesRouter,
  periods: periodsRouter,
  verifications: verificationsRouter,
  attachments: attachmentsRouter,
  comments: commentsRouter,
  invites: invitesRouter,
  members: membersRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
