import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function SelfVerify() {
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
      const res = await api.post(`/student/certificates/${certId.trim()}/verify`);
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

  return (
    <div className="max-w-xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Verify a Certificate</h2>
        <p className="text-sm text-gray-500 mt-1">Enter any PROVEXA Certificate ID to check its authenticity</p>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate ID</label>
            <input
              value={certId}
              onChange={e => setCertId(e.target.value.toUpperCase())}
              className="input-field font-mono focus:ring-provexa-blue"
              placeholder="PRVX-XXXXXXXX"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClear} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm bg-white font-medium hover:bg-gray-50 transition-colors">
              Clear Fields
            </button>
            <button type="submit" disabled={loading || !certId} className="flex-1 btn-primary bg-provexa-navy hover:bg-blue-900 flex items-center justify-center gap-2">
              <MagnifyingGlassIcon className="w-5 h-5" />
              {loading ? 'Verifying...' : 'Verify Certificate'}
            </button>
          </div>
        </form>

        {result && (
          <div className="space-y-4">
            <div className={`mt-6 rounded-xl p-5 border-2 ${resultStyles[result].bg} ${resultStyles[result].border}`}>
              <p className={`font-bold text-base ${resultStyles[result].text}`}>{resultStyles[result].label}</p>
            </div>

            {certs && certs.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase px-1">Matched Certificates ({certs.length})</p>
                {certs.map((c, idx) => (
                  <div key={c._id || idx} className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b pb-1.5">
                      <span className="font-semibold text-provexa-navy">Certificate #{idx + 1} ({c.certType})</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div><span className="text-gray-400">Cert ID:</span> <span className="font-mono font-bold">{c.certId}</span></div>
                      <div><span className="text-gray-400">Course:</span> <span className="font-medium">{c.course}</span></div>
                      <div><span className="text-gray-400">Institution:</span> <span className="font-medium">{c.institutionName}</span></div>
                    </div>
                    {c.revokeReason && <p className="text-orange-700"><strong>Revoke Reason:</strong> {c.revokeReason}</p>}
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
