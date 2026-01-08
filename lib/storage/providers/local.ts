import fs from "fs/promises";
import path from "path";
import { createCuid } from "@/lib/utils/cuid";
import type { StorageProvider, UploadResult, PresignedUrlResult } from "../types";

const ASSETS_DIR = "assets/uploads";

function sanitizeFilename(filename: string): string {
  const basename = path.basename(filename);
  return basename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

function getPublicDir(): string {
  return path.join(process.cwd(), "public", ASSETS_DIR);
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export class LocalStorageProvider implements StorageProvider {
  readonly mode = "local" as const;

  async upload(
    buffer: Buffer,
    filename: string,
    contentType: string,
    workspaceSlug: string
  ): Promise<UploadResult> {
    const safeFilename = sanitizeFilename(filename);
    const uniqueId = createCuid();
    const key = `${workspaceSlug}/${uniqueId}/${safeFilename}`;

    const fullDir = path.join(getPublicDir(), workspaceSlug, uniqueId);
    const fullPath = path.join(fullDir, safeFilename);

    // Ensure directory exists
    await fs.mkdir(fullDir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, buffer);

    const url = `${getBaseUrl()}/${ASSETS_DIR}/${key}`;

    return { key, url };
  }

  async getPresignedUrl(
    filename: string,
    contentType: string,
    workspaceSlug: string
  ): Promise<PresignedUrlResult> {
    // Local storage doesn't support presigned URLs
    // The client will upload via our API endpoint instead
    const safeFilename = sanitizeFilename(filename);
    const uniqueId = createCuid();
    const key = `${workspaceSlug}/${uniqueId}/${safeFilename}`;

    const url = `${getBaseUrl()}/${ASSETS_DIR}/${key}`;

    return {
      presignedUrl: null,
      url,
      key,
    };
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      const url = new URL(fileUrl);
      const relativePath = url.pathname.replace(`/${ASSETS_DIR}/`, "");
      const fullPath = path.join(getPublicDir(), relativePath);

      await fs.unlink(fullPath);

      // Try to clean up empty directories
      const dir = path.dirname(fullPath);
      try {
        const files = await fs.readdir(dir);
        if (files.length === 0) {
          await fs.rmdir(dir);
          // Try parent directory too
          const parentDir = path.dirname(dir);
          const parentFiles = await fs.readdir(parentDir);
          if (parentFiles.length === 0) {
            await fs.rmdir(parentDir);
          }
        }
      } catch {
        // Ignore directory cleanup errors
      }
    } catch (error) {
      console.error("Failed to delete local file:", error);
      throw error;
    }
  }

  supportsPresignedUrl(): boolean {
    return false;
  }
}

export const localStorageProvider = new LocalStorageProvider();
