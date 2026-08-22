import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { ChatBubbleBottomCenterTextIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/employer/complaints');
      setComplaints(res.data.data || []);
    } catch {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Complaints</h2>
        <p className="text-sm text-gray-500 mt-0.5">Track status and resolutions of filed complaints</p>
      </div>

      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-provexa-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16">
            <ChatBubbleBottomCenterTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">No complaints filed</h3>
            <p className="text-sm text-gray-400 mt-1">Complaints filed against fake certificates will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {complaints.map((c) => {
              const isExpanded = expandedId === c._id;
              return (
                <div key={c._id} className="transition-colors hover:bg-gray-50 bg-opacity-40">
                  <div
                    onClick={() => toggleExpand(c._id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div>
                      <p className="font-mono text-sm font-bold text-provexa-navy">{c.certId}</p>
                      <p className="text-xs text-gray-400 mt-1">Submitted on {formatDate(c.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-6 self-end sm:self-center">
                      <span className="text-sm text-gray-600 font-medium">{c.reason}</span>
                      <StatusBadge status={c.status} />
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
                    <div className="px-5 pb-5 pt-2 border-t border-gray-50 bg-gray-50 bg-opacity-65 text-sm space-y-4">
                      {c.description && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase">Description</p>
                          <p className="text-gray-700 mt-1 bg-white p-3 rounded-lg border">{c.description}</p>
                        </div>
                      )}

                      {c.evidenceUrl && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Attached Evidence</p>
                          <a
                            href={c.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs font-semibold text-provexa-purple hover:underline"
                          >
                            View Evidence Document ↗
                          </a>
                        </div>
                      )}

                      {c.adminNote && (
                        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 text-xs">
                          <span className="font-bold text-provexa-purple">Admin Resolution Note:</span>
                          <p className="text-gray-700 mt-1">{c.adminNote}</p>
                          {c.resolvedAt && (
                            <p className="text-gray-400 mt-1 font-medium">Resolved on {formatDate(c.resolvedAt)}</p>
                          )}
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
