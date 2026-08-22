require('dotenv').config();
const mongoose = require('mongoose');
const speakeasy = require('speakeasy');
const Admin = require('./models/Admin');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Clean up any existing admin with this email
  await Admin.deleteOne({ email: 'nandarakesh828@gmail.com' });

  const secret = speakeasy.generateSecret({
    name: `PROVEXA Admin (nandarakesh828@gmail.com)`,
    length: 20
  });

  await Admin.create({
    name: 'Super Admin',
    email: 'nandarakesh828@gmail.com',
    password: 'Rakesh1127%%',
    totpSecret: secret.base32,
    isTotpEnabled: true
  });

  console.log("\n✅ Administrator Created Successfully!");
  console.log("=================================================");
  console.log("Email:    nandarakesh828@gmail.com");
  console.log("Password: Rakesh1127%%");
  console.log("2FA Secret Key (Setup Code):", secret.base32);
  console.log("=================================================");
  console.log("How to link to Google Authenticator on your phone:");
  console.log("1. Open Google Authenticator");
  console.log("2. Tap the '+' button");
  console.log("3. Select 'Enter a setup key'");
  console.log("4. Set Account name to: PROVEXA Admin");
  console.log("5. Type the Key: " + secret.base32);
  console.log("6. Set type to 'Time-based' and click Add.");
  console.log("=================================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
