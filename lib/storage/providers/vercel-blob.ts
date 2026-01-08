import { put, del } from "@vercel/blob";
import { createCuid } from "@/lib/utils/cuid";
import type { StorageProvider, UploadResult, PresignedUrlResult } from "../types";

function sanitizeFilename(filename: string): string {
  const basename = filename.split("/").pop() || filename;
  return basename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export class VercelBlobStorageProvider implements StorageProvider {
  readonly mode = "vercel-blob" as const;

  async upload(
    buffer: Buffer,
    filename: string,
    contentType: string,
    workspaceSlug: string
  ): Promise<UploadResult> {
    const safeFilename = sanitizeFilename(filename);
    const uniqueId = createCuid();
    const pathname = `${workspaceSlug}/${uniqueId}/${safeFilename}`;

    const blob = await put(pathname, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false, // We handle uniqueness with cuid
    });

    return {
      key: pathname,
      url: blob.url,
    };
  }

  async getPresignedUrl(
    filename: string,
    contentType: string,
    workspaceSlug: string
  ): Promise<PresignedUrlResult> {
    // Vercel Blob uses client-side upload with token exchange
    // The actual upload URL is generated client-side via handleUpload
    // For now, we return null and handle via API route
    const safeFilename = sanitizeFilename(filename);
    const uniqueId = createCuid();
    const key = `${workspaceSlug}/${uniqueId}/${safeFilename}`;

    return {
      presignedUrl: null,
      url: "", // Will be populated after actual upload
      key,
    };
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      await del(fileUrl);
    } catch (error) {
      console.error("Failed to delete from Vercel Blob:", error);
      throw error;
    }
  }

  supportsPresignedUrl(): boolean {
    // Vercel Blob has a different client upload mechanism
    return false;
  }
}

export const vercelBlobStorageProvider = new VercelBlobStorageProvider();
