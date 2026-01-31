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

      const { presignedUrl, fileUrl, contentType } = urlResponse.data.data;

      // Step 2: Upload file directly to S3 using fetch
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: uploadData.file,
        headers: {
          'Content-Type': contentType,
        },
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
        error.response?.data?.message || error.message || 'Pre-signed upload failed. Please try again.';
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

      // Step 2: Upload all files directly to S3 using fetch
      await Promise.all(
        presignedData.map((data, index) =>
          fetch(data.presignedUrl, {
            method: 'PUT',
            body: uploadData.files[index],
            headers: {
              'Content-Type': data.contentType,
            },
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
        error.response?.data?.message || error.message || 'Pre-signed upload failed. Please try again.';
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
