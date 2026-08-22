import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { AcademicCapIcon, MagnifyingGlassIcon, TrashIcon, NoSymbolIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data.data || []);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const toggleSuspend = async (id, status) => {
    try {
      if (status === 'active') {
        await api.put(`/admin/students/${id}/suspend`);
        toast.success('Student account suspended');
      } else {
        await api.put(`/admin/students/${id}/reactivate`);
        toast.success('Student account reactivated');
      }
      fetchStudents();
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ WARNING: Are you sure you want to permanently delete this student? All of their associated certificates will also be deleted from the database.")) {
      try {
        await api.delete(`/admin/students/${id}`);
        toast.success('Student and certificates permanently deleted');
        fetchStudents();
      } catch {
        toast.error('Failed to delete student');
      }
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.rollNumber && s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ((s.institution?.name || s.institutionName) && (s.institution?.name || s.institutionName).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-3 sm:p-6 bg-slate-50/50 min-h-screen">
      {/* Title block */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Manage Students</h2>
          <p className="text-sm text-slate-500 mt-1">Suspend, reactivate or permanently delete student profiles</p>
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
            placeholder="Search students..."
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 text-sm font-medium">Loading student directory...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <AcademicCapIcon className="w-20 h-20 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No students registered</h3>
            <p className="text-sm text-slate-400 mt-1">Student directory is empty</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <MagnifyingGlassIcon className="w-20 h-20 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No students found</h3>
            <p className="text-sm text-slate-400 mt-1">No students match your search query "{searchTerm}"</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Mobile</th>
                    <th className="px-5 py-4">Roll No</th>
                    <th className="px-5 py-4">Institution</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-650">
                  {filteredStudents.map(s => (
                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-700">{s.name}</td>
                      <td className="px-5 py-4 font-medium text-slate-650">{s.email}</td>
                      <td className="px-5 py-4 text-slate-500">{s.mobile || '—'}</td>
                      <td className="px-5 py-4 font-mono font-medium text-slate-500">{s.rollNumber || '—'}</td>
                      <td className="px-5 py-4 font-semibold text-indigo-650">{s.institution?.name || s.institutionName || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                          s.status === 'suspended' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {s.status || 'active'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right flex justify-end gap-2">
                        {s.status === 'active' ? (
                          <button
                            onClick={() => toggleSuspend(s._id, 'active')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-250/20 text-xs font-bold rounded-lg transition-all"
                          >
                            <NoSymbolIcon className="w-3.5 h-3.5" />
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleSuspend(s._id, 'suspended')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-250/20 text-xs font-bold rounded-lg transition-all"
                          >
                            <ArrowPathIcon className="w-3.5 h-3.5" />
                            Reactivate
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(s._id)}
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
              {filteredStudents.map(s => (
                <div key={s._id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm">{s.name}</h4>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                      s.status === 'suspended' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {s.status || 'active'}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500 font-medium">
                    <p><span className="text-slate-400">Email:</span> {s.email}</p>
                    <p><span className="text-slate-400">Mobile:</span> {s.mobile || '—'}</p>
                    <p><span className="text-slate-400">Roll No:</span> {s.rollNumber || '—'}</p>
                    <p><span className="text-slate-400">Institution:</span> {s.institution?.name || s.institutionName || '—'}</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                    {s.status === 'active' ? (
                      <button
                        onClick={() => toggleSuspend(s._id, 'active')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-250/20 text-xs font-bold rounded-lg transition-all"
                      >
                        <NoSymbolIcon className="w-3.5 h-3.5" />
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleSuspend(s._id, 'suspended')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-250/20 text-xs font-bold rounded-lg transition-all"
                      >
                        <ArrowPathIcon className="w-3.5 h-3.5" />
                        Reactivate
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(s._id)}
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
