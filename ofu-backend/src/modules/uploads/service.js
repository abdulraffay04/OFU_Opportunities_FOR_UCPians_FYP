// This file handles file uploads to Cloudinary.
// It provides functions to upload resumes, profile pictures, and delete files.

const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log('Cloudinary configured for:', process.env.CLOUDINARY_CLOUD_NAME);

// Upload a resume PDF to Cloudinary using stream upload
async function uploadResume(fileBuffer, fileName, userId) {
  try {
    console.log('Uploading resume:', fileName, 'for user:', userId);

    // Clean the filename — remove spaces and special chars
    var cleanFileName = fileName
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '');

    // Build the public_id with folder path embedded
    var publicId = 'ofu-resumes/' + userId + '/' + Date.now() + '_' + cleanFileName.replace('.pdf', '');

    var uploadResult = await new Promise(function (resolve, reject) {
      var uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          type: 'upload',
          access_mode: 'public',
          public_id: publicId,
          format: 'pdf',
          overwrite: true,
          invalidate: true,
        },
        function (error, result) {
          if (error) {
            console.log('Upload error:', error);
            reject(error);
            return;
          }
          resolve(result);
        }
      );

      // Pipe the file buffer into the upload stream
      var bufferStream = new Readable();
      bufferStream.push(fileBuffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });

    console.log('Upload successful');
    console.log('Public ID:', uploadResult.public_id);
    console.log('Format:', uploadResult.format);
    console.log('URL:', uploadResult.secure_url);

    // Return the URL exactly as Cloudinary provides it — no transforms
    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };

  } catch (error) {
    console.log('uploadResume error:', error);
    throw error;
  }
}

// Upload a profile picture to Cloudinary
async function uploadProfilePicture(fileBuffer, fileName, userId) {
  // Convert the file buffer to a base64 data URI string
  const base64String = fileBuffer.toString('base64');
  const dataUri = 'data:image/png;base64,' + base64String;

  // Upload the image to Cloudinary with transformation
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'ofu-profiles/' + userId,
    public_id: fileName,
    resource_type: 'image',
    transformation: [
      { width: 400, height: 400, crop: 'fill' },
    ],
  });

  // Return the URL and public ID
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

// Delete a file from Cloudinary using its public ID
async function deleteFile(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (deleteError) {
    console.error('Error deleting file from Cloudinary:', deleteError);
    return false;
  }
}

module.exports = {
  uploadResume,
  uploadProfilePicture,
  deleteFile,
};
