import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { MagnifyingGlassIcon, FunnelIcon, EyeIcon, ArchiveBoxXMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function IssueHistory() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [certType, setCertType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        status,
        certType,
      });
      const res = await api.get(`/institution/certificates?${params}`);
      setCerts(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load issuance history');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, status, certType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleClearHistory = async () => {
    if (window.confirm("⚠️ WARNING: Are you sure you want to permanently delete all certificate issuance history for your institution? This action will erase all certificates from the database and is irreversible.")) {
      try {
        await api.delete('/institution/certificates/clear');
        toast.success('Certificate issuance history cleared');
        fetchHistory();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to clear history');
      }
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
    <div className="p-3 sm:p-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Certificate Issuance History</h2>
          <p className="text-sm text-slate-500 mt-1">View and manage all certificates issued by this institution</p>
        </div>
        <button
          onClick={handleClearHistory}
          disabled={certs.length === 0}
          className="w-full sm:w-auto px-4 py-2 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50 text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          Clear History
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search Input Group */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MagnifyingGlassIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by student name or cert ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-slate-400 transition-all font-medium"
            />
          </div>

          {/* Filter controls group */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Status Select */}
            <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
              <select
                value={status}
                onChange={e => { setStatus(e.target.value); setPage(1); }}
                className="w-full sm:w-40 appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-750 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="revoked">Revoked</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-450">
                <FunnelIcon className="w-4 h-4" />
              </div>
            </div>

            {/* Certificate Type Select */}
            <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
              <select
                value={certType}
                onChange={e => { setCertType(e.target.value); setPage(1); }}
                className="w-full sm:w-44 appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-750 cursor-pointer"
              >
                <option value="">All Cert Types</option>
                {['Degree', 'Marksheet', 'Migration', 'Achievement', 'Other'].map(t => (
                   <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-455">
                <FunnelIcon className="w-4 h-4" />
              </div>
            </div>

            {/* Apply Filters Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold rounded-xl transition-all shadow-sm hover:shadow"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-provexa-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading history...</p>
          </div>
        ) : certs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No certificates found matching criteria</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Cert ID', 'Student Name', 'Roll Number', 'Course', 'Cert Type', 'Issue Date', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {certs.map((cert) => (
                    <tr key={cert._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-provexa-navy">{cert.certId}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{cert.studentName}</td>
                      <td className="px-4 py-3 text-gray-600">{cert.studentRollNo || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{cert.course}</td>
                      <td className="px-4 py-3 text-gray-500">{cert.certType}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(cert.issueDate)}</td>
                      <td className="px-4 py-3"><StatusBadge status={cert.status} /></td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => navigate(`/student/certificate/${cert.certId}`)} // redirects to general view if needed, or we can make a custom institution cert view
                          className="p-1.5 hover:bg-green-50 rounded-lg text-provexa-green"
                          title="View details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {cert.status !== 'revoked' && (
                          <button
                            onClick={() => navigate(`/institution/revoke?id=${cert.certId}`)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-provexa-red"
                            title="Revoke Certificate"
                          >
                            <ArchiveBoxXMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="block md:hidden divide-y divide-slate-100 bg-white">
              {certs.map((cert) => (
                <div key={cert._id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-700">{cert.certId}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                      cert.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {cert.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500 font-medium">
                    <p><span className="text-slate-400">Student:</span> {cert.studentName} ({cert.studentRollNo || '—'})</p>
                    <p><span className="text-slate-400">Course:</span> {cert.course} ({cert.certType})</p>
                    <p><span className="text-slate-400">Issued:</span> {formatDate(cert.issueDate)}</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                    <button
                      onClick={() => navigate(`/student/certificate/${cert.certId}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-250/20 text-xs font-bold rounded-lg transition-all"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      View
                    </button>
                    {cert.status !== 'revoked' && (
                      <button
                        onClick={() => navigate(`/institution/revoke?id=${cert.certId}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-250/20 text-xs font-bold rounded-lg transition-all"
                      >
                        <ArchiveBoxXMarkIcon className="w-3.5 h-3.5" />
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
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
