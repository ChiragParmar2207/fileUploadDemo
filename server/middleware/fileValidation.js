/**
 * File Type Validation Middleware
 * Only allows: jpg, jpeg, png, webp, pdf
 */
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  // Check if file type is allowed
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPG, JPEG, PNG, WEBP, and PDF files are allowed.`
      ),
      false
    ); // Reject file
  }
};

export default fileFilter;
