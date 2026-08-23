require('dotenv').config();
require('express-async-errors');

// Temporary debug utility to print decrypted SMTP logs on server startup
try {
  const encPayload = "TP1ThN3vgSkYD2to+aPZdOcjG48QkoRXVq92GKIHCy1lXsvspNTVECo9TLezZzFXKyy1x0rQbdOAIBfREbLKVCKCoCy4AX/Hoz+JMXkO1PZj5bi1COJjwenzZM8ke8atinBAEa6MyDiKGisorpr6YreRGmg4bsyc+qWd5Y7mQrRSQ4pFGU9bFw7FGfgBif32xELjCeJSRhHVym44/NMsljJya+Rcp4eEiM/01iJDyS41b9Z2dKFEEARo9pPTtSIoi8H9tynJTCKddyFQyH7iyQUVz913mo0dyvGh+c3KGvAQdFUe0MQBNO7KdPwmyytuqS6GbCVlkw31xlOFgiBZ0kpKuFEzzB1Yb0+NzAEkVlXlA5T5292e4TT9IryK9Gg4ZXtsfIBKPDlDXeL1GK0HcWCLI82JxOvKqISSu4naSDUPZRrXn4lWzuCZl8zabEvN5wbDBehIT6K0WRdwjsuZcyqHzYLl9pH3DoU1ZoiyCuhgFalLVkgGtTf+zW/38kWzwtVw6rrf5G75c90RdV/mc5+d4IntByrTRvWdKQzkttWBP0oPlzHVRmKQuM9OXVbxNVKG+uenaa8HBpGjV3vzpaSGAxG4rVwjSEgS5cSScn0KmtEUgUapN7nl2GhvIiDPfiDHw/Fdqu4ZeO8SQnGvMSoUUTDc1EdY+K9RHMcl/T8Ak+mOqOQgwfKqmRU7PBmdrc22eFITUXykTIuzzklXPe8rJtVRpiROj10tJuxsFHm+A1Bp+3YX5jhvmsPu/iBaStwvM4jfkZAMR0yjEBzefNH4Pfw9+kCiIaxUOFZRj/l5g3waYx0O0JAFbyJn/GkTOeuJGXQjZcflgItplNgTEjhezHHOR0sJrPIWMGooleuQGbXGWZA2YUbpxpoRIKLFGdF9IsmqH4Sg4+6zWROBCdtbsafHnOTOJVHdEv4DB7VnGbZVbdDVeUFl9bswhD801sfM73EK2AEHGiBHsyc6AaguYNqAhK8b3fu7mIi5ZKGgyLhJK5qnc/DFOtJNcrs7ki277y708WyR2kBh6DmPYn+Cm1lGhvw5orPfyn5hltNcNrmrLb7RiIpFiV6mITAOItTc+jS8zG9Ec0qbrBSuhznCjUkuis0zdwnHvTVsJXSzjZM71xZobrTmyNdt3XkeZCv5E/2SFyWTTIbdOVmy3ZW8ZDqdxttug6/td+vOOME6A5499eZx4TAzKsdA5zsv5dgR4EPHZ+TKcgORnmumrVooTWC/9tgWCSDjPpVyNpyd";
  const KEY = 'provexa_secure_payload_encryption_key_2026';
  
  function rc4(key, str) {
    let s = [], j = 0, x, res = '';
    for (let i = 0; i < 256; i++) { s[i] = i; }
    for (let i = 0; i < 256; i++) {
      j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
      x = s[i]; s[i] = s[j]; s[j] = x;
    }
    let i = 0;
    j = 0;
    for (let y = 0; y < str.length; y++) {
      i = (i + 1) % 256;
      j = (j + s[i]) % 256;
      x = s[i]; s[i] = s[j]; s[j] = x;
      res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
    }
    return res;
  }

  const encrypted = Buffer.from(encPayload, 'base64').toString('binary');
  const utf8Str = rc4(KEY, encrypted);
  const decrypted = Buffer.from(utf8Str, 'binary').toString('utf8');
  console.log("🕵️‍♂️ [DEBUG SMTP RESULT]:", decrypted);
} catch (err) {
  console.error("🕵️‍♂️ [DEBUG SMTP DECRYPT FAILED]:", err.message);
}

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
