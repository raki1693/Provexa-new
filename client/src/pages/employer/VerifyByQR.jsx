import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import QRScanner from '../../components/QRScanner';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function VerifyByQR() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleScan = async (certId) => {
    if (!certId) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/employer/verify/qr', { certId });
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
    setResult(null);
    setCerts([]);
    toast.success('Results cleared');
  };

  const resultStyles = {
    verified: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: '✅ VERIFIED — Certificate is authentic' },
    revoked: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: '🚫 REVOKED — Certificate has been revoked' },
    invalid: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: '❌ INVALID — No certificate found' },
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  return (
    <div className="max-w-xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Verify by QR Code</h2>
        <p className="text-sm text-gray-500 mt-1">Scan the QR code printed on the certificate to verify instantly</p>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6 space-y-6">
        <QRScanner onScan={handleScan} />

        <div className="flex justify-center">
          <button type="button" onClick={handleClear} disabled={!result} className="py-2 px-4 border border-gray-300 rounded-lg text-sm bg-white font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
            Clear Scan Results
          </button>
        </div>

        {loading && (
          <div className="text-center py-6">
            <div className="w-8 h-8 border-4 border-provexa-purple border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Decoding and verifying certificate...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            <div className={`rounded-xl p-5 border-2 ${resultStyles[result].bg} ${resultStyles[result].border}`}>
              <p className={`font-bold text-base ${resultStyles[result].text}`}>{resultStyles[result].label}</p>
            </div>

            {certs && certs.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase px-1">Linked Certificates ({certs.length})</p>
                {certs.map((c, idx) => (
                  <div key={c._id || idx} className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b pb-1.5">
                      <span className="font-semibold text-provexa-purple">Certificate #{idx + 1} ({c.certType})</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div><span className="text-gray-400">Student:</span> <span className="font-semibold text-gray-800">{c.studentName}</span></div>
                      <div><span className="text-gray-400">Course:</span> <span className="text-gray-800">{c.course}</span></div>
                      {c.degree && <div><span className="text-gray-400">Degree:</span> <span className="text-gray-800">{c.degree}</span></div>}
                      <div><span className="text-gray-400">Institution:</span> <span className="text-gray-800">{c.institutionName}</span></div>
                      <div><span className="text-gray-400">Issue Date:</span> <span className="text-gray-800">{formatDate(c.issueDate)}</span></div>
                      {c.grade && <div><span className="text-gray-400">Grade:</span> <span className="text-gray-800">{c.grade}</span></div>}
                    </div>
                    {c.revokeReason && <p className="text-orange-700 bg-orange-100 p-2 rounded-lg text-xs mt-1"><strong>Revocation Reason:</strong> {c.revokeReason}</p>}
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
