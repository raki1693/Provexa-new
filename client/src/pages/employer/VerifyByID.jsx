import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { MagnifyingGlassIcon, ClipboardDocumentIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function VerifyByID() {
  const navigate = useNavigate();
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState(null);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certId.trim()) return toast.error('Enter a Certificate ID');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.get(`/employer/verify/${certId.trim()}`);
      setResult(res.data.result);
      setCerts(res.data.data || []);
    } catch {
      setResult('invalid');
      setCerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCertId('');
    setResult(null);
    setCerts([]);
    toast.success('Form cleared');
  };

  const resultStyles = {
    verified: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: '✅ VERIFIED — Certificate is authentic' },
    revoked: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: '🚫 REVOKED — Certificate has been revoked' },
    invalid: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: '❌ INVALID — No certificate found with this ID' },
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Verify by Certificate ID</h2>
        <p className="text-sm text-gray-500 mt-1">Enter a PROVEXA Certificate ID to retrieve and verify details</p>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate ID</label>
            <input
              value={certId}
              onChange={e => setCertId(e.target.value.toUpperCase())}
              className="input-field font-mono focus:ring-provexa-purple"
              placeholder="PRVX-XXXXXXXX"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClear} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm bg-white font-medium hover:bg-gray-50 transition-colors">
              Clear Fields
            </button>
            <button type="submit" disabled={loading || !certId} className="flex-1 btn-primary bg-provexa-purple hover:bg-purple-800 flex items-center justify-center gap-2">
              <MagnifyingGlassIcon className="w-5 h-5" />
              {loading ? 'Verifying...' : 'Verify Certificate'}
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            <div className={`rounded-xl p-5 border-2 ${resultStyles[result].bg} ${resultStyles[result].border}`}>
              <p className={`font-bold text-base ${resultStyles[result].text}`}>{resultStyles[result].label}</p>
            </div>

            {certs && certs.length > 0 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-bold text-gray-700 text-sm">Linked Certificates ({certs.length})</h3>
                </div>
                {certs.map((c, idx) => (
                  <div key={c._id || idx} className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-semibold text-provexa-purple text-sm">Certificate #{idx + 1} ({c.certType})</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-400">Student Name:</span> <span className="font-semibold text-gray-800">{c.studentName}</span></div>
                      <div><span className="text-gray-400">Student Email:</span> <span className="text-gray-800">{c.studentEmail}</span></div>
                      <div><span className="text-gray-400">Course Name:</span> <span className="text-gray-800">{c.course}</span></div>
                      {c.degree && <div><span className="text-gray-400">Degree:</span> <span className="text-gray-800">{c.degree}</span></div>}
                      <div><span className="text-gray-400">Institution:</span> <span className="text-gray-800">{c.institutionName}</span></div>
                      <div><span className="text-gray-400">Issue Date:</span> <span className="text-gray-800">{formatDate(c.issueDate)}</span></div>
                      {c.grade && <div><span className="text-gray-400">Grade:</span> <span className="text-gray-800">{c.grade}</span></div>}
                    </div>
                    {c.revokeReason && <p className="text-orange-700 bg-orange-100 p-2.5 rounded-lg text-xs mt-2"><strong>Revocation Reason:</strong> {c.revokeReason}</p>}
                    
                    {c.sha256Hash && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-xs text-gray-400 uppercase mb-1">SHA-256 Hash</p>
                        <div className="flex items-center gap-2 bg-white border rounded p-2">
                          <code className="text-xs text-gray-600 break-all flex-1">{c.sha256Hash}</code>
                          <button onClick={() => { navigator.clipboard.writeText(c.sha256Hash); toast.success('Hash copied'); }}>
                            <ClipboardDocumentIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
