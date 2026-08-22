import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { ChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports')
      .then(res => {
        setData(res.data.data);
      })
      .catch(() => {
        toast.error('Failed to load reports data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const COLORS = ['#2E86C1', '#F1C40F', '#2ecc71', '#e74c3c'];

  const getCertsData = () => {
    if (!data?.certsByMonth) return [];
    return data.certsByMonth.map(item => ({
      name: `${item._id.month}/${item._id.year}`,
      Issued: item.count,
    }));
  };

  const getVerificationsData = () => {
    if (!data?.verificationsByMonth) return [];
    return data.verificationsByMonth.map(item => ({
      name: `${item._id.month}/${item._id.year}`,
      Verifications: item.count,
    }));
  };

  const getComplaintsPieData = () => {
    if (!data?.complaintsByStatus) return [];
    return data.complaintsByStatus.map(item => ({
      name: item._id.toUpperCase().replace('_', ' '),
      value: item.count,
    }));
  };

  const exportCSV = (type) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (type === 'certs' && data?.certsByMonth) {
      csvContent += "Month,Year,Count\n";
      data.certsByMonth.forEach(r => {
        csvContent += `${r._id.month},${r._id.year},${r.count}\n`;
      });
    } else if (type === 'verifications' && data?.verificationsByMonth) {
      csvContent += "Month,Year,Count\n";
      data.verificationsByMonth.forEach(r => {
        csvContent += `${r._id.month},${r._id.year},${r.count}\n`;
      });
    } else {
      return;
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analytical Reports</h2>
        <p className="text-sm text-gray-500 mt-0.5">Aggregate performance graphs and raw verification metrics</p>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-10 h-10 border-4 border-provexa-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Compiling statistics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Certs chart */}
            <div className="bg-white rounded-xl card-shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Certificates Issued</h3>
                <button onClick={() => exportCSV('certs')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs font-semibold">
                  <ArrowDownTrayIcon className="w-4.5 h-4.5" /> CSV
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getCertsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Issued" fill="#2E86C1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Verifications chart */}
            <div className="bg-white rounded-xl card-shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Verification Activity</h3>
                <button onClick={() => exportCSV('verifications')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs font-semibold">
                  <ArrowDownTrayIcon className="w-4.5 h-4.5" /> CSV
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getVerificationsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Verifications" fill="#1E8449" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Complaints status */}
          <div className="bg-white rounded-xl card-shadow p-6 max-w-lg mx-auto">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-4">Complaints Overview by Status</h3>
            <div className="h-64 flex flex-col sm:flex-row items-center justify-around gap-6">
              <div className="w-48 h-48">
                {getComplaintsPieData().length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No complaints logged</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getComplaintsPieData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getComplaintsPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="space-y-2">
                {getComplaintsPieData().map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="font-semibold text-gray-600 capitalize">{entry.name}:</span>
                    <span className="font-bold text-gray-800">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
