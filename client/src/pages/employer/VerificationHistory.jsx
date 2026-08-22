import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { ClockIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function VerificationHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const url = filter ? `/employer/verification-history?result=${filter}` : '/employer/verification-history';
      const res = await api.get(url);
      setLogs(res.data.data || []);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Verification History</h2>
          <p className="text-sm text-gray-500 mt-0.5">Audit trail of all certificates verified by your account</p>
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-provexa-purple"
          >
            <option value="">All Results</option>
            <option value="verified">Verified</option>
            <option value="revoked">Revoked</option>
            <option value="invalid">Invalid</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-provexa-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading history...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">No verifications yet</h3>
            <p className="text-sm text-gray-400 mt-1">Verifications from ID, QR, or Bulk portals will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Date & Time', 'Cert ID', 'Candidate Name', 'Course', 'Institution', 'Method', 'Result'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-provexa-navy">{log.certId}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{log.cert?.studentName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{log.cert?.course || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{log.cert?.institutionName || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{log.method}</td>
                    <td className="px-4 py-3"><StatusBadge status={log.result} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
