import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileDisplay.css';

const API_URL = 'http://localhost:5050/upload';

/**
 * FileDisplay Component
 * Displays all uploaded files from S3, Cloudinary, and Local storage
 */
const FileDisplay = () => {
  const [files, setFiles] = useState({
    s3: [],
    cloudinary: [],
    local: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all files from all sources
   */
  const fetchAllFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const [s3Response, cloudinaryResponse, localResponse] = await Promise.all([
        axios.get(`${API_URL}/s3/files`),
        axios.get(`${API_URL}/cloudinary/files`),
        axios.get(`${API_URL}/local/files`),
      ]);

      console.log('S3 Files:', s3Response.data);
      console.log('Cloudinary Files:', cloudinaryResponse.data);
      console.log('Local Files:', localResponse.data);

      setFiles({
        s3: s3Response.data.data || [],
        cloudinary: cloudinaryResponse.data.data || [],
        local: localResponse.data.data || [],
      });
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to fetch files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch files on component mount
  useEffect(() => {
    fetchAllFiles();
  }, []);

  /**
   * Check if file is an image
   */
  const isImage = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
  };

  /**
   * Check if file is a PDF
   */
  const isPDF = (url) => {
    if (!url) return false;
    return /\.pdf$/i.test(url);
  };

  /**
   * Get file URL for local files (prepend server URL)
   */
  const getFileUrl = (filePath, isLocal = false) => {
    if (!filePath) return '';
    if (isLocal) {
      return `http://localhost:5050${filePath}`;
    }
    return filePath;
  };

  /**
   * Render file item (single file or files array)
   */
  const renderFileItem = (item, storageType) => {
    const isLocal = storageType === 'local';
    
    // Handle single file
    if (item.file) {
      const fileUrl = getFileUrl(item.file, isLocal);
      return (
        <div key={item._id} className="file-item">
          {isImage(item.file) ? (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <img src={fileUrl} alt="Uploaded file" className="file-preview" />
            </a>
          ) : isPDF(item.file) ? (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="pdf-link">
              <div className="pdf-icon">[PDF]</div>
              <p>View PDF</p>
            </a>
          ) : (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
              <div className="file-icon">[FILE]</div>
              <p>View File</p>
            </a>
          )}
          <p className="file-date">{new Date(item.createdAt).toLocaleDateString()}</p>
        </div>
      );
    }
    
    // Handle multiple files
    if (item.files && item.files.length > 0) {
      return (
        <div key={item._id} className="file-group">
          <p className="file-count">{item.files.length} files uploaded</p>
          <div className="file-grid">
            {item.files.map((file, index) => {
              const fileUrl = getFileUrl(file, isLocal);
              return (
                <div key={index} className="file-item-small">
                  {isImage(file) ? (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                      <img src={fileUrl} alt={`File ${index + 1}`} className="file-preview-small" />
                    </a>
                  ) : isPDF(file) ? (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="pdf-link-small">
                      <div className="pdf-icon-small">[PDF]</div>
                    </a>
                  ) : (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-link-small">
                      <div className="file-icon-small">[FILE]</div>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
          <p className="file-date">{new Date(item.createdAt).toLocaleDateString()}</p>
        </div>
      );
    }
    
    return null;
  };

  /**
   * Render files section
   */
  const renderFilesSection = (title, fileList, storageType, color) => {
    return (
      <div className="files-section">
        <h3 style={{ color }}>
          {title} <span className="count-badge">{fileList.length}</span>
        </h3>
        {fileList.length === 0 ? (
          <p className="no-files">No files uploaded yet</p>
        ) : (
          <div className="files-container">
            {fileList.map((item) => renderFileItem(item, storageType))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="file-display-container">
        <h2>Uploaded Files</h2>
        <div className="loading">Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-display-container">
        <h2>Uploaded Files</h2>
        <div className="error">{error}</div>
        <button onClick={fetchAllFiles} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="file-display-container">
      <div className="header">
        <h2>Uploaded Files</h2>
        <button onClick={fetchAllFiles} className="refresh-btn">
          Refresh
        </button>
      </div>

      {renderFilesSection('AWS S3 Files', files.s3, 's3', '#FF9900')}
      {renderFilesSection('Cloudinary Files', files.cloudinary, 'cloudinary', '#3448C5')}
      {renderFilesSection('Local Storage Files', files.local, 'local', '#10B981')}
    </div>
  );
};

export default FileDisplay;
