const crypto = require('crypto');

/**
 * Hash a Buffer (e.g. file contents) using SHA-256
 */
function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Hash a string using SHA-256
 */
function hashString(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

/**
 * Hash certificate data object (deterministic JSON stringify)
 */
function hashCertData(certData) {
  const normalized = JSON.stringify({
    certId: certData.certId,
    studentEmail: certData.studentEmail,
    studentName: certData.studentName,
    course: certData.course,
    degree: certData.degree,
    grade: certData.grade,
    issueDate: certData.issueDate,
    institutionName: certData.institutionName,
  });
  return hashString(normalized);
}

module.exports = { hashBuffer, hashString, hashCertData };
