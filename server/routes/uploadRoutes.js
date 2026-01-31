import express from 'express';
import { uploadS3 } from '../middleware/upload.js';
import { uploadLocal } from '../middleware/upload.js';
import {
  uploadSingleToS3,
  uploadMultipleToS3,
  generatePresignedUrlSingle,
  generatePresignedUrlMultiple,
  confirmPresignedUploadSingle,
  confirmPresignedUploadMultiple,
  getAllS3Files,
} from '../controllers/s3Controller.js';
import {
  uploadSingleToCloudinary,
  uploadMultipleToCloudinary,
  getAllCloudinaryFiles,
} from '../controllers/cloudinaryController.js';
import {
  uploadSingleLocal,
  uploadMultipleLocal,
  getAllLocalFiles,
} from '../controllers/localController.js';

const router = express.Router();

/**
 * S3 Upload Routes (Normal Method)
 */
// POST /upload/s3/single - Upload single file to S3
router.post('/s3/single', uploadS3.single('file'), uploadSingleToS3);

// POST /upload/s3/multiple - Upload multiple files to S3
router.post('/s3/multiple', uploadS3.array('files', 10), uploadMultipleToS3);

/**
 * S3 Pre-signed Upload Routes
 */
// POST /upload/s3/presigned/single - Generate pre-signed URL for single file
router.post('/s3/presigned/single', generatePresignedUrlSingle);

// POST /upload/s3/presigned/multiple - Generate pre-signed URLs for multiple files
router.post('/s3/presigned/multiple', generatePresignedUrlMultiple);

// POST /upload/s3/presigned/single/confirm - Confirm single file upload
router.post('/s3/presigned/single/confirm', confirmPresignedUploadSingle);

// POST /upload/s3/presigned/multiple/confirm - Confirm multiple files upload
router.post('/s3/presigned/multiple/confirm', confirmPresignedUploadMultiple);

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

/**
 * GET Routes - Retrieve uploaded files
 */
// GET /upload/s3/files - Get all S3 files
router.get('/s3/files', getAllS3Files);

// GET /upload/cloudinary/files - Get all Cloudinary files
router.get('/cloudinary/files', getAllCloudinaryFiles);

// GET /upload/local/files - Get all local files
router.get('/local/files', getAllLocalFiles);

export default router;
