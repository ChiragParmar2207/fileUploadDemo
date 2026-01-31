import mongoose from 'mongoose';

/**
 * S3 Bucket Files Schema
 * - file: String - stores single file URL
 * - files: [String] - stores multiple file URLs
 */
const s3BucketFilesSchema = new mongoose.Schema(
  {
    file: {
      type: String,
      default: null,
    },
    files: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const S3BucketFiles = mongoose.model('S3BucketFiles', s3BucketFilesSchema);

export default S3BucketFiles;
