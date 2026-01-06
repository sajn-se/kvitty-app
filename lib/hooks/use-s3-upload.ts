"use client";

import { useState, useCallback } from "react";
import { getPresignedUrl } from "@/lib/actions/upload";

interface UploadOptions {
  workspaceSlug: string;
}

interface UploadResult {
  cloudFrontUrl: string;
  key: string;
}

export function useS3Upload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, options: UploadOptions): Promise<UploadResult> => {
      setIsUploading(true);
      setError(null);

      try {
        // Step 1: Get presigned URL via server action
        const { presignedUrl, cloudFrontUrl, key } = await getPresignedUrl({
          filename: file.name,
          contentType: file.type,
          workspaceSlug: options.workspaceSlug,
          fileSize: file.size,
        });

        // Step 2: Upload directly to S3
        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file to storage");
        }

        return { cloudFrontUrl, key };
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
