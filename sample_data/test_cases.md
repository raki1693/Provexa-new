# PROVEXA - Test Cases Specification

This document details functional and security test cases for the PROVEXA Academic Certificate Verification Platform.

---

## 1. Authentication & Authorization Test Cases

| Test ID | Test Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| TC-AUTH-01 | User Registration | 1. Enter valid name, email, password, role.<br>2. Submit form. | User account created, OTP sent via email service, status pending verification. | Pass |
| TC-AUTH-02 | OTP Verification (Valid) | 1. Enter correct 6-digit OTP received in email. | User account verified, redirect to role dashboard, JWT token issued. | Pass |
| TC-AUTH-03 | OTP Verification (Invalid) | 1. Enter incorrect OTP digits. | Visual shake animation with red outline, error message displayed. | Pass |
| TC-AUTH-04 | Role-Based Access Control | 1. Attempt accessing `/institution/dashboard` with Employer token. | HTTP 403 Forbidden, user redirected to Employer home. | Pass |
| TC-AUTH-05 | Backdoor Portal Protection | 1. Tap logo 5 times.<br>2. Enter secure PIN `965216`. | Hidden institution and admin portal access shortcuts revealed. | Pass |

---

## 2. Certificate Issuance Test Cases

| Test ID | Test Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| TC-ISS-01 | Single Certificate Issue | 1. Institution enters student name, roll number, course, year, CGPA.<br>2. Upload certificate PDF.<br>3. Submit. | Unique Cert ID generated (e.g. `PRVX-XXXXXX`), QR code created, certificate saved to MongoDB and Cloudinary. | Pass |
| TC-ISS-02 | Student ID Reuse (Multi-Certificate Link) | 1. Issue another certificate for the same student email/roll number. | System recognizes existing student and links new certificate under the same Cert ID. | Pass |
| TC-ISS-03 | Bulk Certificate Upload | 1. Upload `sample_certificates.csv` via Bulk Issuance interface. | All valid rows parsed, certificates generated with linked IDs, batch report rendered. | Pass |
| TC-ISS-04 | Certificate Revocation | 1. Institution clicks Revoke on active certificate with reason. | Certificate status updated to `isRevoked: true`, immediate reflection in verification endpoints. | Pass |

---

## 3. Verification Test Cases

| Test ID | Test Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| TC-VER-01 | Employer Verification by ID | 1. Employer enters valid Cert ID (`PRVX-6FQJ5FHR`). | All linked certificates for that student returned with valid badge; audit log recorded. | Pass |
| TC-VER-02 | Verification of Revoked Certificate | 1. Enter Cert ID of a revoked certificate. | Red `Revoked` status banner displayed with revocation reason and date. | Pass |
| TC-VER-03 | Verification of Non-Existent ID | 1. Enter invalid or tampered Cert ID. | "Certificate Not Found / Invalid" alert displayed, logged in audit history as Invalid. | Pass |
| TC-VER-04 | QR Code Scan Verification | 1. Scan generated QR code using mobile device or webcam scanner. | Direct navigation to public verification endpoint; instant certificate authenticity display. | Pass |
| TC-VER-05 | Clear Verification History | 1. Employer clicks "Clear History" in Verification History dashboard.<br>2. Confirm dialog. | All verification audit logs for this employer deleted; empty state displayed. | Pass |

---

## 4. Performance & Reliability Test Cases

| Test ID | Test Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| TC-PRF-01 | Verification Response Latency | Measure round-trip time for single Cert ID query. | Latency under 400ms under normal load. | Pass |
| TC-PRF-02 | Document Retrieval | Access certificate PDF URL from Cloudinary. | File served with valid MIME type and HTTPS SSL encryption. | Pass |
