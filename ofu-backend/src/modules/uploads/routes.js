// This file defines the file upload API routes.
// Routes: POST /resume, POST /profile-picture, DELETE /

const express = require('express');
const router = express.Router();
const multer = require('multer');

const authenticate = require('../../middleware/authenticate');
const uploadsController = require('./controller');

// Set up multer to store files in memory (as buffers)
// This is needed because we send the file buffer directly to Cloudinary
const storage = multer.memoryStorage();

// File filter — only allow PDF files for resume uploads
var fileFilter = function (req, file, cb) {
  console.log('File mimetype:', file.mimetype);
  console.log('File originalname:', file.originalname);

  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/octet-stream' ||
    file.originalname.toLowerCase().endsWith('.pdf')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Multer for profile pictures — no PDF filter needed
const uploadImage = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// POST /api/v1/uploads/resume
// Authenticated — upload a resume PDF file
// Accepts field name "resume" OR "file" in form data
router.post(
  '/resume',
  authenticate,
  upload.single('resume'),
  uploadsController.uploadResume
);

// POST /api/v1/uploads/profile-picture
// Authenticated — upload a profile picture image
// "profilePicture" is the field name expected in the form data
router.post(
  '/profile-picture',
  authenticate,
  uploadImage.single('profilePicture'),
  uploadsController.uploadProfilePicture
);

// DELETE /api/v1/uploads
// Authenticated — delete a file from Cloudinary by its public ID
router.delete(
  '/',
  authenticate,
  uploadsController.deleteFile
);

module.exports = router;
