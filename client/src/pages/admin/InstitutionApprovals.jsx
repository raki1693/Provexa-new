import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { 
  BuildingLibraryIcon, 
  XMarkIcon, 
  PhoneIcon, 
  UserIcon, 
  MapPinIcon, 
  GlobeAltIcon, 
  ClipboardDocumentListIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  MagnifyingGlassIcon, 
  AcademicCapIcon,
  TrashIcon,
  NoSymbolIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function InstitutionApprovals() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'actions', 'profile', 'students'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Rejection & Suspension states
  const [rejectReason, setRejectReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showSuspendForm, setShowSuspendForm] = useState(false);

  // Student list states (inside selected institution card)
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/institutions');
      setInstitutions(res.data.data || []);
    } catch {
      toast.error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchStudentsForInst = async (instId) => {
    setLoadingStudents(true);
    setStudentSearchTerm('');
    try {
      const res = await api.get(`/admin/students?institutionId=${instId}`);
      setStudents(res.data.data || []);
    } catch {
      toast.error('Failed to load students for this institution');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/institutions/${id}/approve`);
      toast.success('Institution approved successfully');
      fetchInstitutions();
    } catch {
      toast.error('Approval failed');
    }
  };

  const handleReject = async (e, id) => {
    e.preventDefault();
    if (!rejectReason.trim()) return toast.error('Reason is required');
    try {
      await api.put(`/admin/institutions/${id}/reject`, { reason: rejectReason });
      toast.success('Institution registration rejected');
      setRejectReason('');
      setShowRejectForm(false);
      fetchInstitutions();
    } catch {
      toast.error('Rejection failed');
    }
  };

  const handleSuspend = async (e, id) => {
    e.preventDefault();
    if (!suspendReason.trim()) return toast.error('Reason is required');
    try {
      await api.put(`/admin/institutions/${id}/suspend`, { reason: suspendReason });
      toast.success('Institution account suspended');
      setSuspendReason('');
      setShowSuspendForm(false);
      fetchInstitutions();
    } catch {
      toast.error('Suspension failed');
    }
  };

  const handleReactivate = async (id) => {
    try {
      await api.put(`/admin/institutions/${id}/reactivate`);
      toast.success('Institution account reactivated');
      fetchInstitutions();
    } catch {
      toast.error('Reactivation failed');
    }
  };

  const handleDeleteInstitution = async (id) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this institution? This will permanently delete all registered students and certificates belonging to this institution! This action is irreversible.')) return;
    try {
      await api.delete(`/admin/institutions/${id}`);
      toast.success('Institution deleted successfully');
      setSelectedId(null);
      fetchInstitutions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Student specific actions
  const handleSuspendStudent = async (studentId, instId) => {
    try {
      await api.put(`/admin/students/${studentId}/suspend`);
      toast.success('Student suspended');
      fetchStudentsForInst(instId);
    } catch {
      toast.error('Failed to suspend student');
    }
  };

  const handleReactivateStudent = async (studentId, instId) => {
    try {
      await api.put(`/admin/students/${studentId}/reactivate`);
      toast.success('Student reactivated');
      fetchStudentsForInst(instId);
    } catch {
      toast.error('Failed to reactivate student');
    }
  };

  const handleDeleteStudent = async (studentId, instId) => {
    if (!window.confirm('Are you sure you want to permanently delete this student? All their certificate links will be removed!')) return;
    try {
      await api.delete(`/admin/students/${studentId}`);
      toast.success('Student deleted successfully');
      fetchStudentsForInst(instId);
    } catch {
      toast.error('Failed to delete student');
    }
  };

  // Helper to determine status color/text
  const getStatusInfo = (inst) => {
    if (inst.isSuspended) return { label: 'Suspended', color: 'bg-rose-50 text-rose-700 border-rose-100' };
    switch (inst.approvalStatus) {
      case 'approved': return { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'rejected': return { label: 'Rejected', color: 'bg-amber-50 text-amber-700 border-amber-100' };
      default: return { label: 'Pending', color: 'bg-blue-50 text-blue-700 border-blue-100' };
    }
  };

  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inst.email && inst.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-3 sm:p-6 bg-slate-50/50 min-h-screen">
      {/* Title Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Manage Institutions</h2>
          <p className="text-sm text-slate-500 mt-1">Approve, reject, or manage partnerships and access licenses</p>
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
            placeholder="Search institutions..."
          />
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm font-medium">Loading registered institutions...</p>
        </div>
      ) : institutions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <BuildingLibraryIcon className="w-20 h-20 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No institutions registered</h3>
          <p className="text-sm text-slate-400 mt-1.5 max-w-sm mx-auto">There are no institutions registered in the database yet.</p>
        </div>
      ) : filteredInstitutions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
          <MagnifyingGlassIcon className="w-20 h-20 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 font-sans">No matching institutions</h3>
          <p className="text-sm text-slate-400 mt-1">No institutions match your search query "{searchTerm}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredInstitutions.map(inst => {
            const isSelected = selectedId === inst._id;
            const statusInfo = getStatusInfo(inst);

            // Collapsed Card View
            if (!isSelected) {
              return (
                <div
                  key={inst._id}
                  onClick={() => {
                    setSelectedId(inst._id);
                    setActiveTab('profile');
                    setShowRejectForm(false);
                    setShowSuspendForm(false);
                  }}
                  className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 flex flex-col items-center text-center justify-center cursor-pointer hover:shadow-xl hover:-translate-y-0.5 hover:border-slate-200 transition-all duration-200 group aspect-square"
                >
                  <div className="p-2 sm:p-4 bg-slate-50 group-hover:bg-indigo-50/50 rounded-2xl text-slate-400 group-hover:text-indigo-600 mb-3 sm:mb-5 transition-colors flex-shrink-0">
                    <BuildingLibraryIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-xs sm:text-base leading-snug mb-2 sm:mb-3 line-clamp-2 px-1 text-center min-h-[2rem] sm:min-h-[2.75rem] flex items-center justify-center">
                    {inst.name}
                  </h3>
                  <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold border uppercase tracking-wider ${statusInfo.color} flex-shrink-0`}>
                    {statusInfo.label}
                  </span>
                </div>
              );
            }

            // Expanded Card View (Full Width)
            return (
              <div
                key={inst._id}
                className="col-span-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 transition-all duration-300 relative animate-fade-in"
              >
                {/* Header Banner Logo Box */}
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between mb-5 border border-slate-100">
                  <div className="flex items-center gap-3 overflow-hidden flex-1 mr-4">
                    <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm flex-shrink-0 border border-slate-100">
                      <BuildingLibraryIcon className="w-8 h-8" />
                    </div>
                    {/* Collapsible Name wrapper with sliding animation */}
                    <div className="overflow-hidden flex-1 min-w-0">
                      {inst.name.length > 25 ? (
                        <marquee behavior="scroll" direction="left" scrollamount="4" className="text-lg font-black text-slate-800 tracking-tight block whitespace-nowrap select-none">
                          {inst.name}
                        </marquee>
                      ) : (
                        <h3 className="text-lg font-black text-slate-800 tracking-tight truncate">
                          {inst.name}
                        </h3>
                      )}
                    </div>
                  </div>

                  {/* Close button inside container */}
                  <button
                    onClick={() => setSelectedId(null)}
                    className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200/50 shadow-sm transition-all flex-shrink-0"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Spacer Separator */}
                <div className="border-b border-slate-100 mb-6" />

                {/* Clean, Professional Inner Pill Tabs */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 max-w-lg mb-8 shadow-inner">
                  {[
                    { id: 'profile', label: 'Profile', icon: ClipboardDocumentListIcon },
                    { id: 'students', label: 'Students', icon: AcademicCapIcon },
                    { id: 'actions', label: 'Actions & Status', icon: CheckCircleIcon },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setShowRejectForm(false);
                        setShowSuspendForm(false);
                        if (tab.id === 'students') {
                          fetchStudentsForInst(inst._id);
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl transition-all duration-150 ${
                        activeTab === tab.id
                          ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/40'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content inside the Card */}
                <div>
                  {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                      {/* Column 1: Organization Info */}
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Organization Info</h4>
                        <div>
                          <span className="block text-xs font-semibold text-slate-400">Institution Type</span>
                          <span className="font-bold text-slate-700 mt-0.5 block">{inst.type || 'College'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-slate-400">Registration Number</span>
                          <span className="font-bold text-slate-700 font-mono mt-0.5 block">{inst.registrationNumber}</span>
                        </div>
                        {inst.website && (
                          <div>
                            <span className="block text-xs font-semibold text-slate-400">Official Website</span>
                            <a href={inst.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-indigo-650 font-bold hover:underline mt-1">
                              <GlobeAltIcon className="w-4 h-4 text-indigo-500" /> Visit Website
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Column 2: Contact Details */}
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Contact Details</h4>
                        <div>
                          <span className="block text-xs font-semibold text-slate-400">Contact Person</span>
                          <p className="font-bold text-slate-700 mt-1 flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            {inst.contactPerson || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-slate-400">Mobile Number</span>
                          <p className="font-bold text-slate-700 mt-1 flex items-center gap-2">
                            <PhoneIcon className="w-4 h-4 text-slate-400" />
                            {inst.contactMobile || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-slate-400">Registered Email Address</span>
                          <p className="font-semibold text-indigo-600 hover:underline mt-1">
                            <a href={`mailto:${inst.email}`}>{inst.email}</a>
                          </p>
                        </div>
                      </div>

                      {/* Column 3: Location */}
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Location & Address</h4>
                        <div>
                          <span className="block text-xs font-semibold text-slate-400">Address</span>
                          <p className="text-slate-700 font-semibold leading-relaxed mt-1 flex items-start gap-2">
                            <MapPinIcon className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span>
                              {inst.address || 'Address not registered.'}
                              {(inst.district || inst.state) && (
                                <span className="block text-xs text-slate-450 font-normal mt-1.5">
                                  {inst.district ? `${inst.district}, ` : ''}{inst.state || ''}
                                </span>
                              )}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'actions' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-500">Current Approval Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Pending controls */}
                      {!inst.isSuspended && inst.approvalStatus === 'pending' && !showRejectForm && (
                        <div className="flex flex-wrap gap-4 pt-2">
                          <button
                            onClick={() => handleApprove(inst._id)}
                            className="px-6 py-2.5 text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg rounded-xl transition-all shadow-sm"
                          >
                            Approve Institution
                          </button>
                          <button
                            onClick={() => setShowRejectForm(true)}
                            className="px-6 py-2.5 text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 hover:shadow-lg rounded-xl transition-all shadow-sm"
                          >
                            Reject Registration
                          </button>
                        </div>
                      )}

                      {/* Approved controls */}
                      {!inst.isSuspended && inst.approvalStatus === 'approved' && !showSuspendForm && (
                        <div className="pt-2">
                          <button
                            onClick={() => setShowSuspendForm(true)}
                            className="px-6 py-2.5 text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 hover:shadow-lg rounded-xl transition-all shadow-sm"
                          >
                            Suspend Institution
                          </button>
                          <p className="text-xs text-slate-400 mt-3 font-medium">Active partners can upload databases and issue academic credentials.</p>
                        </div>
                      )}

                      {/* Suspended controls */}
                      {inst.isSuspended && (
                        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 space-y-4 max-w-lg">
                          <div className="flex items-start gap-3">
                            <ExclamationTriangleIcon className="w-6 h-6 text-rose-600 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-extrabold text-rose-950">Partnership Suspended</p>
                              <p className="text-xs text-rose-700 mt-1 leading-relaxed"><strong className="font-semibold">Reason:</strong> {inst.suspendReason || 'None stated.'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleReactivate(inst._id)}
                            className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 hover:shadow rounded-lg transition-all"
                          >
                            Reactivate Account
                          </button>
                        </div>
                      )}

                      {/* Rejected description */}
                      {inst.approvalStatus === 'rejected' && (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3 max-w-lg">
                          <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-extrabold text-amber-950">Registration Rejected</p>
                            <p className="text-xs text-amber-700 mt-1 leading-relaxed"><strong className="font-semibold">Reason:</strong> {inst.rejectionReason || 'None stated.'}</p>
                          </div>
                        </div>
                      )}

                      {/* Reject Form */}
                      {showRejectForm && (
                        <form onSubmit={(e) => handleReject(e, inst._id)} className="border border-rose-100 rounded-2xl p-5 bg-rose-50/20 space-y-4 max-w-md">
                          <h4 className="text-sm font-extrabold text-rose-950">Provide Rejection Reason</h4>
                          <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white shadow-inner placeholder-rose-300"
                            placeholder="State reason for rejecting registration..."
                            rows={3}
                            required
                          />
                          <div className="flex gap-2.5">
                            <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm">Submit Rejection</button>
                            <button type="button" onClick={() => { setShowRejectForm(false); setRejectReason(''); }} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
                          </div>
                        </form>
                      )}

                      {/* Suspend Form */}
                      {showSuspendForm && (
                        <form onSubmit={(e) => handleSuspend(e, inst._id)} className="border border-rose-100 rounded-2xl p-5 bg-rose-50/20 space-y-4 max-w-md">
                          <h4 className="text-sm font-extrabold text-rose-950">Provide Suspension Reason</h4>
                          <textarea
                            value={suspendReason}
                            onChange={e => setSuspendReason(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white shadow-inner placeholder-rose-300"
                            placeholder="State reason for suspension..."
                            rows={3}
                            required
                          />
                          <div className="flex gap-2.5">
                            <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm">Confirm Suspension</button>
                            <button type="button" onClick={() => { setShowSuspendForm(false); setSuspendReason(''); }} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
                          </div>
                        </form>
                      )}

                      {/* Danger Zone / Delete Institution */}
                      <div className="pt-5 border-t border-slate-100">
                        <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-widest mb-3">Danger Zone</h4>
                        <button
                          onClick={() => handleDeleteInstitution(inst._id)}
                          className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 hover:shadow-lg rounded-xl transition-all shadow-sm"
                        >
                          <TrashIcon className="w-4 h-4 text-white" />
                          Delete Institution
                        </button>
                        <p className="text-[11px] text-slate-450 mt-2 font-medium">Permanently delete this institution profile, all registered students, and certificates from the database.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'students' && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h4 className="text-base font-extrabold text-slate-800">Students Registered at this Institution</h4>
                        {/* Student Search */}
                        <div className="relative w-full sm:max-w-xs">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <MagnifyingGlassIcon className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={studentSearchTerm}
                            onChange={e => setStudentSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs placeholder-slate-400 shadow-sm transition-all"
                            placeholder="Search students..."
                          />
                        </div>
                      </div>

                      {loadingStudents ? (
                        <div className="py-12 text-center text-slate-500 text-xs">
                          <div className="w-7 h-7 border-2 border-indigo-650 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          Loading students list...
                        </div>
                      ) : students.length === 0 ? (
                        <p className="text-xs text-slate-400 py-10 text-center font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">No students registered under this institution.</p>
                      ) : (() => {
                        const filteredStudents = students.filter(s =>
                          s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                          s.rollNumber.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
                        );
                        if (filteredStudents.length === 0) {
                          return <p className="text-xs text-slate-450 py-10 text-center font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">No students match your search query.</p>;
                        }
                        return (
                          <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm bg-white">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-55 bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                                  <th className="px-5 py-3.5">Name</th>
                                  <th className="px-5 py-3.5">Roll No</th>
                                  <th className="px-5 py-3.5">Email</th>
                                  <th className="px-5 py-3.5">Mobile</th>
                                  <th className="px-5 py-3.5">Status</th>
                                  <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 text-slate-650">
                                {filteredStudents.map(s => (
                                  <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-4 font-bold text-slate-700">{s.name}</td>
                                    <td className="px-5 py-4 font-mono font-medium text-slate-500">{s.rollNumber}</td>
                                    <td className="px-5 py-4 font-medium text-slate-600">{s.email}</td>
                                    <td className="px-5 py-4 text-slate-500">{s.mobile || '—'}</td>
                                    <td className="px-5 py-4">
                                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                                        s.status === 'suspended' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      }`}>
                                        {s.status || 'active'}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4 text-right flex justify-end gap-2">
                                      {s.status === 'suspended' ? (
                                        <button
                                          onClick={() => handleReactivateStudent(s._id, inst._id)}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-250/20 text-xs font-bold rounded-lg transition-all"
                                        >
                                          <ArrowPathIcon className="w-3.5 h-3.5" />
                                          Reactivate
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleSuspendStudent(s._id, inst._id)}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-250/20 text-xs font-bold rounded-lg transition-all"
                                        >
                                          <NoSymbolIcon className="w-3.5 h-3.5" />
                                          Suspend
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDeleteStudent(s._id, inst._id)}
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
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
