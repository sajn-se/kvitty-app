import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createCuid } from "@/lib/utils/cuid";
import type { StorageProvider, UploadResult, PresignedUrlResult } from "../types";

const CACHE_CONTROL = "public, max-age=31536000, immutable";

function createS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = createS3Client();
  }
  return _s3Client;
}

function sanitizeFilename(filename: string): string {
  const basename = filename.split("/").pop() || filename;
  return basename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

function getCloudFrontUrl(key: string): string {
  return `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;
}

export class S3StorageProvider implements StorageProvider {
  readonly mode = "s3" as const;

  async upload(
    buffer: Buffer,
    filename: string,
    contentType: string,
    workspaceSlug: string
  ): Promise<UploadResult> {
    const safeFilename = sanitizeFilename(filename);
    const uniqueId = createCuid();
    const key = `${workspaceSlug}/${uniqueId}/${safeFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: CACHE_CONTROL,
    });

    await getS3Client().send(command);

    return {
      key,
      url: getCloudFrontUrl(key),
    };
  }

  async getPresignedUrl(
    filename: string,
    contentType: string,
    workspaceSlug: string
  ): Promise<PresignedUrlResult> {
    const safeFilename = sanitizeFilename(filename);
    const uniqueId = createCuid();
    const key = `${workspaceSlug}/${uniqueId}/${safeFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: contentType,
      CacheControl: CACHE_CONTROL,
    });

    const presignedUrl = await getSignedUrl(getS3Client(), command, {
      expiresIn: 300, // 5 minutes
    });

    return {
      presignedUrl,
      url: getCloudFrontUrl(key),
      key,
    };
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      const url = new URL(fileUrl);
      const key = url.pathname.slice(1);

      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      });

      await getS3Client().send(command);
    } catch (error) {
      console.error("Failed to delete from S3:", error);
      throw error;
    }
  }

  supportsPresignedUrl(): boolean {
    return true;
  }
}

export const s3StorageProvider = new S3StorageProvider();

// Re-export for backwards compatibility with existing code
export { getS3Client, CACHE_CONTROL };
