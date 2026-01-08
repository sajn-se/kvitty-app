import type { StorageMode, StorageProvider } from "./types";
import { localStorageProvider } from "./providers/local";
import { s3StorageProvider } from "./providers/s3";
import { vercelBlobStorageProvider } from "./providers/vercel-blob";

export type { StorageMode, StorageProvider, UploadResult, PresignedUrlResult } from "./types";

/**
 * Get the configured storage mode from environment
 * Defaults to "local" if not specified
 */
export function getStorageMode(): StorageMode {
  const mode = process.env.STORAGE_MODE as StorageMode | undefined;

  if (mode && ["local", "s3", "vercel-blob"].includes(mode)) {
    return mode;
  }

  return "local"; // Default to local storage
}

/**
 * Get the storage provider instance based on configuration
 */
export function getStorageProvider(): StorageProvider {
  const mode = getStorageMode();

  switch (mode) {
    case "s3":
      return s3StorageProvider;
    case "vercel-blob":
      return vercelBlobStorageProvider;
    case "local":
    default:
      return localStorageProvider;
  }
}

/**
 * Upload a file buffer to storage
 * Convenience wrapper around the storage provider
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string,
  workspaceSlug: string
) {
  const provider = getStorageProvider();
  return provider.upload(buffer, filename, contentType, workspaceSlug);
}

/**
 * Delete a file from storage
 * Convenience wrapper around the storage provider
 */
export async function deleteFile(fileUrl: string) {
  const provider = getStorageProvider();
  return provider.delete(fileUrl);
}

/**
 * Get presigned URL for client upload (if supported)
 */
export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  workspaceSlug: string
) {
  const provider = getStorageProvider();
  return provider.getPresignedUrl(filename, contentType, workspaceSlug);
}

/**
 * Check if current storage provider supports presigned URLs
 */
export function supportsPresignedUrl(): boolean {
  const provider = getStorageProvider();
  return provider.supportsPresignedUrl();
}

// Re-export providers for direct access if needed
export { localStorageProvider } from "./providers/local";
export { s3StorageProvider } from "./providers/s3";
export { vercelBlobStorageProvider } from "./providers/vercel-blob";
