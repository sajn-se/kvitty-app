/**
 * Legacy S3 utilities - re-exports from the new storage abstraction
 * Kept for backwards compatibility with existing code
 */

import { uploadFile, deleteFile } from "@/lib/storage";
import { getS3Client, CACHE_CONTROL } from "@/lib/storage/providers/s3";

// Re-export S3-specific utilities for code that needs direct S3 access
export { getS3Client, CACHE_CONTROL };

// Legacy export for backwards compatibility
export const s3Client = new Proxy({} as ReturnType<typeof getS3Client>, {
  get(_target, prop) {
    return Reflect.get(getS3Client(), prop);
  },
});

interface UploadResult {
  key: string;
  cloudFrontUrl: string;
}

/**
 * Upload a file to storage
 * @deprecated Use uploadFile from @/lib/storage instead
 */
export async function uploadToS3(
  buffer: Buffer,
  filename: string,
  contentType: string,
  workspaceSlug: string
): Promise<UploadResult> {
  const result = await uploadFile(buffer, filename, contentType, workspaceSlug);
  return {
    key: result.key,
    cloudFrontUrl: result.url, // Renamed for backwards compatibility
  };
}

/**
 * Delete a file from storage
 * @deprecated Use deleteFile from @/lib/storage instead
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  await deleteFile(fileUrl);
}
