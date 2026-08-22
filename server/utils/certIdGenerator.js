const crypto = require('crypto');
const Certificate = require('../models/Certificate');

/**
 * Generates a unique, unpredictable certificate ID in format: PRVX-XXXXXXXX
 * Uses cryptographically random bytes. Retries on collision (astronomically rare).
 */
async function generateCertId() {
  let id;
  let exists = true;

  while (exists) {
    const random = crypto
      .randomBytes(8)
      .toString('base64')
      .replace(/[^A-Z0-9]/gi, '')
      .toUpperCase()
      .slice(0, 8)
      .padEnd(8, crypto.randomBytes(1).toString('hex').toUpperCase().slice(0, 1));

    id = `PRVX-${random}`;
    exists = await Certificate.findOne({ certId: id });
  }

  return id;
}

module.exports = { generateCertId };
