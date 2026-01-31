import mongoose from 'mongoose';

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
    type: {
      type: String,
      enum: ['normal', 'presigned'],
      default: 'normal',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const S3BucketFiles = mongoose.model('S3BucketFiles', s3BucketFilesSchema);

export default S3BucketFiles;
