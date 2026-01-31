import React, { useState } from 'react';
import axios from 'axios';
import './FileUpload.css';

const API_URL = 'http://localhost:5050/upload';

/**
 * FileUpload Component
 * Provides 6 upload sections for S3, Cloudinary, and Local storage
 * Each supports single and multiple file uploads
 */
const FileUpload = () => {
  // State for each upload section
  const [uploads, setUploads] = useState({
    s3Single: { file: null, loading: false, message: '' },
    s3Multiple: { files: null, loading: false, message: '' },
    cloudinarySingle: { file: null, loading: false, message: '' },
    cloudinaryMultiple: { files: null, loading: false, message: '' },
    localSingle: { file: null, loading: false, message: '' },
    localMultiple: { files: null, loading: false, message: '' },
  });

  /**
   * Validate file type - only allow images and PDFs
   */
  const validateFileType = (file) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    return allowedTypes.includes(file.type);
  };

  /**
   * Handle file selection for single file upload
   */
  const handleSingleFileChange = (section, e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateFileType(file)) {
        setUploads((prev) => ({
          ...prev,
          [section]: {
            ...prev[section],
            file: null,
            message: 'Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.',
          },
        }));
        e.target.value = ''; // Reset input
        return;
      }
      setUploads((prev) => ({
        ...prev,
        [section]: { ...prev[section], file, message: '' },
      }));
    }
  };

  /**
   * Handle file selection for multiple file upload
   */
  const handleMultipleFilesChange = (section, e) => {
    const files = Array.from(e.target.files);
    
    // Validate all files
    const invalidFiles = files.filter((file) => !validateFileType(file));
    
    if (invalidFiles.length > 0) {
      setUploads((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          files: null,
          message: `${invalidFiles.length} file(s) have invalid type. Only JPG, PNG, WEBP, and PDF are allowed.`,
        },
      }));
      e.target.value = ''; // Reset input
      return;
    }

    setUploads((prev) => ({
      ...prev,
      [section]: { ...prev[section], files, message: '' },
    }));
  };

  /**
   * Generic upload function using axios
   */
  const handleUpload = async (section, endpoint, fieldName) => {
    const uploadData = uploads[section];
    
    // Check if file(s) are selected
    if (!uploadData.file && !uploadData.files) {
      setUploads((prev) => ({
        ...prev,
        [section]: { ...prev[section], message: 'Please select a file first.' },
      }));
      return;
    }

    // Create FormData
    const formData = new FormData();
    if (uploadData.file) {
      formData.append(fieldName, uploadData.file);
    } else if (uploadData.files) {
      uploadData.files.forEach((file) => {
        formData.append(fieldName, file);
      });
    }

    // Set loading state
    setUploads((prev) => ({
      ...prev,
      [section]: { ...prev[section], loading: true, message: '' },
    }));

    try {
      const response = await axios.post(`${API_URL}${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Success
      setUploads((prev) => ({
        ...prev,
        [section]: {
          file: null,
          files: null,
          loading: false,
          message: `SUCCESS: ${response.data.message}`,
        },
      }));

      // Reset file input
      document.getElementById(`${section}-input`).value = '';
    } catch (error) {
      // Error
      const errorMessage =
        error.response?.data?.message || 'Upload failed. Please try again.';
      setUploads((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          loading: false,
          message: `ERROR: ${errorMessage}`,
        },
      }));
    }
  };

  /**
   * Render upload section component
   */
  const UploadSection = ({
    title,
    section,
    endpoint,
    fieldName,
    multiple = false,
  }) => {
    const uploadData = uploads[section];
    const fileCount = uploadData.files ? uploadData.files.length : 0;

    return (
      <div className="upload-section">
        <h3>{title}</h3>
        <div className="upload-content">
          <input
            id={`${section}-input`}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            multiple={multiple}
            onChange={(e) =>
              multiple
                ? handleMultipleFilesChange(section, e)
                : handleSingleFileChange(section, e)
            }
            disabled={uploadData.loading}
          />
          
          {uploadData.file && (
            <p className="file-info">Selected: {uploadData.file.name}</p>
          )}
          
          {uploadData.files && fileCount > 0 && (
            <p className="file-info">Selected: {fileCount} file(s)</p>
          )}
          
          <button
            onClick={() => handleUpload(section, endpoint, fieldName)}
            disabled={uploadData.loading}
            className="upload-btn"
          >
            {uploadData.loading ? 'Uploading...' : 'Upload'}
          </button>
          
          {uploadData.message && (
            <p
              className={`message ${
                uploadData.message.includes('SUCCESS') ? 'success' : 'error'
              }`}
            >
              {uploadData.message}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="file-upload-container">
      <div className="upload-grid">
        {/* S3 Uploads */}
        <UploadSection
          title="S3 - Single File"
          section="s3Single"
          endpoint="/s3/single"
          fieldName="file"
          multiple={false}
        />
        
        <UploadSection
          title="S3 - Multiple Files"
          section="s3Multiple"
          endpoint="/s3/multiple"
          fieldName="files"
          multiple={true}
        />

        {/* Cloudinary Uploads */}
        <UploadSection
          title="Cloudinary - Single File"
          section="cloudinarySingle"
          endpoint="/cloudinary/single"
          fieldName="file"
          multiple={false}
        />
        
        <UploadSection
          title="Cloudinary - Multiple Files"
          section="cloudinaryMultiple"
          endpoint="/cloudinary/multiple"
          fieldName="files"
          multiple={true}
        />

        {/* Local Uploads */}
        <UploadSection
          title="Local - Single File"
          section="localSingle"
          endpoint="/local/single"
          fieldName="file"
          multiple={false}
        />
        
        <UploadSection
          title="Local - Multiple Files"
          section="localMultiple"
          endpoint="/local/multiple"
          fieldName="files"
          multiple={true}
        />
      </div>
    </div>
  );
};

export default FileUpload;
