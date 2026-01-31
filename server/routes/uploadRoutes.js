import express from 'express';
import { uploadS3 } from '../middleware/upload.js';
import { uploadLocal } from '../middleware/upload.js';
import {
  uploadSingleToS3,
  uploadMultipleToS3,
} from '../controllers/s3Controller.js';
import {
  uploadSingleToCloudinary,
  uploadMultipleToCloudinary,
} from '../controllers/cloudinaryController.js';
import {
  uploadSingleLocal,
  uploadMultipleLocal,
} from '../controllers/localController.js';

const router = express.Router();

/**
 * S3 Upload Routes
 */
// POST /upload/s3/single - Upload single file to S3
router.post('/s3/single', uploadS3.single('file'), uploadSingleToS3);

// POST /upload/s3/multiple - Upload multiple files to S3
router.post('/s3/multiple', uploadS3.array('files', 10), uploadMultipleToS3);

/**
 * Cloudinary Upload Routes
 * Note: Uses local storage first, then uploads to Cloudinary
 */
// POST /upload/cloudinary/single - Upload single file to Cloudinary
router.post(
  '/cloudinary/single',
  uploadLocal.single('file'),
  uploadSingleToCloudinary
);

// POST /upload/cloudinary/multiple - Upload multiple files to Cloudinary
router.post(
  '/cloudinary/multiple',
  uploadLocal.array('files', 10),
  uploadMultipleToCloudinary
);

/**
 * Local Storage Upload Routes
 */
// POST /upload/local/single - Upload single file locally
router.post('/local/single', uploadLocal.single('file'), uploadSingleLocal);

// POST /upload/local/multiple - Upload multiple files locally
router.post(
  '/local/multiple',
  uploadLocal.array('files', 10),
  uploadMultipleLocal
);

export default router;
