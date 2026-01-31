import LocalFiles from '../models/localFiles.js';

/**
 * Upload single file to local storage
 * Route: POST /upload/local/single
 */
export const uploadSingleLocal = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Get local file path
    const filePath = `/uploads/${req.file.filename}`;

    // Save to database in 'file' field (single file)
    const newFile = new LocalFiles({
      file: filePath,
    });

    await newFile.save();

    res.status(201).json({
      success: true,
      message: 'File uploaded locally successfully',
      data: {
        file: filePath,
      },
    });
  } catch (error) {
    console.error('Error uploading locally:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file locally',
      error: error.message,
    });
  }
};

/**
 * Upload multiple files to local storage
 * Route: POST /upload/local/multiple
 */
export const uploadMultipleLocal = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Get all local file paths
    const filePaths = req.files.map((file) => `/uploads/${file.filename}`);

    // Save to database in 'files' field (multiple files)
    const newFiles = new LocalFiles({
      files: filePaths,
    });

    await newFiles.save();

    res.status(201).json({
      success: true,
      message: `${req.files.length} files uploaded locally successfully`,
      data: {
        files: filePaths,
      },
    });
  } catch (error) {
    console.error('Error uploading locally:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files locally',
      error: error.message,
    });
  }
};

/**
 * Get all locally uploaded files
 * Route: GET /upload/local/files
 */
export const getAllLocalFiles = async (req, res) => {
  try {
    const files = await LocalFiles.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    console.error('Error fetching local files:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching local files',
      error: error.message,
    });
  }
};
