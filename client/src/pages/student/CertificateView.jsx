import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeftIcon, ArrowDownTrayIcon, ShareIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

export default function CertificateView() {
  const { certId } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/student/certificates/${certId}`)
      .then(res => setCert(res.data.data))
      .catch(() => toast.error('Certificate not found'))
      .finally(() => setLoading(false));
  }, [certId]);

  const handleDownload = async () => {
    try {
      const res = await api.get(`/student/certificates/${certId}/download`);
      window.open(res.data.downloadUrl, '_blank');
    } catch { toast.error('Download not available'); }
  };

  const handleShare = async () => {
    try {
      const res = await api.get(`/student/certificates/${certId}/share`);
      await navigator.clipboard.writeText(res.data.link);
      toast.success('Link copied to clipboard!');
    } catch { toast.error('Failed to copy'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  if (loading) return <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-provexa-blue border-t-transparent rounded-full animate-spin" /></div>;
  if (!cert) return <div className="text-center py-16 text-gray-500">Certificate not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back to My Certificates
      </button>

      <div className="bg-white rounded-2xl card-shadow p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="font-mono text-sm font-bold text-provexa-navy bg-provexa-lightblue px-3 py-1 rounded-lg">{cert.certId}</span>
            <h1 className="text-2xl font-bold text-gray-800 mt-3">{cert.course}</h1>
            {cert.degree && <p className="text-gray-500">{cert.degree}{cert.specialization ? ` · ${cert.specialization}` : ''}</p>}
          </div>
          <StatusBadge status={cert.status} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Certificate Type', value: cert.certType },
            { label: 'Issuing Institution', value: cert.institutionName },
            { label: 'Issue Date', value: formatDate(cert.issueDate) },
            { label: 'Grade', value: cert.grade ? `${cert.grade}${cert.percentage ? ` (${cert.percentage}%)` : ''}` : '—' },
            { label: 'Student Name', value: cert.studentName },
            { label: 'Roll Number', value: cert.studentRollNo || '—' },
          ].map(item => (
            <div key={item.label} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{item.label}</p>
              <p className="font-semibold text-gray-700 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {/* QR Code */}
        {cert.qrUrl && (
          <div className="flex flex-col items-center gap-2 my-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <img src={cert.qrUrl} alt="Certificate QR Code" className="w-36 h-36" />
            <p className="text-xs text-gray-400">Scan to verify this certificate</p>
          </div>
        )}

        {/* Hash */}
        {cert.sha256Hash && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase mb-1">SHA-256 Integrity Hash</p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <code className="text-xs text-gray-600 break-all flex-1">{cert.sha256Hash}</code>
              <button onClick={() => { navigator.clipboard.writeText(cert.sha256Hash); toast.success('Hash copied'); }} className="flex-shrink-0">
                <ClipboardDocumentIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Revoke reason */}
        {cert.status === 'revoked' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
            <strong>This certificate has been revoked.</strong><br />
            Reason: {cert.revokeReason}
          </div>
        )}

        {/* Verification count */}
        <p className="text-xs text-gray-400 text-center mb-6">
          Verified {cert.verificationCount} time{cert.verificationCount !== 1 ? 's' : ''} by employers/others
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          {cert.pdfUrl && (
            <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-provexa-green text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
              <ArrowDownTrayIcon className="w-5 h-5" /> Download PDF
            </button>
          )}
          <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-provexa-purple text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
            <ShareIcon className="w-5 h-5" /> Share Link
          </button>
        </div>
      </div>
    </div>
  );
}
