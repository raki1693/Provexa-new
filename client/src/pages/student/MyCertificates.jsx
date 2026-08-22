import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import CertificateCard from '../../components/CertificateCard';
import { DocumentTextIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function MyCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', certType: '' });
  const navigate = useNavigate();

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.certType) params.append('certType', filter.certType);
      const res = await api.get(`/student/certificates?${params}`);
      setCerts(res.data.data);
    } catch { toast.error('Failed to load certificates'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCerts(); }, [filter]);

  const handleShare = async (cert) => {
    try {
      const res = await api.get(`/student/certificates/${cert.certId}/share`);
      await navigator.clipboard.writeText(res.data.link);
      toast.success('Verification link copied to clipboard!');
    } catch { toast.error('Failed to copy link'); }
  };

  const handleDownload = async (cert) => {
    try {
      const res = await api.get(`/student/certificates/${cert.certId}/download`);
      window.open(res.data.downloadUrl, '_blank');
    } catch { toast.error('Download not available'); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Certificates</h2>
          <p className="text-sm text-gray-500 mt-0.5">{certs.length} certificate{certs.length !== 1 ? 's' : ''} issued to you</p>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-3">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
          </select>
          <select value={filter.certType} onChange={e => setFilter({ ...filter, certType: e.target.value })}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <option value="">All Types</option>
            {['Degree', 'Marksheet', 'Migration', 'Achievement', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-52 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : certs.length === 0 ? (
        <div className="text-center py-16">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">No certificates yet</h3>
          <p className="text-sm text-gray-400 mt-1">Certificates issued by your institution will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {certs.map(cert => (
            <CertificateCard
              key={cert._id}
              cert={cert}
              onView={() => navigate(`/student/certificate/${cert.certId}`)}
              onDownload={cert.pdfUrl ? handleDownload : null}
              onShare={handleShare}
            />
          ))}
        </div>
      )}
    </div>
  );
}
