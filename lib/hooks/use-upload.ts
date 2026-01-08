"use client";

import { useState, useCallback } from "react";
import { getUploadUrl } from "@/lib/actions/upload";

interface UploadOptions {
  workspaceSlug: string;
}

interface UploadResult {
  url: string;
  key: string;
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, options: UploadOptions): Promise<UploadResult> => {
      setIsUploading(true);
      setError(null);

      try {
        // Step 1: Get upload URL info via server action
        const uploadInfo = await getUploadUrl({
          filename: file.name,
          contentType: file.type,
          workspaceSlug: options.workspaceSlug,
          fileSize: file.size,
        });

        // Step 2: Upload based on storage mode
        if (uploadInfo.usePresignedUrl && uploadInfo.presignedUrl) {
          // Direct upload to S3 via presigned URL
          const uploadResponse = await fetch(uploadInfo.presignedUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload file to storage");
          }

          return { url: uploadInfo.url, key: uploadInfo.key };
        } else {
          // Server upload for local/vercel-blob
          const formData = new FormData();
          formData.append("file", file);
          formData.append("workspaceSlug", options.workspaceSlug);

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || "Failed to upload file");
          }

          const result = await uploadResponse.json();
          return { url: result.url, key: result.key };
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  return { upload, isUploading, error };
}

// Legacy export for backwards compatibility
export { useUpload as useS3Upload };
