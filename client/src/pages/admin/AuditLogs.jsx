import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { ClipboardDocumentListIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actorRole, setActorRole] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 25,
        actorRole,
        action,
      });
      const res = await api.get(`/admin/audit-logs?${params}`);
      setLogs(res.data.data || []);
      setTotalPages(Math.ceil((res.data.total || 0) / 25) || 1);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actorRole]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleClearLogs = async () => {
    if (window.confirm("⚠️ WARNING: Are you sure you want to permanently delete all system audit logs? This action is irreversible.")) {
      try {
        await api.delete('/admin/audit-logs');
        toast.success('System audit logs cleared');
        fetchLogs();
      } catch {
        toast.error('Failed to clear logs');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Audit Logs</h2>
          <p className="text-sm text-gray-500 mt-0.5">Cryptographic log of all transactions and changes within the PROVEXA platform</p>
        </div>
        <button
          onClick={handleClearLogs}
          disabled={logs.length === 0}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          Clear Logs
        </button>
      </div>

      {/* Filter controls */}
      <div className="bg-white rounded-xl card-shadow p-4 mb-6">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <select
              value={actorRole}
              onChange={e => { setActorRole(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white flex-1 focus:outline-none focus:ring-2 focus:ring-provexa-red"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="institution">Institution</option>
              <option value="employer">Employer</option>
              <option value="admin">Admin</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              value={action}
              onChange={e => setAction(e.target.value)}
              placeholder="Search action (e.g. CERT_ISSUED)..."
              className="input-field focus:ring-provexa-red"
            />
          </div>

          <button
            type="submit"
            className="bg-provexa-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-provexa-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading audit history...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">No logs found</h3>
            <p className="text-sm text-gray-400 mt-1">Try resetting filters to view all entries</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-medium">
              <thead className="bg-gray-50">
                <tr>
                  {['Timestamp', 'Actor Role', 'Actor Email', 'Action', 'Target Type', 'Target ID', 'IP Address'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                    <td className="px-4 py-3 capitalize"><span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">{log.actorRole}</span></td>
                    <td className="px-4 py-3 text-gray-600 font-sans whitespace-nowrap">{log.actorEmail || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-provexa-navy">{log.action}</td>
                    <td className="px-4 py-3 text-gray-500 font-sans">{log.targetType || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{log.targetId || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{log.ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium hover:bg-gray-50 disabled:opacity-55"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium hover:bg-gray-50 disabled:opacity-55"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
