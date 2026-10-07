# PROVEXA - Technical Design Document

## 1. System Overview

PROVEXA (Proof + Veritas + Excellence) is a web based tamperproof academic certificate verification platform. It eliminates fake certificate fraud by providing institutions a secure way to issue digital certificates and giving employers and students an instant verification mechanism.

---

## 2. Architecture Diagram

```
+------------------+       HTTPS REST API      +----------------------+
|                  | <-----------------------> |                      |
|  React.js Client |                           |  Express.js Server   |
|  (Vite + Tailwind)|                          |  (Node.js)           |
|                  |                           |                      |
+------------------+                           +----------+-----------+
                                                          |
                          +-----------------+             |
                          |  MongoDB Atlas  | <-----------+
                          |  (Database)     |             |
                          +-----------------+             |
                                                          |
                          +-----------------+             |
                          |  Cloudinary     | <-----------+
                          |  (File Storage) |             |
                          +-----------------+             |
                                                          |
                          +-----------------+             |
                          |  Brevo SMTP API | <-----------+
                          |  (Email OTP)    |
                          +-----------------+
```

---

## 3. Database Schema

### User (Student / Employer)
- name, email, phone
- role: student | employer | institution | admin
- isVerified: boolean
- otp, otpExpires

### Certificate
- certId: shared ID linking all certificates of one student
- studentName, studentEmail, rollNumber
- course, year, cgpa
- institutionId (ref: User)
- institutionName
- fileUrl (Cloudinary)
- isRevoked: boolean
- issuedAt

### VerificationLog
- employerId (ref: User)
- certId
- method: id | qr | bulk
- result: verified | revoked | invalid
- createdAt

### Complaint
- employerId or studentId
- title, description
- evidenceUrl
- status: open | resolved

---

## 4. API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify-otp
- POST /api/auth/forgot-password

### Institution
- POST /api/institution/certificates (single issue)
- POST /api/institution/certificates/bulk (Excel bulk upload)
- GET /api/institution/certificates
- PATCH /api/institution/certificates/:id/revoke

### Employer
- GET /api/employer/verify/:certId
- POST /api/employer/verify/bulk
- GET /api/employer/verification-history
- DELETE /api/employer/verification-history

### Student
- GET /api/student/certificates
- GET /api/student/verify/:certId

### Public
- GET /api/public/verify/:certId (no auth required)

### Admin
- GET /api/admin/institutions
- PATCH /api/admin/institutions/:id/approve

---

## 5. Certificate ID System

Each student is assigned one unique Certificate ID (e.g. PRVX-6FQJ5FHR) when their first certificate is issued. All subsequent certificates issued to the same student reuse the same Certificate ID. When an employer verifies by this ID, all linked certificates are returned together, giving a complete academic profile view.

---

## 6. Security

- JWT authentication with 7 day expiry
- OTP verification via Brevo SMTP for all new accounts
- Certificate IDs are randomly generated using UUID and SHA based hashing
- Admin and Institution panels are protected by secret URL keys
- File uploads validated by type and size before Cloudinary upload

---

## 7. Key User Flows

### Institution Issues Certificate
1. Institution logs in
2. Uploads student data (single form or Excel)
3. System checks if student already has a certId
4. If yes, reuses existing certId. If no, generates new certId
5. Certificate stored in MongoDB with Cloudinary file URL
6. QR code generated pointing to public verify URL

### Employer Verifies Certificate
1. Employer enters certId or scans QR code
2. Backend queries all certificates with that certId
3. Returns complete list of certificates for that student
4. Verification log recorded in database

---

## 8. Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render / Vercel Serverless |
| Database | MongoDB Atlas (Free Tier) |
| Files | Cloudinary (Free Tier) |
| Email | Brevo (Free Tier) |
