const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage configuration
const createStorage = (subfolder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../../uploads', subfolder);
      createUploadDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Create unique filename: timestamp-originalname
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
      cb(null, uniqueName);
    }
  });
};

// File filter function
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    const allowedExtensions = allowedTypes || process.env.ALLOWED_EXTENSIONS?.split(',') || ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'];
    const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`), false);
    }
  };
};

// Create upload middleware for different file types
const createUpload = (subfolder, allowedTypes, maxFiles = 1) => {
  return multer({
    storage: createStorage(subfolder),
    fileFilter: fileFilter(allowedTypes),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
      files: maxFiles
    }
  });
};

// Specific upload configurations
const uploadMaterial = createUpload('materials', ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'], 1);
const uploadResume = createUpload('resumes', ['pdf', 'doc', 'docx'], 1);
const uploadEventImage = createUpload('events', ['jpg', 'jpeg', 'png'], 1);
const uploadGeneral = createUpload('general', null, 5);

module.exports = {
  uploadMaterial,
  uploadResume,
  uploadEventImage,
  uploadGeneral,
  createUpload
};
