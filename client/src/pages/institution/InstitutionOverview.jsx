import { useEffect, useState } from 'react';
import api from '../../services/api';
import { DocumentTextIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function InstitutionOverview() {
  const [stats, setStats] = useState(null);
  const [recentCerts, setRecentCerts] = useState([]);

  useEffect(() => {
    api.get('/institution/stats').then(r => setStats(r.data.data)).catch(() => {});
    api.get('/institution/certificates?limit=5').then(r => setRecentCerts(r.data.data || [])).catch(() => {});
  }, []);

  const statCards = stats ? [
    { label: 'Total Issued', value: stats.total, icon: DocumentTextIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active', value: stats.active, icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Revoked', value: stats.revoked, icon: XCircleIcon, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Verification Requests', value: stats.verificationRequests, icon: EyeIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
  ] : [];

  return (
    <div className="p-3 sm:p-6 bg-slate-50/50 min-h-screen">
      <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-6">Dashboard Overview</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 transition-all">
            <div className={`p-2.5 sm:p-3 rounded-xl ${s.bg} flex-shrink-0`}><s.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${s.color}`} /></div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-800">{s.value ?? '—'}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold tracking-tight mt-0.5 leading-snug">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent certificates */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-800 text-base">Recent Certificates</h3>
        </div>
        
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-5 py-4">Cert ID</th>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Course</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-650">
              {recentCerts.map(cert => (
                <tr key={cert._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-slate-700">{cert.certId}</td>
                  <td className="px-5 py-4 font-bold text-slate-800">{cert.studentName}</td>
                  <td className="px-5 py-4 font-medium text-slate-600">{cert.course}</td>
                  <td className="px-5 py-4 text-slate-500">{cert.certType}</td>
                  <td className="px-5 py-4 text-slate-500">{new Date(cert.issueDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                      cert.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>{cert.status}</span>
                  </td>
                </tr>
              ))}
              {recentCerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-10 font-medium">No certificates issued yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="block md:hidden divide-y divide-slate-100 bg-white">
          {recentCerts.map(cert => (
            <div key={cert._id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-650">{cert.certId}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                  cert.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}>
                  {cert.status}
                </span>
              </div>
              <div className="space-y-0.5 text-xs text-slate-600">
                <p><span className="text-slate-400 font-medium">Student:</span> {cert.studentName}</p>
                <p><span className="text-slate-400 font-medium">Course:</span> {cert.course} ({cert.certType})</p>
                <p><span className="text-slate-400 font-medium">Issued:</span> {new Date(cert.issueDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          ))}
          {recentCerts.length === 0 && (
            <p className="text-xs text-slate-400 py-10 text-center font-medium bg-slate-50/30">No certificates issued yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
