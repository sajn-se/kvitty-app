/**
 * Test script for S3 upload functionality
 * Run with: npx tsx scripts/test-s3.ts
 */

import "dotenv/config";
import { uploadToS3, deleteFromS3 } from "../lib/utils/s3";

async function testS3() {
  console.log("🧪 Testing S3 upload...\n");

  // Check environment variables
  const requiredVars = [
    "AWS_REGION",
    "AWS_S3_BUCKET",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "CLOUDFRONT_DOMAIN",
  ];

  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing.join(", "));
    console.error("   Make sure your .env file is configured correctly.");
    process.exit(1);
  }

  console.log("✅ Environment variables configured");
  console.log(`   Region: ${process.env.AWS_REGION}`);
  console.log(`   Bucket: ${process.env.AWS_S3_BUCKET}`);
  console.log(`   CloudFront: ${process.env.CLOUDFRONT_DOMAIN}\n`);

  // Create a test file
  const testContent = `Test file created at ${new Date().toISOString()}`;
  const testBuffer = Buffer.from(testContent, "utf-8");
  const testFilename = "test-upload.txt";
  const testWorkspace = "_test";

  try {
    // Test upload
    console.log("📤 Uploading test file...");
    const result = await uploadToS3(
      testBuffer,
      testFilename,
      "text/plain",
      testWorkspace
    );

    console.log("✅ Upload successful!");
    console.log(`   Key: ${result.key}`);
    console.log(`   CloudFront URL: ${result.cloudFrontUrl}\n`);

    // Test CloudFront access
    console.log("🌐 Testing CloudFront access...");
    const response = await fetch(result.cloudFrontUrl);

    if (response.ok) {
      const content = await response.text();
      console.log("✅ CloudFront access successful!");
      console.log(`   Status: ${response.status}`);
      console.log(`   Content: ${content}\n`);
    } else {
      console.log(`⚠️  CloudFront returned status ${response.status}`);
      console.log("   Note: It may take a few minutes for CloudFront to propagate.\n");
    }

    // Test deletion
    console.log("🗑️  Testing deletion...");
    await deleteFromS3(result.cloudFrontUrl);
    console.log("✅ Deletion successful!\n");

    // Verify deletion
    console.log("🔍 Verifying deletion...");
    const verifyResponse = await fetch(result.cloudFrontUrl);
    if (verifyResponse.status === 403 || verifyResponse.status === 404) {
      console.log("✅ File successfully deleted (returns 403/404)\n");
    } else {
      console.log(`⚠️  File still accessible (status ${verifyResponse.status})`);
      console.log("   Note: CloudFront may cache the file temporarily.\n");
    }

    console.log("🎉 All S3 tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

testS3();
