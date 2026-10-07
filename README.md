# PROVEXA - Academic Certificate Verification Platform

PROVEXA is a tamperproof digital academic certificate verification platform that allows institutions to issue, manage and revoke certificates while enabling employers and students to verify credentials instantly using a unique Certificate ID or QR code.

## Live Demo

Backend API: https://provexa-api.onrender.com

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, TailwindCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Tokens) |
| File Storage | Cloudinary |
| Email | Brevo SMTP API |
| QR Code | qrcode npm package |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## Features

- Institution dashboard to issue single and bulk certificates via Excel upload
- Unique Certificate ID (e.g. PRVX-XXXXXX) linking all certificates of a student
- QR code generation for each certificate
- Employer portal to verify by ID or QR scan
- Student portal for self verification
- Public verify page without login
- OTP based authentication for students and employers
- Certificate revocation management
- Verification history with audit trail
- Admin panel for institution approval and management

---

## Setup Instructions

### Prerequisites
- Node.js v18 or above
- MongoDB Atlas account
- Cloudinary account
- Brevo account for email

### 1. Clone the Repository

```bash
git clone https://github.com/raki1693/Provexa-new.git
cd Provexa-new
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your_brevo_email
EMAIL_PASS=your_brevo_smtp_key
EMAIL_FROM=PROVEXA <your_email>

ADMIN_SETUP_KEY=your_admin_setup_key
```

Start the backend:
```bash
node index.js
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file inside the `client` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

---

## Architecture

```
Client (React + Vite)
        |
        | HTTP REST API
        v
Server (Node.js + Express)
        |
   _____|_____
  |           |
MongoDB    Cloudinary
Atlas      (File Storage)
```

---

## Documentation & Testing

- **Technical Design Document**: [TECHNICAL_DESIGN.md](TECHNICAL_DESIGN.md) (Architecture diagrams, data flows, and schemas)
- **Sample Data & Test Cases**: [sample_data/](sample_data/) (Sample certificate CSV and functional test cases)

---

## License

MIT License. See [LICENSE](LICENSE) file for details.
