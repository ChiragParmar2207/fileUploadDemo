# File Upload System

A comprehensive file upload system with a **Node.js/Express backend** and **React frontend**. Supports multiple storage options including **AWS S3** (normal and pre-signed URLs), **Cloudinary**, and **Local Storage**.

---

## Features

### Upload Methods
- **AWS S3 (Normal Method)** - Direct upload via multer-s3
- **AWS S3 (Pre-signed URLs)** - Client-side direct upload to S3
- **Cloudinary** - Cloud-based media management
- **Local Storage** - Traditional server-side file storage

### Storage Options
Each method supports:
- Single file upload
- Multiple file upload (up to 10 files)

### File Types Supported
- Images: JPEG, JPG, PNG, WEBP
- Documents: PDF

### Additional Features
- **Request/Response Logging** - Winston logger with file and console outputs
- **File Type Validation** - Client and server-side validation
- **File Display** - View all uploaded files by storage type
- **MongoDB Integration** - Track all uploads with metadata
- **Type Tracking** - Distinguish between normal and pre-signed S3 uploads
- **Tabbed Interface** - Clean UI for upload and view modes
- **Real-time Feedback** - Loading states and success/error messages

---

## Project Structure

```
fileUpload/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx     # Main upload component (8 sections)
│   │   │   ├── FileUpload.css     # Upload styling
│   │   │   ├── FileDisplay.jsx    # Display uploaded files
│   │   │   └── FileDisplay.css    # Display styling
│   │   ├── App.jsx                # Main app with tab navigation
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
├── server/                    # Express backend
│   ├── config/
│   │   ├── aws.js                 # AWS S3 configuration
│   │   ├── cloudinary.js          # Cloudinary configuration
│   │   ├── database.js            # MongoDB connection
│   │   └── logger.js              # Winston logger setup
│   ├── controllers/
│   │   ├── s3Controller.js        # S3 upload logic (normal + pre-signed)
│   │   ├── cloudinaryController.js
│   │   └── localController.js
│   ├── middleware/
│   │   ├── upload.js              # Multer configuration
│   │   └── logger.js              # Request/error logging middleware
│   ├── models/
│   │   ├── s3BucketFiles.js       # S3 files schema (includes type field)
│   │   ├── cloudinaryFiles.js
│   │   └── localFiles.js
│   ├── routes/
│   │   └── uploadRoutes.js        # All upload routes
│   ├── logs/                      # Winston log files
│   │   ├── combined.log           # All requests/responses
│   │   └── error.log              # Error logs only
│   ├── uploads/                   # Local file storage
│   ├── server.js                  # Main server file
│   └── package.json
│
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- AWS S3 Account
- Cloudinary Account

### 1. Clone Repository
```bash
git clone <repository-url>
cd fileUpload
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5050
CLIENT_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/fileupload

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important**: No spaces around `=` signs and no quotes around values.

### 3. Frontend Setup

```bash
cd client
npm install
```

Update API URL in `src/components/FileUpload.jsx` and `src/components/FileDisplay.jsx`:
```javascript
const API_URL = 'http://localhost:5050/upload';
```

### 4. Run the Application

**Backend** (from `server` directory):
```bash
npm run dev
# or
nodemon
```

**Frontend** (from `client` directory):
```bash
npm run dev
```

Access the application at `http://localhost:3000`

---

## S3 Bucket Configuration

### For Pre-signed URL Uploads

Your S3 bucket needs proper CORS configuration:

1. Go to AWS S3 Console → Select your bucket
2. Navigate to **Permissions** tab
3. Scroll to **Cross-origin resource sharing (CORS)**
4. Add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

### For Public File Access (Optional)

To make uploaded files publicly accessible:

**Option 1**: Bucket Policy
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

**Option 2**: ACL (if enabled)
- Enable ACLs in bucket settings
- Set default object ACL to public-read

---

## API Endpoints

### S3 Upload (Normal Method)

**Upload Single File**
```http
POST /upload/s3/single
Content-Type: multipart/form-data

FormData: file
```

**Upload Multiple Files**
```http
POST /upload/s3/multiple
Content-Type: multipart/form-data

FormData: files (array)
```

### S3 Upload (Pre-signed URLs)

**Generate Pre-signed URL (Single)**
```http
POST /upload/s3/presigned/single
Content-Type: application/json

{
  "filename": "image.jpg",
  "filetype": "image/jpeg"
}

Response:
{
  "success": true,
  "data": {
    "presignedUrl": "https://...",
    "fileUrl": "https://...",
    "key": "uploads/..."
  }
}
```

**Upload to S3** (Client-side)
```javascript
await fetch(presignedUrl, {
  method: 'PUT',
  body: file
});
```

**Confirm Upload**
```http
POST /upload/s3/presigned/single/confirm
Content-Type: application/json

{
  "fileUrl": "https://..."
}
```

**Generate Pre-signed URLs (Multiple)**
```http
POST /upload/s3/presigned/multiple
Content-Type: application/json

{
  "files": [
    { "filename": "image1.jpg", "filetype": "image/jpeg" },
    { "filename": "image2.png", "filetype": "image/png" }
  ]
}
```

**Confirm Multiple Uploads**
```http
POST /upload/s3/presigned/multiple/confirm
Content-Type: application/json

{
  "fileUrls": ["https://...", "https://..."]
}
```

### Cloudinary Upload

**Upload Single File**
```http
POST /upload/cloudinary/single
Content-Type: multipart/form-data

FormData: file
```

**Upload Multiple Files**
```http
POST /upload/cloudinary/multiple
Content-Type: multipart/form-data

FormData: files (array)
```

### Local Storage Upload

**Upload Single File**
```http
POST /upload/local/single
Content-Type: multipart/form-data

FormData: file
```

**Upload Multiple Files**
```http
POST /upload/local/multiple
Content-Type: multipart/form-data

FormData: files (array)
```

### Retrieve Files

**Get All S3 Files**
```http
GET /upload/s3/files

Response:
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "...",
      "file": "https://...",
      "files": [],
      "type": "normal" | "presigned",
      "createdAt": "2024-01-31T..."
    }
  ]
}
```

**Get All Cloudinary Files**
```http
GET /upload/cloudinary/files
```

**Get All Local Files**
```http
GET /upload/local/files
```

---

## Database Models

### S3BucketFiles Schema
```javascript
{
  file: String,              // Single file URL
  files: [String],           // Multiple file URLs
  type: {                    // Upload method
    type: String,
    enum: ['normal', 'presigned'],
    default: 'normal'
  },
  createdAt: Date,
  updatedAt: Date
}
```

### CloudinaryFiles Schema
```javascript
{
  file: String,
  files: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### LocalFiles Schema
```javascript
{
  file: String,
  files: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Logging

The application uses **Winston** for comprehensive logging:

### Log Files
- `server/logs/combined.log` - All requests and responses
- `server/logs/error.log` - Errors only

### Logged Information
- HTTP method and URL
- Request body and query parameters
- Response status and data
- Request duration
- Error stack traces

### Log Format
```json
{
  "level": "info",
  "message": "Incoming Request",
  "method": "POST",
  "path": "/upload/s3/single",
  "body": {},
  "headers": {},
  "timestamp": "2024-01-31 12:00:00"
}
```

---

## Pre-signed URL Upload Workflow

### How It Works

1. **Client requests pre-signed URL** from backend
   ```javascript
   POST /upload/s3/presigned/single
   { filename: "image.jpg", filetype: "image/jpeg" }
   ```

2. **Backend generates pre-signed URL** using AWS SDK
   - Creates unique filename with timestamp
   - Generates temporary URL (valid for 5 minutes)
   - Returns both pre-signed and public URLs

3. **Client uploads directly to S3** using the pre-signed URL
   ```javascript
   fetch(presignedUrl, {
     method: 'PUT',
     body: file
   })
   ```

4. **Client confirms upload** with backend
   ```javascript
   POST /upload/s3/presigned/single/confirm
   { fileUrl: "https://..." }
   ```

5. **Backend saves to database** with type: "presigned"

### Benefits
- **Reduced server load** - Files upload directly to S3
- **Better performance** - No file passes through server
- **Scalability** - Server only generates URLs
- **Security** - Time-limited, one-time-use URLs

---

## Troubleshooting

### SignatureDoesNotMatch Error (S3)
**Cause**: Mismatch between signature and request headers

**Solution**: Ensure Content-Type is NOT included in the pre-signed URL request:
```javascript
// ✓ Correct
fetch(presignedUrl, {
  method: 'PUT',
  body: file
});

// ✗ Wrong
fetch(presignedUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': 'image/jpeg' }  // Don't add this!
});
```

### CORS Errors
**Cause**: S3 bucket doesn't allow browser requests

**Solution**: Add CORS configuration to your S3 bucket (see S3 Configuration section)

### Environment Variables Not Loading
**Cause**: Spaces or quotes in `.env` file

**Solution**: 
```env
# ✓ Correct
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE

# ✗ Wrong
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
```

### MongoDB Connection Failed
**Cause**: MongoDB not running or wrong URI

**Solution**: 
```bash
# Start MongoDB
mongod

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

---

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Multer** - File upload middleware
- **multer-s3** - S3 upload integration
- **@aws-sdk/client-s3** - AWS SDK v3
- **@aws-sdk/s3-request-presigner** - Pre-signed URL generation
- **Cloudinary** - Media management
- **Winston** - Logging
- **dotenv** - Environment variables
- **cors** - Cross-origin requests

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Axios** - HTTP client
- **Fetch API** - S3 direct uploads

---

## Future Enhancements

- [ ] User authentication and authorization
- [ ] File deletion functionality
- [ ] Progress bars for uploads
- [ ] Drag and drop interface
- [ ] Image compression before upload
- [ ] File preview before upload
- [ ] Download functionality
- [ ] Admin dashboard
- [ ] File renaming
- [ ] Folder organization
- [ ] Search and filter uploaded files
- [ ] Upload analytics and statistics

---

## License

MIT License

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Support

For issues and questions, please open an issue on GitHub.
