require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

console.log("Testing SMTP connection with settings:");
console.log(`Host: ${process.env.EMAIL_HOST}`);
console.log(`Port: ${process.env.EMAIL_PORT}`);
console.log(`User: ${process.env.EMAIL_USER}`);

transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: process.env.EMAIL_USER, // Send to yourself for testing
  subject: "PROVEXA SMTP Test Alert",
  text: "Your PROVEXA SMTP service connection test is successful!"
})
.then(info => {
  console.log("✅ SMTP Connection Successful! Email sent.");
  console.log("Response ID:", info.messageId);
  process.exit(0);
})
.catch(err => {
  console.error("❌ SMTP Error occurred:");
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
});
