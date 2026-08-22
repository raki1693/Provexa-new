import { useEffect, useState } from 'react';
import api from '../../services/api';
import { BuildingLibraryIcon, AcademicCapIcon, BriefcaseIcon, DocumentTextIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.data)).catch(() => {});
    api.get('/admin/reports').then(r => {
      const formatted = (r.data.data?.certsByMonth || []).map(item => ({
        name: `${item._id.month}/${item._id.year}`,
        Certificates: item.count,
      }));
      setChartData(formatted);
    }).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: 'Approved Institutions', value: stats.institutions, icon: BuildingLibraryIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Registered Students', value: stats.students, icon: AcademicCapIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Employer Accounts', value: stats.employers, icon: BriefcaseIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Certificates', value: stats.certs, icon: DocumentTextIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Verification Queries', value: stats.verifications, icon: CheckIcon, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Open Complaints', value: stats.openComplaints, icon: ExclamationTriangleIcon, color: 'text-red-600', bg: 'bg-red-50' },
  ] : [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Control Overview</h2>
        <p className="text-sm text-gray-500 mt-0.5">Global metrics and analytics of the PROVEXA platform</p>
      </div>

      {/* Grid statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl card-shadow p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${c.bg}`}><c.icon className={`w-6 h-6 ${c.color}`} /></div>
            <div>
              <p className="text-2xl font-black text-gray-800">{c.value ?? '—'}</p>
              <p className="text-xs text-gray-400 font-semibold">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Graph */}
      <div className="bg-white rounded-xl card-shadow p-6 mb-8">
        <h3 className="font-semibold text-gray-800 mb-6">Certificate Issuance Trend</h3>
        <div className="h-72">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available for trend analysis</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B4F72" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1B4F72" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="Certificates" stroke="#1B4F72" fillOpacity={1} fill="url(#colorCerts)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
