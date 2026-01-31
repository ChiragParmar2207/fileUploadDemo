import S3BucketFiles from '../models/s3BucketFiles.js';

/**
 * Upload single file to S3
 * Route: POST /upload/s3/single
 */
export const uploadSingleToS3 = async (req, res) => {
  try {
    console.log('==========> req.file', req.file);
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Get S3 file URL
    const fileUrl = req.file.location;

    // Save to database in 'file' field (single file)
    const newFile = new S3BucketFiles({
      file: fileUrl,
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
 * Upload multiple files to S3
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

    // Save to database in 'files' field (multiple files)
    const newFiles = new S3BucketFiles({
      files: fileUrls,
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
