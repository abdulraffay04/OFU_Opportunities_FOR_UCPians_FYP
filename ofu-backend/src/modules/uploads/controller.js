// This file handles incoming file upload requests and sends responses.
// It connects the routes to the upload service functions.

const uploadsService = require('./service');
const { success, error } = require('../../utils/responseHelper');

// Upload a resume PDF file
async function uploadResume(req, res, next) {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return error(res, 'No file uploaded', 400);
    }

    // Get the user's uid from the authenticate middleware
    const userId = req.user.uid;

    // Log file details for debugging
    console.log('File received:');
    console.log('Original name:', req.file.originalname);
    console.log('Mimetype:', req.file.mimetype);
    console.log('Size:', req.file.size);

    // Get the file buffer and original name from multer
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    // Upload the file to Cloudinary
    const result = await uploadsService.uploadResume(fileBuffer, fileName, userId);

    console.log('Upload result:', result);

    return success(res, {
      url: result.url,
      publicId: result.publicId,
      fileName: req.file.originalname,
    }, 201);
  } catch (err) {
    console.log('Upload controller error:', err.message);
    next(err);
  }
}

// Upload a profile picture image
async function uploadProfilePicture(req, res, next) {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return error(res, 'No file uploaded', 400);
    }

    // Get the user's uid from the authenticate middleware
    const userId = req.user.uid;

    // Get the file buffer and original name from multer
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    // Upload the image to Cloudinary
    const result = await uploadsService.uploadProfilePicture(fileBuffer, fileName, userId);

    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
}

// Delete a file from Cloudinary
async function deleteFile(req, res, next) {
  try {
    // Get the public ID from the request body
    const publicId = req.body.publicId;

    if (!publicId) {
      return error(res, 'Public ID is required', 400);
    }

    // Delete the file from Cloudinary
    const deleted = await uploadsService.deleteFile(publicId);

    if (!deleted) {
      return error(res, 'Failed to delete file', 500);
    }

    return success(res, { message: 'File deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadResume,
  uploadProfilePicture,
  deleteFile,
};
