"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { createCuid } from "@/lib/utils/cuid";
import { s3Client, CACHE_CONTROL } from "@/lib/utils/s3";
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

export function sanitizeFilename(filename: string): string {
  const basename = path.basename(filename);
  return basename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

interface GetPresignedUrlInput {
  filename: string;
  contentType: string;
  workspaceSlug: string;
  fileSize?: number;
}

interface GetPresignedUrlResult {
  presignedUrl: string;
  cloudFrontUrl: string;
  key: string;
}

export async function getPresignedUrl(
  input: GetPresignedUrlInput
): Promise<GetPresignedUrlResult> {
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

  // Generate unique key: /workspaceSlug/randomcuid/file.pdf
  const safeFilename = sanitizeFilename(filename);
  const uniqueId = createCuid();
  const s3Key = `${workspaceSlug}/${uniqueId}/${safeFilename}`;

  // Generate presigned URL
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: s3Key,
    ContentType: contentType,
    CacheControl: CACHE_CONTROL,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300, // 5 minutes
  });

  // Construct CloudFront URL for storage in DB
  const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}`;

  return {
    presignedUrl,
    cloudFrontUrl,
    key: s3Key,
  };
}
