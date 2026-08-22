const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Check if Cloudinary is configured
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

/**
 * Uploads a file buffer (like generated PDF) to Cloudinary or falls back to local disk storage.
 * Returns the file URL.
 */
async function uploadFileBuffer(buffer, fileName, folder = 'certificates') {
  if (isCloudinaryConfigured) {
    try {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `provexa/${folder}`,
            resource_type: 'raw',
            public_id: fileName.replace(/\.[^/.]+$/, ""), // remove extension
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(buffer);
      });
    } catch (err) {
      console.warn('⚠️ Cloudinary upload failed, falling back to local storage:', err.message);
    }
  }

  // Fallback to local storage
  const uploadDir = path.join(__dirname, '..', 'public', 'uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, buffer);

  const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${serverUrl}/uploads/${folder}/${fileName}`;
}

module.exports = { uploadFileBuffer, isCloudinaryConfigured };
