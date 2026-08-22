import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { BriefcaseIcon, MagnifyingGlassIcon, NoSymbolIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ManageEmployers() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/employers');
      setEmployers(res.data.data || []);
    } catch {
      toast.error('Failed to load employers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  const toggleSuspend = async (id, status) => {
    try {
      if (status === 'active') {
        await api.put(`/admin/employers/${id}/suspend`);
        toast.success('Employer account suspended');
      } else {
        await api.put(`/admin/employers/${id}/reactivate`);
        toast.success('Employer account reactivated');
      }
      fetchEmployers();
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ WARNING: Are you sure you want to permanently delete this employer? All associated complaints raised by them will be removed from the database!")) {
      try {
        await api.delete(`/admin/employers/${id}`);
        toast.success('Employer permanently deleted');
        fetchEmployers();
      } catch {
        toast.error('Failed to delete employer');
      }
    }
  };

  const filteredEmployers = employers.filter(e =>
    e.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.hrName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.cin && e.cin.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-3 sm:p-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Manage Employers</h2>
          <p className="text-sm text-slate-500 mt-1">Authorize, suspend or reactivate employer portal accounts</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm placeholder-slate-400 shadow-sm transition-all"
            placeholder="Search employers..."
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 text-sm font-medium">Loading employer directory...</p>
          </div>
        ) : employers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <BriefcaseIcon className="w-20 h-20 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No employers registered</h3>
            <p className="text-sm text-slate-400 mt-1">Employer directory is empty</p>
          </div>
        ) : filteredEmployers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <MagnifyingGlassIcon className="w-20 h-20 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No employers found</h3>
            <p className="text-sm text-slate-400 mt-1">No employers match your search query "{searchTerm}"</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-5 py-4">Company Name</th>
                    <th className="px-5 py-4">CIN/GST</th>
                    <th className="px-5 py-4">HR Representative</th>
                    <th className="px-5 py-4">Designation</th>
                    <th className="px-5 py-4">Work Email</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-650">
                  {filteredEmployers.map(e => (
                    <tr key={e._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-700">{e.companyName}</td>
                      <td className="px-5 py-4 font-mono font-medium text-slate-500">{e.cin || '—'}</td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{e.hrName}</td>
                      <td className="px-5 py-4 text-slate-500">{e.designation || '—'}</td>
                      <td className="px-5 py-4 text-slate-600">{e.email}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                          e.status === 'suspended' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {e.status || 'active'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right flex justify-end gap-2">
                        {e.status === 'active' ? (
                          <button
                            onClick={() => toggleSuspend(e._id, 'active')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-250/20 text-xs font-bold rounded-lg transition-all"
                          >
                            <NoSymbolIcon className="w-3.5 h-3.5" />
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleSuspend(e._id, 'suspended')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-250/20 text-xs font-bold rounded-lg transition-all"
                          >
                            <ArrowPathIcon className="w-3.5 h-3.5" />
                            Reactivate
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(e._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-250/20 text-xs font-bold rounded-lg transition-all"
                        >
                          <TrashIcon className="w-3.5 h-3.5 text-slate-500" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="block md:hidden divide-y divide-slate-100 bg-white">
              {filteredEmployers.map(e => (
                <div key={e._id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm">{e.companyName}</h4>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                      e.status === 'suspended' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {e.status || 'active'}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500 font-medium">
                    <p><span className="text-slate-400">CIN/GST:</span> {e.cin || '—'}</p>
                    <p><span className="text-slate-400">HR Rep:</span> {e.hrName} ({e.designation || 'HR'})</p>
                    <p><span className="text-slate-400">Work Email:</span> {e.email}</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                    {e.status === 'active' ? (
                      <button
                        onClick={() => toggleSuspend(e._id, 'active')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-250/20 text-xs font-bold rounded-lg transition-all"
                      >
                        <NoSymbolIcon className="w-3.5 h-3.5" />
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleSuspend(e._id, 'suspended')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-250/20 text-xs font-bold rounded-lg transition-all"
                      >
                        <ArrowPathIcon className="w-3.5 h-3.5" />
                        Reactivate
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(e._id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-250/20 text-xs font-bold rounded-lg transition-all"
                    >
                      <TrashIcon className="w-3.5 h-3.5 text-slate-500" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
