import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function ComplaintsPanel() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('open');
  const [expandedId, setExpandedId] = useState(null);
  
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState(''); // 'resolve' or 'reject'
  const [adminNote, setAdminNote] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/complaints?status=${filterStatus}`);
      setComplaints(res.data.data || []);
    } catch {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filterStatus]);

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!adminNote.trim()) return toast.error('Note is required');
    try {
      if (actionType === 'resolve') {
        await api.put(`/admin/complaints/${actionId}/resolve`, { adminNote });
        toast.success('Complaint resolved');
      } else {
        await api.put(`/admin/complaints/${actionId}/reject`, { adminNote });
        toast.success('Complaint rejected');
      }
      setActionId(null);
      setAdminNote('');
      fetchComplaints();
    } catch {
      toast.error('Action failed');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employer Complaints Panel</h2>
          <p className="text-sm text-gray-500 mt-0.5">Review and resolve claims of forged or mismatched certificates</p>
        </div>

        <div className="flex bg-white rounded-lg p-1 border">
          {['open', 'under_review', 'resolved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                filterStatus === status ? 'bg-provexa-red text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-provexa-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16">
            <ExclamationTriangleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">No complaints found</h3>
            <p className="text-sm text-gray-400 mt-1">No complaints match the current status filter</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {complaints.map(c => {
              const isExpanded = expandedId === c._id;
              return (
                <div key={c._id} className="transition-colors hover:bg-gray-50">
                  <div onClick={() => setExpandedId(isExpanded ? null : c._id)} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer">
                    <div>
                      <p className="font-mono text-sm font-bold text-provexa-navy">{c.certId}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Reported by: <span className="font-semibold">{c.employer?.companyName}</span> ({c.employerEmail})</p>
                    </div>
                    <div className="flex items-center gap-6 self-end sm:self-center">
                      <span className="text-sm text-gray-600 font-medium">{c.reason}</span>
                      <p className="text-xs text-gray-400">{formatDate(c.createdAt)}</p>
                      {isExpanded ? <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-gray-50 bg-gray-50 bg-opacity-65 text-sm space-y-4">
                      {c.description && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase">Employer Description</p>
                          <p className="text-gray-700 mt-1 bg-white p-3 rounded-lg border">{c.description}</p>
                        </div>
                      )}

                      {c.evidenceUrl && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Evidence Document</p>
                          <a href={c.evidenceUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-semibold text-provexa-red hover:underline">
                            View Attached File ↗
                          </a>
                        </div>
                      )}

                      {c.cert && (
                        <div className="bg-white rounded-lg p-3 border text-xs">
                          <p className="font-bold text-gray-700 mb-2">Linked Certificate Details</p>
                          <div className="grid grid-cols-2 gap-2 text-gray-600">
                            <div>Candidate: <span className="font-semibold text-gray-800">{c.cert.studentName}</span></div>
                            <div>Course: <span className="font-semibold text-gray-800">{c.cert.course}</span></div>
                            <div>Institution: <span className="font-semibold text-gray-800">{c.cert.institutionName}</span></div>
                            <div>Current Status: <StatusBadge status={c.cert.status} /></div>
                          </div>
                        </div>
                      )}

                      {/* Resolving controls */}
                      {filterStatus === 'open' && (
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => { setActionId(c._id); setActionType('resolve'); }} className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700">Resolve Complaint</button>
                          <button onClick={() => { setActionId(c._id); setActionType('reject'); }} className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700">Dismiss / Reject</button>
                        </div>
                      )}

                      {c.adminNote && (
                        <div className="bg-white rounded-xl p-3 border text-xs">
                          <span className="font-bold text-gray-700">Admin Resolution Note:</span>
                          <p className="text-gray-600 mt-1">{c.adminNote}</p>
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

      {/* Action Dialog */}
      {actionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleActionSubmit} className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 capitalize">{actionType} Complaint</h3>
            <p className="text-xs text-gray-500">Provide an administrative summary or note for this decision. The employer will be notified.</p>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              className="input-field"
              placeholder="Resolution notes..."
              rows={3}
              required
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setActionId(null); setAdminNote(''); }} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" className={`px-4 py-2 text-sm text-white rounded-lg ${actionType === 'resolve' ? 'bg-green-600' : 'bg-red-600'}`}>
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
