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

export function encryptPayload(data) {
  if (!data) return data;
  try {
    const jsonStr = JSON.stringify(data);
    const utf8Str = unescape(encodeURIComponent(jsonStr));
    const encrypted = rc4(KEY, utf8Str);
    return btoa(encrypted);
  } catch (err) {
    console.error('Encryption failed:', err);
    return data;
  }
}

export function decryptPayload(base64Str) {
  if (!base64Str) return base64Str;
  try {
    const encrypted = atob(base64Str);
    const utf8Str = rc4(KEY, encrypted);
    const jsonStr = decodeURIComponent(escape(utf8Str));
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Decryption failed:', err);
    return base64Str;
  }
}
