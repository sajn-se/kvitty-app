"use server";

import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import {
  getStorageProvider,
  getStorageMode,
  supportsPresignedUrl,
} from "@/lib/storage";
import path from "path";

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".pdf",
  ".csv",
  ".xls",
  ".xlsx",
]);

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

interface GetUploadUrlInput {
  filename: string;
  contentType: string;
  workspaceSlug: string;
  fileSize?: number;
}

interface GetUploadUrlResult {
  /** Presigned URL for direct upload (null if not supported) */
  presignedUrl: string | null;
  /** The public URL where the file will be accessible */
  url: string;
  /** Storage key/path */
  key: string;
  /** Whether to use direct upload via presigned URL */
  usePresignedUrl: boolean;
  /** The storage mode being used */
  storageMode: string;
}

/**
 * Get upload URL information for a file
 * Returns presigned URL for S3, or indicates server upload needed for local/vercel-blob
 */
export async function getUploadUrl(
  input: GetUploadUrlInput
): Promise<GetUploadUrlResult> {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const { filename, contentType, workspaceSlug, fileSize } = input;

  // Validate required fields
  if (!filename || !contentType || !workspaceSlug) {
    throw new Error(
      "Missing required fields: filename, contentType, workspaceSlug"
    );
  }

  // Validate file extension
  const extension = getFileExtension(filename);
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error(
      `File type not allowed. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}`
    );
  }

  // Validate content type
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    throw new Error(
      `Content type not allowed. Allowed: ${Array.from(ALLOWED_MIME_TYPES).join(", ")}`
    );
  }

  // Validate file size (if provided)
  if (fileSize && fileSize > MAX_FILE_SIZE) {
    throw new Error(
      `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }

  // Verify workspace exists and user is a member
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, workspaceSlug),
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const membership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspace.id),
      eq(workspaceMembers.userId, session.user.id)
    ),
  });

  if (!membership) {
    throw new Error("Not a member of this workspace");
  }

  const provider = getStorageProvider();
  const result = await provider.getPresignedUrl(filename, contentType, workspaceSlug);

  return {
    presignedUrl: result.presignedUrl,
    url: result.url,
    key: result.key,
    usePresignedUrl: supportsPresignedUrl(),
    storageMode: getStorageMode(),
  };
}

// Legacy export for backwards compatibility
export const getPresignedUrl = getUploadUrl;
