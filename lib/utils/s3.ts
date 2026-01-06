import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { createCuid } from "./cuid";

export const CACHE_CONTROL = "public, max-age=31536000, immutable";

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

export function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = createS3Client();
  }
  return _s3Client;
}

// Legacy export for backwards compatibility
export const s3Client = new Proxy({} as S3Client, {
  get(_target, prop) {
    return Reflect.get(getS3Client(), prop);
  },
});

interface UploadResult {
  key: string;
  cloudFrontUrl: string;
}

function sanitizeFilename(filename: string): string {
  const basename = filename.split("/").pop() || filename;
  return basename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export async function uploadToS3(
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
    cloudFrontUrl: `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`,
  };
}

export async function deleteFromS3(fileUrl: string): Promise<void> {
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
