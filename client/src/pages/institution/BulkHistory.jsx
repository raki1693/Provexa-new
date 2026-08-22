import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { ClockIcon, DocumentIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function BulkHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/institution/bulk-uploads');
      setHistory(res.data.data || []);
    } catch {
      toast.error('Failed to load bulk uploads history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (window.confirm("⚠️ WARNING: Are you sure you want to permanently delete all bulk upload history logs for your institution? This action is irreversible.")) {
      try {
        await api.delete('/institution/bulk-uploads/clear');
        toast.success('Bulk upload history cleared');
        fetchHistory();
      } catch {
        toast.error('Failed to clear history');
      }
    }
  };

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleRow = (id) => {
    setExpandedRow(prev => (prev === id ? null : id));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bulk Upload History</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track all bulk certificate issuance uploads and their results</p>
        </div>
        <button
          onClick={handleClearHistory}
          disabled={history.length === 0}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-provexa-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16">
            <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">No bulk uploads yet</h3>
            <p className="text-sm text-gray-400 mt-1">Uploads from the bulk issue portal will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((record) => {
              const isExpanded = expandedRow === record._id;
              return (
                <div key={record._id} className="transition-colors hover:bg-gray-50 bg-opacity-40">
                  <div
                    onClick={() => toggleRow(record._id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-green-50 rounded-xl">
                        <DocumentIcon className="w-6 h-6 text-provexa-green" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">{record.fileName || 'Unnamed File'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(record.createdAt || record.uploadDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 self-end sm:self-center">
                      <div className="flex gap-4 text-center text-xs sm:text-sm">
                        <div>
                          <p className="font-bold text-gray-700">{record.totalRows}</p>
                          <p className="text-xs text-gray-400">Total</p>
                        </div>
                        <div>
                          <p className="font-bold text-green-600">{record.successCount}</p>
                          <p className="text-xs text-gray-400">Issued</p>
                        </div>
                        <div>
                          <p className="font-bold text-red-600">{record.failedCount}</p>
                          <p className="text-xs text-gray-400">Failed</p>
                        </div>
                      </div>
                      <div>
                        {isExpanded ? (
                          <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-gray-50 bg-gray-50 bg-opacity-60">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Upload Summary Details</h4>
                      
                      {record.failedCount > 0 && record.errors?.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-red-700">Error Logs ({record.errors.length})</p>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {record.errors.map((err, i) => (
                              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs bg-red-50 rounded-lg p-2.5 border border-red-100">
                                <span className="text-red-500 font-bold">Row {err.row}</span>
                                <span className="text-gray-700 font-medium">{err.studentEmail}</span>
                                <span className="text-red-600 flex-1 sm:text-right">{err.reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg p-2.5 font-medium">
                          ✓ All certificates in this batch were issued successfully.
                        </p>
                      )}

                      {record.certIds?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-gray-500 mb-2">Issued Certificate IDs ({record.certIds.length})</p>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-white rounded-lg border">
                            {record.certIds.map((id) => (
                              <span key={id} className="font-mono text-[10px] bg-provexa-lightblue text-provexa-navy px-1.5 py-0.5 rounded font-bold">
                                {id}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
