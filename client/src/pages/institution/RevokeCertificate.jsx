import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeftIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';

export default function RevokeCertificate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [certId, setCertId] = useState(searchParams.get('id') || '');
  const [cert, setCert] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const fetchCert = async (id) => {
    if (!id) return;
    setLoading(true);
    setCert(null);
    try {
      const res = await api.get(`/institution/certificates/${id}`);
      setCert(res.data.data);
    } catch {
      toast.error('Certificate not found or not issued by your institution');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setCertId(id);
      fetchCert(id);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCert(certId.trim());
  };

  const handleClear = () => {
    setCertId('');
    setCert(null);
    setReason('');
    toast.success('Form cleared');
  };

  const handleRevoke = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error('Please specify a revocation reason');
    setRevoking(true);
    try {
      await api.put(`/institution/certificates/${cert.certId}/revoke`, { reason });
      toast.success('Certificate revoked successfully');
      navigate('/institution/history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke certificate');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="max-w-xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Revoke Certificate</h2>
        <p className="text-sm text-gray-500 mt-1">Revoke an issued certificate with a mandatory reason</p>
      </div>

      {/* Search Cert */}
      <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={certId}
            onChange={e => setCertId(e.target.value.toUpperCase())}
            placeholder="Enter Certificate ID (e.g. PRVX-XXXXXXXX)"
            className="input-field font-mono focus:ring-provexa-green flex-1"
          />
          <button type="button" onClick={handleClear} className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium hover:bg-gray-50">
            Clear
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-provexa-green text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Certificate detail & Revocation form */}
      {cert && (
        <div className="bg-white rounded-2xl card-shadow p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Certificate Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-gray-400">Student Name</p><p className="font-semibold text-gray-700">{cert.studentName}</p></div>
              <div><p className="text-xs text-gray-400">Student Email</p><p className="font-semibold text-gray-700">{cert.studentEmail}</p></div>
              <div><p className="text-xs text-gray-400">Course</p><p className="font-semibold text-gray-700">{cert.course}</p></div>
              <div><p className="text-xs text-gray-400">Status</p><StatusBadge status={cert.status} /></div>
            </div>
          </div>

          {cert.status === 'revoked' ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800">
              <strong>This certificate is already revoked.</strong>
              <p className="mt-1">Reason: {cert.revokeReason}</p>
            </div>
          ) : (
            <form onSubmit={handleRevoke} className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Revocation *</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  className="input-field focus:ring-provexa-green"
                  placeholder="e.g. Mismatch in grades / Student withdrew from course"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={revoking}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                <ArchiveBoxXMarkIcon className="w-5 h-5" />
                {revoking ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
