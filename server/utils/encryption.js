const KEY = 'provexa_secure_payload_encryption_key_2026';

function rc4(key, str) {
  let s = [], j = 0, x, res = '';
  for (let i = 0; i < 256; i++) {
    s[i] = i;
  }
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

function encryptPayload(data) {
  if (!data) return data;
  try {
    const jsonStr = JSON.stringify(data);
    // Convert UTF-16 JSON string to UTF-8 binary string representation
    const utf8Str = Buffer.from(jsonStr, 'utf8').toString('binary');
    const encrypted = rc4(KEY, utf8Str);
    return Buffer.from(encrypted, 'binary').toString('base64');
  } catch (err) {
    console.error('Encryption failed:', err);
    return data;
  }
}

function decryptPayload(base64Str) {
  if (!base64Str) return base64Str;
  try {
    const encrypted = Buffer.from(base64Str, 'base64').toString('binary');
    const utf8Str = rc4(KEY, encrypted);
    // Convert UTF-8 binary string representation back to UTF-16 JSON string
    return JSON.parse(Buffer.from(utf8Str, 'binary').toString('utf8'));
  } catch (err) {
    console.error('Decryption failed:', err);
    return base64Str;
  }
}

module.exports = {
  encryptPayload,
  decryptPayload
};
