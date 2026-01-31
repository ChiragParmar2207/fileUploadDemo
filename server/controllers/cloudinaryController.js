import cloudinary from '../config/cloudinary.js';
import CloudinaryFiles from '../models/cloudinaryFiles.js';
import fs from 'fs';

/**
 * Upload single file to Cloudinary
 * Route: POST /upload/cloudinary/single
 */
export const uploadSingleToCloudinary = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'uploads',
      resource_type: 'auto', // Automatically detect file type
    });

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    // Save to database in 'file' field (single file)
    const newFile = new CloudinaryFiles({
      file: result.secure_url,
    });

    await newFile.save();

    res.status(201).json({
      success: true,
      message: 'File uploaded to Cloudinary successfully',
      data: {
        file: result.secure_url,
      },
    });
  } catch (error) {
    // Clean up local file if upload fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file to Cloudinary',
      error: error.message,
    });
  }
};

/**
 * Upload multiple files to Cloudinary
 * Route: POST /upload/cloudinary/multiple
 */
export const uploadMultipleToCloudinary = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Upload all files to Cloudinary
    const uploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: 'uploads',
        resource_type: 'auto',
      })
    );

    const results = await Promise.all(uploadPromises);

    // Delete local files after upload
    req.files.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    // Get all Cloudinary URLs
    const fileUrls = results.map((result) => result.secure_url);

    // Save to database in 'files' field (multiple files)
    const newFiles = new CloudinaryFiles({
      files: fileUrls,
    });

    await newFiles.save();

    res.status(201).json({
      success: true,
      message: `${req.files.length} files uploaded to Cloudinary successfully`,
      data: {
        files: fileUrls,
      },
    });
  } catch (error) {
    // Clean up local files if upload fails
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files to Cloudinary',
      error: error.message,
    });
  }
};
