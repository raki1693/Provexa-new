const multer = require('multer');
const { certStorage, evidenceStorage } = require('../config/cloudinary');
const { isCloudinaryConfigured } = require('../utils/uploadHelper');
const path = require('path');
const fs = require('fs');

let storageCert = certStorage;
let storageEvidence = evidenceStorage;

if (!isCloudinaryConfigured) {
  const localDir = path.join(__dirname, '..', 'public', 'uploads');

  storageCert = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(localDir, 'certificates');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      cb(null, `${name}-${Date.now()}${ext}`);
    },
  });

  storageEvidence = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(localDir, 'evidence');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      cb(null, `${name}-${Date.now()}${ext}`);
    },
  });
}

// Multer instances
const uploadCert = multer({
  storage: storageCert,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed for certificates'), false);
  },
});

const uploadEv = multer({
  storage: storageEvidence,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, JPG, or PNG files are allowed for evidence'), false);
  },
});

// Middleware wrappers to convert local file paths to HTTP URLs
const uploadCertPDF = {
  single: (fieldname) => (req, res, next) => {
    uploadCert.single(fieldname)(req, res, (err) => {
      if (err) return next(err);
      if (req.file && !isCloudinaryConfigured) {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const serverUrl = process.env.SERVER_URL || `${protocol}://${host}`;
        req.file.path = `${serverUrl}/uploads/certificates/${req.file.filename}`;
      }
      next();
    });
  },
};

const uploadEvidence = {
  single: (fieldname) => (req, res, next) => {
    uploadEv.single(fieldname)(req, res, (err) => {
      if (err) return next(err);
      if (req.file && !isCloudinaryConfigured) {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const serverUrl = process.env.SERVER_URL || `${protocol}://${host}`;
        req.file.path = `${serverUrl}/uploads/evidence/${req.file.filename}`;
      }
      next();
    });
  },
};

// Excel/CSV uploads - memory storage
const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (xlsx, xls) or CSV files are allowed'), false);
    }
  },
});

// QR uploads - memory storage
const uploadQRImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed for QR upload'), false);
  },
});

module.exports = { uploadCertPDF, uploadEvidence, uploadExcel, uploadQRImage };
