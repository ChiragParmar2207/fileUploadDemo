import S3BucketFiles from '../models/s3BucketFiles.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3 from '../config/aws.js';

/**
 * Upload single file to S3 (normal method)
 * Route: POST /upload/s3/single
 */
export const uploadSingleToS3 = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Get S3 file URL
    const fileUrl = req.file.location;

    // Save to database in 'file' field (single file) with normal type
    const newFile = new S3BucketFiles({
      file: fileUrl,
      type: 'normal',
    });

    await newFile.save();

    res.status(201).json({
      success: true,
      message: 'File uploaded to S3 successfully',
      data: {
        file: fileUrl,
      },
    });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file to S3',
      error: error.message,
    });
  }
};

/**
 * Upload multiple files to S3 (normal method)
 * Route: POST /upload/s3/multiple
 */
export const uploadMultipleToS3 = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Get all S3 file URLs
    const fileUrls = req.files.map((file) => file.location);

    // Save to database in 'files' field (multiple files) with normal type
    const newFiles = new S3BucketFiles({
      files: fileUrls,
      type: 'normal',
    });

    await newFiles.save();

    res.status(201).json({
      success: true,
      message: `${req.files.length} files uploaded to S3 successfully`,
      data: {
        files: fileUrls,
      },
    });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files to S3',
      error: error.message,
    });
  }
};

/**
 * Generate pre-signed URL for single file upload
 * Route: POST /upload/s3/presigned/single
 */
export const generatePresignedUrlSingle = async (req, res) => {
  try {
    const { filename, filetype } = req.body;

    if (!filename || !filetype) {
      return res.status(400).json({
        success: false,
        message: 'Filename and filetype are required',
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const key = `uploads/${timestamp}-${filename}`;

    // Create command for pre-signed URL WITHOUT Content-Type
    // This way Content-Type won't be part of the signature
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      // ContentType: filetype,
      // ChecksumAlgorithm: undefined
    });

    // Generate pre-signed URL (valid for 5 minutes)
    const presignedUrl = await getSignedUrl(s3, command, {
      expiresIn: 300,
      // unhoistableHeaders: new Set(['x-amz-checksum-crc32']),
      // signableHeaders: new Set(["host", "content-type"])
    });

    // Generate the public URL
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.status(200).json({
      success: true,
      data: {
        presignedUrl,
        fileUrl,
        key,
      },
    });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating pre-signed URL',
      error: error.message,
    });
  }
};

/**
 * Generate pre-signed URLs for multiple files upload
 * Route: POST /upload/s3/presigned/multiple
 */
export const generatePresignedUrlMultiple = async (req, res) => {
  try {
    const { files } = req.body; // Array of { filename, filetype }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Files array is required',
      });
    }

    // Generate pre-signed URLs for each file
    const presignedData = await Promise.all(
      // eslint-disable-next-line no-unused-vars
      files.map(async ({ filename, filetype }) => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const key = `uploads/${timestamp}-${random}-${filename}`;

        const command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
        });

        const presignedUrl = await getSignedUrl(s3, command, {
          expiresIn: 300,
          // unhoistableHeaders: new Set(['x-amz-checksum-crc32']),
        });

        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return {
          presignedUrl,
          fileUrl,
          key,
          filename,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: presignedData,
    });
  } catch (error) {
    console.error('Error generating pre-signed URLs:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating pre-signed URLs',
      error: error.message,
    });
  }
};

/**
 * Confirm pre-signed upload (single file)
 * Route: POST /upload/s3/presigned/single/confirm
 */
export const confirmPresignedUploadSingle = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'File URL is required',
      });
    }

    // Save to database with presigned type
    const newFile = new S3BucketFiles({
      file: fileUrl,
      type: 'presigned',
    });

    await newFile.save();

    res.status(201).json({
      success: true,
      message: 'Pre-signed upload confirmed successfully',
      data: {
        file: fileUrl,
      },
    });
  } catch (error) {
    console.error('Error confirming pre-signed upload:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming upload',
      error: error.message,
    });
  }
};

/**
 * Confirm pre-signed upload (multiple files)
 * Route: POST /upload/s3/presigned/multiple/confirm
 */
export const confirmPresignedUploadMultiple = async (req, res) => {
  try {
    const { fileUrls } = req.body;

    if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File URLs array is required',
      });
    }

    // Save to database with presigned type
    const newFiles = new S3BucketFiles({
      files: fileUrls,
      type: 'presigned',
    });

    await newFiles.save();

    res.status(201).json({
      success: true,
      message: `${fileUrls.length} pre-signed uploads confirmed successfully`,
      data: {
        files: fileUrls,
      },
    });
  } catch (error) {
    console.error('Error confirming pre-signed uploads:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming uploads',
      error: error.message,
    });
  }
};

/**
 * Get all S3 uploaded files
 * Route: GET /upload/s3/files
 */
export const getAllS3Files = async (req, res) => {
  try {
    const files = await S3BucketFiles.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    console.error('Error fetching S3 files:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching S3 files',
      error: error.message,
    });
  }
};
