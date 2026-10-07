# PROVEXA Test Cases

## TC01 - Student Registration
- Input: Valid name, email, password
- Expected: OTP sent to email, account created after OTP verification
- Result: PASS

## TC02 - Institution Certificate Issuance
- Input: Student details via form
- Expected: Certificate created with unique certId, QR code generated
- Result: PASS

## TC03 - Employer Verification by ID
- Input: Valid certId (e.g. PRVX-6FQJ5FHR)
- Expected: All linked certificates returned with student details
- Result: PASS

## TC04 - Invalid Certificate Verification
- Input: Non-existent certId (e.g. PRVX-INVALID)
- Expected: Error message "Certificate not found"
- Result: PASS

## TC05 - Bulk Certificate Upload
- Input: Excel file with 3 student records
- Expected: 3 certificates created, certIds assigned
- Result: PASS

## TC06 - Certificate Revocation
- Input: Institution revokes a certificate
- Expected: Certificate marked as revoked, verification returns "Revoked" status
- Result: PASS

## TC07 - OTP Wrong Entry Animation
- Input: Wrong OTP entered
- Expected: Input boxes turn red, shake animation triggered
- Result: PASS

## TC08 - Clear Verification History
- Input: Employer clicks Clear History button
- Expected: All verification logs deleted for that employer
- Result: PASS
