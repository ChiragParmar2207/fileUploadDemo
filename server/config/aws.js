import { S3Client } from '@aws-sdk/client-s3';

/**
 * AWS S3 Configuration (SDK v3)
 * Initialize S3 client with credentials from environment variables
 */
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

export default s3;
