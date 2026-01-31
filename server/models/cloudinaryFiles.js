import mongoose from 'mongoose';

/**
 * Cloudinary Files Schema
 * - file: String - stores single file URL
 * - files: [String] - stores multiple file URLs
 */
const cloudinaryFilesSchema = new mongoose.Schema(
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

const CloudinaryFiles = mongoose.model('CloudinaryFiles', cloudinaryFilesSchema);

export default CloudinaryFiles;
