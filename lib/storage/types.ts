/**
 * Storage abstraction types for file uploads
 * Supports: local, s3, vercel-blob
 */

export type StorageMode = "local" | "s3" | "vercel-blob";

export interface UploadResult {
  /** The storage key/path for the file */
  key: string;
  /** The public URL to access the file */
  url: string;
}

export interface PresignedUrlResult {
  /** The presigned URL for direct upload (null for providers that don't support it) */
  presignedUrl: string | null;
  /** The public URL where the file will be accessible after upload */
  url: string;
  /** The storage key/path for the file */
  key: string;
}

export interface StorageProvider {
  /** The storage mode identifier */
  readonly mode: StorageMode;

  /**
   * Upload a file buffer directly to storage
   * Used for server-side uploads (e.g., PDF generation)
   */
  upload(
    buffer: Buffer,
    filename: string,
    contentType: string,
    workspaceSlug: string
  ): Promise<UploadResult>;

  /**
   * Get a presigned URL for client-side uploads
   * Some providers may not support presigned URLs
   */
  getPresignedUrl(
    filename: string,
    contentType: string,
    workspaceSlug: string
  ): Promise<PresignedUrlResult>;

  /**
   * Delete a file from storage
   */
  delete(fileUrl: string): Promise<void>;

  /**
   * Check if this provider supports presigned URLs for direct client uploads
   */
  supportsPresignedUrl(): boolean;
}
