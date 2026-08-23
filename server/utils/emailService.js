const https = require('https');

console.log('📬 [Brevo API Diagnostics] Configured variables on startup:');
console.log(`- User: ${process.env.EMAIL_USER || 'Not Defined'}`);
console.log(`- Key Length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0}`);
console.log(`- From: ${process.env.EMAIL_FROM || 'PROVEXA <kits.guntur.ac@gmail.com>'}`);

const baseStyle = `
  font-family: 'Inter', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
`;
const headerStyle = `
  background: linear-gradient(135deg, #1B4F72, #2E86C1);
  padding: 24px 32px;
  color: white;
  text-align: center;
`;
const bodyStyle = `padding: 32px;`;
const footerStyle = `
  background: #F4F6F7;
  padding: 16px 32px;
  text-align: center;
  font-size: 12px;
  color: #666;
`;

function wrapEmail(title, body) {
  return `
    <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="margin:0;font-size:24px;letter-spacing:2px;">🛡️ PROVEXA</h1>
        <p style="margin:4px 0 0;font-size:13px;opacity:0.85;">Authenticity Validator for Academia</p>
      </div>
      <div style="${bodyStyle}">
        <h2 style="color:#1B4F72;margin-top:0;">${title}</h2>
        ${body}
      </div>
      <div style="${footerStyle}">
        © 2026 PROVEXA | Developed by Rakesh Vepuri<br/>
        This is an automated email. Please do not reply.
      </div>
    </div>
  `;
}

async function sendEmail(to, subject, htmlContent) {
  const apiKey = process.env.EMAIL_PASS;
  const senderEmail = process.env.EMAIL_USER || 'kits.guntur.ac@gmail.com';

  if (!apiKey) {
    console.error('❌ Brevo API key is not configured in EMAIL_PASS environment variable');
    return;
  }

  const postData = JSON.stringify({
    sender: { name: 'PROVEXA', email: senderEmail },
    to: [{ email: to }],
    subject: subject,
    htmlContent: htmlContent,
  });

  const options = {
    hostname: 'api.brevo.com',
    port: 443,
    path: '/v3/smtp/email',
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => { responseBody += chunk; });
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`✅ OTP Email successfully dispatched via Brevo REST API to: ${to}`);
      } else {
        console.error(`❌ Brevo API Error (Status ${res.statusCode}):`, responseBody);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Brevo API Connection Error:', err.message);
  });

  req.write(postData);
  req.end();
}

async function sendOTPEmail(to, otp, name) {
  const html = wrapEmail('Email Verification', `
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your PROVEXA verification OTP is:</p>
    <div style="text-align:center;margin:24px 0;">
      <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1B4F72;">${otp}</span>
    </div>
    <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
  `);
  await sendEmail(to, 'PROVEXA — Email Verification OTP', html);
}

async function sendCertIssuedEmail(to, name, certId, courseName, institutionName) {
  const html = wrapEmail('Certificate Issued 🎓', `
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your academic certificate has been issued by <strong>${institutionName}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px;background:#F4F6F7;font-weight:600;">Certificate ID</td>
          <td style="padding:8px;font-family:monospace;font-weight:700;color:#1B4F72;">${certId}</td></tr>
      <tr><td style="padding:8px;background:#F4F6F7;font-weight:600;">Course</td>
          <td style="padding:8px;">${courseName}</td></tr>
    </table>
    <p>Log in to your PROVEXA student portal to view, download, and share your certificate.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.CLIENT_URL}/student/dashboard"
         style="background:#1B4F72;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">
        View My Certificate
      </a>
    </div>
  `);
  await sendEmail(to, `PROVEXA — Certificate Issued: ${certId}`, html);
}

async function sendCertRevokedEmail(to, name, certId, reason) {
  const html = wrapEmail('Certificate Revoked ⚠️', `
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your certificate <strong style="font-family:monospace;">${certId}</strong> has been <span style="color:#922B21;font-weight:700;">revoked</span>.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>If you believe this is an error, please contact your institution or raise a concern through the PROVEXA portal.</p>
  `);
  await sendEmail(to, `PROVEXA — Certificate Revoked: ${certId}`, html);
}

async function sendComplaintUpdateEmail(to, complaintId, status, note) {
  const statusColors = { resolved: '#1E8449', rejected: '#922B21', under_review: '#D4AC0D' };
  const color = statusColors[status] || '#2E86C1';
  const html = wrapEmail('Complaint Update 📋', `
    <p>Your complaint <strong>#${complaintId}</strong> has been updated.</p>
    <p>Status: <span style="color:${color};font-weight:700;">${status.replace('_', ' ').toUpperCase()}</span></p>
    ${note ? `<p><strong>Admin Note:</strong> ${note}</p>` : ''}
    <p>Log in to your PROVEXA employer portal to see full details.</p>
  `);
  await sendEmail(to, `PROVEXA — Complaint Update #${complaintId}`, html);
}

async function sendInstitutionApprovedEmail(to, institutionName) {
  const html = wrapEmail('Registration Approved ✅', `
    <p>Congratulations! <strong>${institutionName}</strong> has been approved on PROVEXA.</p>
    <p>You can now log in to the Institution Portal to start issuing and managing academic certificates.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.CLIENT_URL}/institution/login"
         style="background:#1E8449;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">
        Go to Institution Portal
      </a>
    </div>
  `);
  await sendEmail(to, 'PROVEXA — Institution Registration Approved', html);
}

async function sendInstitutionRejectedEmail(to, institutionName, reason) {
  const html = wrapEmail('Registration Update', `
    <p>We regret to inform you that the registration of <strong>${institutionName}</strong> on PROVEXA has been <span style="color:#922B21;font-weight:700;">rejected</span>.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>You may contact the PROVEXA admin team for further clarification or re-apply with correct information.</p>
  `);
  await sendEmail(to, 'PROVEXA — Institution Registration Update', html);
}

async function sendResetEmail(to, otp, name) {
  const html = wrapEmail('Password Reset OTP', `
    <p>Hello <strong>${name}</strong>,</p>
    <p>You requested to reset your password. Your reset code is:</p>
    <div style="text-align:center;margin:24px 0;">
      <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1B4F72;">${otp}</span>
    </div>
    <p>This code is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
  `);
  await sendEmail(to, 'PROVEXA — Password Reset OTP', html);
}

module.exports = {
  sendOTPEmail,
  sendCertIssuedEmail,
  sendCertRevokedEmail,
  sendComplaintUpdateEmail,
  sendInstitutionApprovedEmail,
  sendInstitutionRejectedEmail,
  sendResetEmail,
};
