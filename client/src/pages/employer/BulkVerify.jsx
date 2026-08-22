import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import UploadZone from '../../components/UploadZone';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function BulkVerify() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Upload a CSV/Excel file first');
    setLoading(true);
    setResults(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/employer/verify/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(res.data.data);
      toast.success(`Verification complete: ${res.data.total} records verified`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResults(null);
    toast.success('Form and results cleared');
  };

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Bulk Verification</h2>
        <p className="text-sm text-gray-500 mt-1">Upload a list of Certificate IDs to verify them in batch</p>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload list of Certificate IDs</label>
            {file ? (
              <div className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-700 font-semibold">{file.name}</span>
                <button onClick={() => setFile(null)} className="text-xs text-red-600 hover:underline">Remove</button>
              </div>
            ) : (
              <UploadZone onFileSelect={setFile} label="Upload Excel / CSV file" />
            )}
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 text-xs text-purple-700 border border-purple-100">
            <p className="font-semibold mb-1">Expected Format:</p>
            <p>Single column file with heading <code className="font-mono bg-white bg-opacity-50 px-1 rounded border">certId</code> or <code className="font-mono bg-white bg-opacity-50 px-1 rounded border">Certificate ID</code> containing the IDs to verify.</p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={handleClear} disabled={loading || (!file && !results)} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm bg-white font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
              Clear Uploads
            </button>
            <button type="submit" disabled={loading || !file} className="flex-1 btn-primary bg-provexa-purple hover:bg-purple-800 disabled:opacity-60">
              {loading ? 'Verifying Batch...' : 'Verify Batch'}
            </button>
          </div>
        </form>

        {/* Results */}
        {results && (
          <div className="border border-gray-200 rounded-xl overflow-hidden mt-6">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-800 text-sm">Batch Results</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Cert ID', 'Student Name', 'Course', 'Institution', 'Result'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-provexa-navy">{r.certId || '—'}</td>
                      <td className="px-4 py-3">{r.studentName}</td>
                      <td className="px-4 py-3 text-gray-600">{r.course}</td>
                      <td className="px-4 py-3 text-gray-600">{r.institution}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.result} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
