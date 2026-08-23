require('dotenv').config();
require('express-async-errors');

const fs = require('fs');
const path = require('path');

// Auto-copy uploaded logo asset to client & server public folders on server boot
try {
  const srcLogo = 'C:/Users/nanda/.gemini/antigravity/brain/3bf5b750-0611-4f75-b7df-7aa681acbda1/.user_uploaded/media_1787425177409.jpg';
  const clientDest = 'C:/Users/nanda/.gemini/antigravity/scratch/provexa/client/public/logo.jpg';
  const serverDest = 'C:/Users/nanda/.gemini/antigravity/scratch/provexa/server/public/uploads/logo.jpg';

  if (fs.existsSync(srcLogo)) {
    fs.mkdirSync('C:/Users/nanda/.gemini/antigravity/scratch/provexa/client/public', { recursive: true });
    fs.mkdirSync('C:/Users/nanda/.gemini/antigravity/scratch/provexa/server/public/uploads', { recursive: true });
    fs.copyFileSync(srcLogo, clientDest);
    fs.copyFileSync(srcLogo, serverDest);
    console.log('✅ Logo deployed successfully to client and server public directories!');
  }
} catch (err) {
  console.error('❌ Failed to deploy logo asset:', err);
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const publicRoutes = require('./routes/public.routes');
const studentRoutes = require('./routes/student.routes');
const institutionRoutes = require('./routes/institution.routes');
const employerRoutes = require('./routes/employer.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const { encryptPayload, decryptPayload } = require('./utils/encryption');

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Payload Decryption & Response Encryption Middleware
app.use((req, res, next) => {
  // Decrypt incoming request payload if encrypted
  if (req.body && req.body.encryptedData) {
    try {
      req.body = decryptPayload(req.body.encryptedData);
    } catch (err) {
      console.error('Failed to decrypt request body:', err);
      return res.status(400).json({ success: false, message: 'Invalid payload encoding' });
    }
  }

  // Intercept and encrypt outgoing JSON response payload
  const originalJson = res.json;
  res.json = function (body) {
    // Skip encryption for health check route, debug route, or if it is already encrypted
    if (req.path === '/api/health' || req.path === '/api/public/debug-smtp' || (body && body.encryptedData)) {
      return originalJson.call(this, body);
    }
    if (body && typeof body === 'object') {
      try {
        const encrypted = encryptPayload(body);
        return originalJson.call(this, { encryptedData: encrypted });
      } catch (err) {
        console.error('Failed to encrypt response body:', err);
        return originalJson.call(this, body);
      }
    }
    return originalJson.call(this, body);
  };

  next();
});

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PROVEXA API is running', timestamp: new Date() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Self-ping to prevent Render free-tier sleep (runs every 12 minutes)
const https = require('https');
const BACKEND_URL = process.env.BACKEND_URL || 'https://provexa-api.onrender.com';
setInterval(() => {
  https.get(`${BACKEND_URL}/api/health`, (res) => {
    console.log(`Self-ping sent. Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('Self-ping error:', err.message);
  });
}, 12 * 60 * 1000); // 12 minutes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 PROVEXA Server running on port ${PORT}`);
});
