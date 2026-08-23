import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function InstitutionOverview() {
  const [stats, setStats] = useState(null);
  const [recentCerts, setRecentCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, certsRes] = await Promise.all([
          api.get('/institution/stats'),
          api.get('/institution/certificates?limit=5'),
        ]);
        setStats(statsRes.data.data);
        setRecentCerts(certsRes.data.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: 'Total Issued', value: stats.total, icon: DocumentTextIcon, color: 'text-blue-650', bg: 'bg-blue-50/50' },
        { label: 'Active', value: stats.active, icon: CheckCircleIcon, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
        { label: 'Revoked', value: stats.revoked, icon: XCircleIcon, color: 'text-rose-600', bg: 'bg-rose-50/50' },
        { label: 'Verification Requests', value: stats.verificationRequests, icon: EyeIcon, color: 'text-violet-600', bg: 'bg-violet-50/50' },
      ]
    : [];

  const warnings = stats?.warnings || { revokedHits: 0, activeComplaints: 0 };
  const hasWarnings = warnings.revokedHits > 0 || warnings.activeComplaints > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Monitor academic issuance metrics, verification activities, and system alerts</p>
        </div>
      </div>

      {/* Security Warnings / Fraud Indicators Panel */}
      {hasWarnings && (
        <div className="bg-red-50/40 border border-red-100 rounded-xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100/60 rounded-lg text-red-600 flex-shrink-0">
              <ExclamationTriangleIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-800">Active Security Alerts</h3>
              <p className="text-xs text-red-650/80 leading-relaxed mt-0.5">
                We detected verification attempts on revoked credentials or discrepancies reported by employers. Please review these logs immediately.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center justify-start md:justify-end">
            {warnings.revokedHits > 0 && (
              <div className="bg-white border border-red-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm text-xs font-semibold text-red-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span>{warnings.revokedHits} Scans on Revoked Credentials</span>
              </div>
            )}
            {warnings.activeComplaints > 0 && (
              <div className="bg-white border border-red-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm text-xs font-semibold text-red-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span>{warnings.activeComplaints} Active Employer Disputes</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-150 p-4 sm:p-5 flex items-start gap-4 shadow-sm">
            <div className={`p-3 rounded-lg ${s.bg} flex-shrink-0`}>
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 leading-tight">{s.value ?? '—'}</p>
              <p className="text-xs text-gray-400 font-medium tracking-tight mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      {stats?.trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Certificate Issuance Area Chart */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Certificate Issuance Trend</h2>
              <p className="text-xs text-gray-400">Monthly certificate issuance volume (last 6 months)</p>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="monthName" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="issued" name="Issued" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorIssued)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Verification Traffic Bar Chart */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Verification Traffic</h2>
              <p className="text-xs text-gray-400">Employer checks and security scans (last 6 months)</p>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="monthName" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="verified" name="Successful Checks" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revokedScans" name="Revoked Hits" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent certificates */}
      <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-150">
          <h3 className="font-bold text-gray-800 text-sm">Recently Issued Certificates</h3>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-150 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="px-5 py-4">Cert ID</th>
                <th className="px-5 py-4">Student Name</th>
                <th className="px-5 py-4">Course</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-gray-600">
              {recentCerts.map((cert) => (
                <tr key={cert._id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-gray-700">{cert.certId}</td>
                  <td className="px-5 py-4 font-semibold text-gray-800">{cert.studentName}</td>
                  <td className="px-5 py-4 font-medium text-gray-600">{cert.course}</td>
                  <td className="px-5 py-4 text-gray-500">{cert.certType}</td>
                  <td className="px-5 py-4 text-gray-500">{new Date(cert.issueDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                      cert.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {cert.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentCerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-10 font-medium">No certificates issued yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="block md:hidden divide-y divide-gray-150 bg-white">
          {recentCerts.map((cert) => (
            <div key={cert._id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-650">{cert.certId}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${
                  cert.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}>
                  {cert.status}
                </span>
              </div>
              <div className="space-y-0.5 text-xs text-gray-600">
                <p><span className="text-gray-400 font-medium">Student:</span> {cert.studentName}</p>
                <p><span className="text-gray-400 font-medium">Course:</span> {cert.course} ({cert.certType})</p>
                <p><span className="text-gray-400 font-medium">Issued:</span> {new Date(cert.issueDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          ))}
          {recentCerts.length === 0 && (
            <p className="text-xs text-gray-400 py-10 text-center font-medium bg-slate-50/10">No certificates issued yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
