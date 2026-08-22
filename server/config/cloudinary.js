const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const certStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'provexa/certificates',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
  },
});

const evidenceStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'provexa/evidence',
    resource_type: 'auto',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
  },
});

module.exports = { cloudinary, certStorage, evidenceStorage };
