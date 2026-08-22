const XLSX = require('xlsx');

/**
 * Parse an Excel/CSV buffer into an array of row objects.
 * Expected columns: studentEmail, studentName, rollNumber, course, degree,
 *                   specialization, grade, percentage, certType, issueDate
 */
function parseExcelBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return data;
}

const VALID_CERT_TYPES = ['Degree', 'Marksheet', 'Migration', 'Achievement', 'Other'];

/**
 * Validate a single row from the Excel sheet.
 * Returns array of error strings (empty if valid).
 */
function validateRow(row) {
  const errors = [];
  if (!row.studentEmail || !String(row.studentEmail).includes('@'))
    errors.push('Valid studentEmail is required');
  if (!row.studentName || String(row.studentName).trim() === '')
    errors.push('studentName is required');
  if (!row.course || String(row.course).trim() === '')
    errors.push('course is required');
  if (!row.certType || !VALID_CERT_TYPES.includes(row.certType))
    errors.push(`certType must be one of: ${VALID_CERT_TYPES.join(', ')}`);
  if (!row.issueDate)
    errors.push('issueDate is required');
  return errors;
}

/**
 * Generate a template CSV buffer for download
 */
function generateTemplateCsv() {
  const headers = [
    'studentEmail', 'studentName', 'rollNumber', 'course', 'degree',
    'specialization', 'grade', 'percentage', 'certType', 'issueDate'
  ];
  const exampleRow = [
    'student@example.com', 'John Doe', 'ROLL001', 'Computer Science',
    'B.Tech', 'AI & ML', 'A+', '85', 'Degree', '2024-05-15'
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  XLSX.utils.book_append_sheet(wb, ws, 'Certificates');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = { parseExcelBuffer, validateRow, generateTemplateCsv };
