import mongoose from 'mongoose';

/**
 * Local Files Schema
 * - file: String - stores single file path
 * - files: [String] - stores multiple file paths
 */
const localFilesSchema = new mongoose.Schema(
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

const LocalFiles = mongoose.model('LocalFiles', localFilesSchema);

export default LocalFiles;
