# File Upload System

A complete file upload system with Node.js backend and React.js frontend supporting AWS S3, Cloudinary, and local storage.

## 🚀 Features

- **Multiple Upload Destinations**: AWS S3, Cloudinary, and Local Storage
- **Single & Multiple File Support**: Each destination supports both single and multiple file uploads
- **File Type Validation**: Only images (jpg, jpeg, png, webp) and PDFs allowed
- **MongoDB Storage**: Automatically stores file URLs/paths in MongoDB with proper schema
- **Modern UI**: Beautiful, responsive React interface with real-time feedback
- **Error Handling**: Comprehensive error handling on both frontend and backend

## 📁 Project Structure

```
fileUpload/
├── server/                  # Backend (Node.js/Express)
│   ├── config/             # Configuration files
│   │   ├── aws.js         # AWS S3 configuration
│   │   ├── cloudinary.js  # Cloudinary configuration
│   │   └── database.js    # MongoDB connection
│   ├── controllers/        # Route controllers
│   │   ├── s3Controller.js
│   │   ├── cloudinaryController.js
│   │   └── localController.js
│   ├── middleware/         # Express middleware
│   │   ├── fileValidation.js
│   │   └── upload.js      # Multer configuration
│   ├── models/            # Mongoose models
│   │   ├── s3BucketFiles.js
│   │   ├── cloudinaryFiles.js
│   │   └── localFiles.js
│   ├── routes/            # API routes
│   │   └── uploadRoutes.js
│   ├── uploads/           # Local file storage (created automatically)
│   ├── .env.example       # Environment variables template
│   ├── package.json
│   └── server.js          # Main server file
│
└── client/                # Frontend (React.js)
    ├── src/
    │   ├── components/
    │   │   ├── FileUpload.jsx
    │   │   └── FileUpload.css
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or cloud)
- AWS S3 account (for S3 uploads)
- Cloudinary account (for Cloudinary uploads)

### Backend Setup

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (edit `.env`):
   ```env
   PORT=5050
   MONGODB_URI=mongodb://localhost:27017/fileupload

   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=your_bucket_name

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

6. **Start the server**:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

Server will run on `http://localhost:5050`

### Frontend Setup

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

Client will run on `http://localhost:3000`

## 📡 API Endpoints

### S3 Upload Endpoints

- **POST** `/upload/s3/single` - Upload single file to S3
  - Body: `FormData` with `file` field
  
- **POST** `/upload/s3/multiple` - Upload multiple files to S3
  - Body: `FormData` with `files` field (array)

### Cloudinary Upload Endpoints

- **POST** `/upload/cloudinary/single` - Upload single file to Cloudinary
  - Body: `FormData` with `file` field
  
- **POST** `/upload/cloudinary/multiple` - Upload multiple files to Cloudinary
  - Body: `FormData` with `files` field (array)

### Local Storage Upload Endpoints

- **POST** `/upload/local/single` - Upload single file locally
  - Body: `FormData` with `file` field
  
- **POST** `/upload/local/multiple` - Upload multiple files locally
  - Body: `FormData` with `files` field (array)

## 📊 MongoDB Models

### S3BucketFiles Model
```javascript
{
  file: String,        // Single file URL
  files: [String],     // Multiple file URLs
  timestamps: true
}
```

### CloudinaryFiles Model
```javascript
{
  file: String,        // Single file URL
  files: [String],     // Multiple file URLs
  timestamps: true
}
```

### LocalFiles Model
```javascript
{
  file: String,        // Single file path
  files: [String],     // Multiple file paths
  timestamps: true
}
```

## ✨ Usage

1. Start both server and client as described above
2. Open browser to `http://localhost:3000`
3. Choose one of the 6 upload sections
4. Select file(s) (only images or PDFs)
5. Click "Upload" button
6. See success/error messages in real-time

## 🔒 File Type Restrictions

Only the following file types are accepted:
- **Images**: JPG, JPEG, PNG, WEBP
- **Documents**: PDF

Any other file type will be rejected with an error message.

## 🎨 Features Breakdown

### Backend
- ✅ Express.js REST API
- ✅ MongoDB with Mongoose ODM
- ✅ AWS S3 integration with multer-s3
- ✅ Cloudinary SDK integration
- ✅ Local file storage with multer
- ✅ File type validation middleware
- ✅ Comprehensive error handling
- ✅ CORS enabled for frontend
- ✅ 10MB file size limit

### Frontend
- ✅ React.js with modern hooks
- ✅ 6 distinct upload sections
- ✅ File type validation before upload
- ✅ Real-time upload progress
- ✅ Success/error message display
- ✅ Responsive design
- ✅ Modern gradients and animations
- ✅ Disabled state during upload

## 🚨 Important Notes

- Make sure MongoDB is running before starting the server
- Configure AWS S3 bucket permissions to allow public read access
- Set Cloudinary folder permissions as needed
- Local uploads are stored in `server/uploads/` directory
- Maximum file size: 10MB per file
- Maximum files in multiple upload: 10 files

## 📝 License

MIT

---

Built with ❤️ using Node.js, Express, MongoDB, React, AWS S3, and Cloudinary
