import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import UploadZone from '../../components/UploadZone';
import { ArrowDownTrayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function BulkIssue() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const downloadTemplate = async () => {
    try {
      const res = await api.get('/institution/certificates/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'provexa_bulk_template.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Failed to download template'); }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    toast.success('Form and uploads cleared');
  };

  const handleSubmit = async () => {
    if (!file) return toast.error('Please upload an Excel/CSV file first');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/institution/certificates/bulk-issue', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
      toast.success(`Bulk issue complete: ${res.data.data.success} issued`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk issue failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-1">Bulk Issue Certificates</h2>
      <p className="text-sm text-gray-500 mb-6">Upload an Excel or CSV file to issue certificates to multiple students at once</p>

      <div className="bg-white rounded-2xl card-shadow p-6 space-y-5">
        {/* Template download */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div>
            <p className="text-sm font-semibold text-provexa-navy">Download Template</p>
            <p className="text-xs text-gray-500">Use this template to fill in student certificate data</p>
          </div>
          <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-provexa-navy text-white text-sm font-semibold rounded-lg hover:opacity-90">
            <ArrowDownTrayIcon className="w-4 h-4" /> Template
          </button>
        </div>

        {/* Upload zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
          {file ? (
            <div className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-700 font-semibold">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-xs text-red-600 hover:underline">Remove</button>
            </div>
          ) : (
            <UploadZone onFileSelect={setFile} />
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
          <p className="font-semibold mb-1">Required columns:</p>
          <p className="font-mono text-[10px] break-all">studentEmail, studentName, rollNumber, course, degree, specialization, grade, percentage, certType, issueDate</p>
        </div>

        <div className="flex gap-3">
          <button onClick={handleClear} disabled={loading || (!file && !result)} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm bg-white font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
            Clear Uploads
          </button>
          <button onClick={handleSubmit} disabled={loading || !file} className="flex-1 btn-primary bg-provexa-green hover:bg-green-800 disabled:opacity-60">
            {loading ? 'Issuing Certificates...' : 'Issue All Certificates'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex gap-4 p-4 bg-gray-50">
              <div className="text-center"><p className="text-2xl font-black text-gray-700">{result.total}</p><p className="text-xs text-gray-400">Total</p></div>
              <div className="text-center"><p className="text-2xl font-black text-green-600">{result.success}</p><p className="text-xs text-gray-400">Issued</p></div>
              <div className="text-center"><p className="text-2xl font-black text-red-600">{result.failed}</p><p className="text-xs text-gray-400">Failed</p></div>
            </div>
            {result.errors.length > 0 && (
              <div className="p-4">
                <p className="text-sm font-semibold text-red-700 mb-2">Errors ({result.errors.length})</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex gap-2 text-xs bg-red-50 rounded p-2">
                      <span className="text-red-500 font-bold">Row {err.row}</span>
                      <span className="text-gray-600">{err.studentEmail}</span>
                      <span className="text-red-600">{err.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
