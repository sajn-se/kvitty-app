import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { uploadFile } from "@/lib/storage";
import {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
} from "@/lib/actions/upload";
import path from "path";

function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const workspaceSlug = formData.get("workspaceSlug") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!workspaceSlug) {
      return NextResponse.json(
        { error: "No workspaceSlug provided" },
        { status: 400 }
      );
    }

    // Validate file extension
    const extension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        {
          error: `File type not allowed. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate content type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Content type not allowed. Allowed: ${Array.from(ALLOWED_MIME_TYPES).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    // Verify workspace exists and user is a member
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.slug, workspaceSlug),
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspace.id),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this workspace" },
        { status: 403 }
      );
    }

    // Upload file
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile(buffer, file.name, file.type, workspaceSlug);

    return NextResponse.json({
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
