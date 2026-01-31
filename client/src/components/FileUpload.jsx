import { useState } from 'react';
import axios from 'axios';
import './FileUpload.css';

const API_URL = 'https://nmb7cxrf-5050.inc1.devtunnels.ms/upload';

/**
 * FileUpload Component
 * Provides 8 upload sections for S3, Cloudinary, and Local storage
 * S3: Normal (2), Pre-signed (2), Cloudinary (2), Local (2)
 */
const FileUpload = () => {
  // State for each upload section
  const [uploads, setUploads] = useState({
    s3Single: { file: null, loading: false, message: '' },
    s3Multiple: { files: null, loading: false, message: '' },
    s3PresignedSingle: { file: null, loading: false, message: '' },
    s3PresignedMultiple: { files: null, loading: false, message: '' },
    cloudinarySingle: { file: null, loading: false, message: '' },
    cloudinaryMultiple: { files: null, loading: false, message: '' },
    localSingle: { file: null, loading: false, message: '' },
    localMultiple: { files: null, loading: false, message: '' },
  });

  /**
   * Validate file type - only allow images and PDFs
   */
  const validateFileType = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
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
        e.target.value = '';
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
      e.target.value = '';
      return;
    }

    setUploads((prev) => ({
      ...prev,
      [section]: { ...prev[section], files, message: '' },
    }));
  };

  /**
   * Generic upload function using axios (for normal uploads)
   */
  const handleUpload = async (section, endpoint, fieldName) => {
    const uploadData = uploads[section];

    if (!uploadData.file && !uploadData.files) {
      setUploads((prev) => ({
        ...prev,
        [section]: { ...prev[section], message: 'Please select a file first.' },
      }));
      return;
    }

    const formData = new FormData();
    if (uploadData.file) {
      formData.append(fieldName, uploadData.file);
    } else if (uploadData.files) {
      uploadData.files.forEach((file) => {
        formData.append(fieldName, file);
      });
    }

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

      setUploads((prev) => ({
        ...prev,
        [section]: {
          file: null,
          files: null,
          loading: false,
          message: `SUCCESS: ${response.data.message}`,
        },
      }));

      document.getElementById(`${section}-input`).value = '';
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Upload failed. Please try again.';
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
   * Handle pre-signed upload (single file)
   */
  const handlePresignedUploadSingle = async (section) => {
    const uploadData = uploads[section];

    if (!uploadData.file) {
      setUploads((prev) => ({
        ...prev,
        [section]: { ...prev[section], message: 'Please select a file first.' },
      }));
      return;
    }

    setUploads((prev) => ({
      ...prev,
      [section]: { ...prev[section], loading: true, message: '' },
    }));

    try {
      // Step 1: Get pre-signed URL from backend
      const urlResponse = await axios.post(`${API_URL}/s3/presigned/single`, {
        filename: uploadData.file.name,
        filetype: uploadData.file.type,
      });

      const { presignedUrl, fileUrl } = urlResponse.data.data;

      // Step 2: Upload file directly to S3 using fetch WITHOUT Content-Type header
      // Content-Type is not part of the signature
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: uploadData.file,
        // headers: {
        //   'Content-Type': uploadData.file.type,
        // },
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
      }

      // Step 3: Confirm upload with backend
      await axios.post(`${API_URL}/s3/presigned/single/confirm`, {
        fileUrl,
      });

      setUploads((prev) => ({
        ...prev,
        [section]: {
          file: null,
          loading: false,
          message: 'SUCCESS: File uploaded via pre-signed URL successfully',
        },
      }));

      document.getElementById(`${section}-input`).value = '';
    } catch (error) {
      console.error('Pre-signed upload error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Pre-signed upload failed. Please try again.';
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
   * Handle pre-signed upload (multiple files)
   */
  const handlePresignedUploadMultiple = async (section) => {
    const uploadData = uploads[section];

    if (!uploadData.files || uploadData.files.length === 0) {
      setUploads((prev) => ({
        ...prev,
        [section]: { ...prev[section], message: 'Please select files first.' },
      }));
      return;
    }

    setUploads((prev) => ({
      ...prev,
      [section]: { ...prev[section], loading: true, message: '' },
    }));

    try {
      // Step 1: Get pre-signed URLs for all files
      const filesData = uploadData.files.map((file) => ({
        filename: file.name,
        filetype: file.type,
      }));

      const urlResponse = await axios.post(`${API_URL}/s3/presigned/multiple`, {
        files: filesData,
      });

      const presignedData = urlResponse.data.data;

      // Step 2: Upload all files directly to S3 using fetch WITHOUT Content-Type
      await Promise.all(
        presignedData.map((data, index) =>
          fetch(data.presignedUrl, {
            method: 'PUT',
            body: uploadData.files[index],
          }).then((response) => {
            if (!response.ok) {
              throw new Error(`S3 upload failed for ${data.filename}: ${response.statusText}`);
            }
          })
        )
      );

      // Step 3: Confirm uploads with backend
      const fileUrls = presignedData.map((data) => data.fileUrl);
      await axios.post(`${API_URL}/s3/presigned/multiple/confirm`, {
        fileUrls,
      });

      setUploads((prev) => ({
        ...prev,
        [section]: {
          files: null,
          loading: false,
          message: `SUCCESS: ${uploadData.files.length} files uploaded via pre-signed URLs successfully`,
        },
      }));

      document.getElementById(`${section}-input`).value = '';
    } catch (error) {
      console.error('Pre-signed upload error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Pre-signed upload failed. Please try again.';
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
  // eslint-disable-next-line no-unused-vars
  const UploadSection = ({
    title,
    section,
    endpoint,
    fieldName,
    multiple = false,
    presigned = false,
  }) => {
    const uploadData = uploads[section];
    const fileCount = uploadData.files ? uploadData.files.length : 0;

    const handleClick = () => {
      if (presigned) {
        if (multiple) {
          handlePresignedUploadMultiple(section);
        } else {
          handlePresignedUploadSingle(section);
        }
      } else {
        handleUpload(section, endpoint, fieldName);
      }
    };

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
              multiple ? handleMultipleFilesChange(section, e) : handleSingleFileChange(section, e)
            }
            disabled={uploadData.loading}
          />

          {uploadData.file && <p className="file-info">Selected: {uploadData.file.name}</p>}

          {uploadData.files && fileCount > 0 && (
            <p className="file-info">Selected: {fileCount} file(s)</p>
          )}

          <button onClick={handleClick} disabled={uploadData.loading} className="upload-btn">
            {uploadData.loading ? 'Uploading...' : 'Upload'}
          </button>

          {uploadData.message && (
            <p
              className={`message ${uploadData.message.includes('SUCCESS') ? 'success' : 'error'}`}
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
        {/* S3 Normal Uploads */}
        <UploadSection
          title="S3 - Single File (Normal)"
          section="s3Single"
          endpoint="/s3/single"
          fieldName="file"
          multiple={false}
          presigned={false}
        />

        <UploadSection
          title="S3 - Multiple Files (Normal)"
          section="s3Multiple"
          endpoint="/s3/multiple"
          fieldName="files"
          multiple={true}
          presigned={false}
        />

        {/* S3 Pre-signed Uploads */}
        <UploadSection
          title="S3 - Single File (Pre-signed)"
          section="s3PresignedSingle"
          endpoint="/s3/presigned/single"
          fieldName="file"
          multiple={false}
          presigned={true}
        />

        <UploadSection
          title="S3 - Multiple Files (Pre-signed)"
          section="s3PresignedMultiple"
          endpoint="/s3/presigned/multiple"
          fieldName="files"
          multiple={true}
          presigned={true}
        />

        {/* Cloudinary Uploads */}
        <UploadSection
          title="Cloudinary - Single File"
          section="cloudinarySingle"
          endpoint="/cloudinary/single"
          fieldName="file"
          multiple={false}
          presigned={false}
        />

        <UploadSection
          title="Cloudinary - Multiple Files"
          section="cloudinaryMultiple"
          endpoint="/cloudinary/multiple"
          fieldName="files"
          multiple={true}
          presigned={false}
        />

        {/* Local Uploads */}
        <UploadSection
          title="Local - Single File"
          section="localSingle"
          endpoint="/local/single"
          fieldName="file"
          multiple={false}
          presigned={false}
        />

        <UploadSection
          title="Local - Multiple Files"
          section="localMultiple"
          endpoint="/local/multiple"
          fieldName="files"
          multiple={true}
          presigned={false}
        />
      </div>
    </div>
  );
};

export default FileUpload;
