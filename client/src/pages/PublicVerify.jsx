import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheckIcon, ShieldExclamationIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PublicVerify() {
  const { certId } = useParams();
  const [cert, setCert] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState(certId !== 'quick' ? certId : '');
  const [searched, setSearched] = useState(certId !== 'quick');

  const verify = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/public/verify/${id}`);
      setResult(res.data.result);
      setCert(res.data.data);
    } catch {
      setResult('invalid');
      setCert(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certId && certId !== 'quick' && certId !== 'demo') verify(certId);
  }, [certId]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    verify(searchId.trim());
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  const resultConfig = {
    verified: {
      icon: ShieldCheckIcon,
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconColor: 'text-green-500',
      title: '✅ VERIFIED',
      titleColor: 'text-green-700',
      message: 'This certificate is authentic and has not been tampered with.',
    },
    revoked: {
      icon: ShieldExclamationIcon,
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      iconColor: 'text-orange-500',
      title: '🚫 REVOKED',
      titleColor: 'text-orange-700',
      message: 'This certificate has been revoked by the issuing institution.',
    },
    invalid: {
      icon: XCircleIcon,
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-500',
      title: '❌ INVALID',
      titleColor: 'text-red-700',
      message: 'No certificate found with this ID. It may be fake or incorrectly entered.',
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-provexa-bg py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <ShieldCheckIcon className="w-12 h-12 text-provexa-navy mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-provexa-navy">Certificate Verification</h1>
            <p className="text-gray-500 text-sm mt-1">Enter a PROVEXA Certificate ID to verify its authenticity</p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <input
              type="text"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              placeholder="Enter Certificate ID (e.g. PRVX-K7X9M2QP)"
              className="input-field flex-1 font-mono"
            />
            <button type="submit" disabled={loading || !searchId} className="px-6 py-3 provexa-gradient text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-60 flex items-center gap-2">
              <MagnifyingGlassIcon className="w-5 h-5" />
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          {/* Result */}
          {searched && result && !loading && (() => {
            const cfg = resultConfig[result] || resultConfig.invalid;
            return (
              <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-6 card-shadow`}>
                <div className="flex items-center gap-4 mb-6">
                  <cfg.icon className={`w-14 h-14 ${cfg.iconColor}`} />
                  <div>
                    <h2 className={`text-2xl font-black ${cfg.titleColor}`}>{cfg.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">{cfg.message}</p>
                  </div>
                </div>

                {cert && (
                  <div className="bg-white rounded-xl p-5 space-y-3">
                    <h3 className="font-bold text-gray-700 border-b pb-2">Certificate Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-xs text-gray-400 uppercase">Certificate ID</p><p className="font-mono font-bold text-provexa-navy">{cert.certId}</p></div>
                      <div><p className="text-xs text-gray-400 uppercase">Type</p><p className="font-semibold text-gray-700">{cert.certType}</p></div>
                      <div><p className="text-xs text-gray-400 uppercase">Student Name</p><p className="font-semibold text-gray-700">{cert.studentName}</p></div>
                      <div><p className="text-xs text-gray-400 uppercase">Course</p><p className="font-semibold text-gray-700">{cert.course}</p></div>
                      {cert.degree && <div><p className="text-xs text-gray-400 uppercase">Degree</p><p className="font-semibold text-gray-700">{cert.degree}</p></div>}
                      {cert.grade && <div><p className="text-xs text-gray-400 uppercase">Grade</p><p className="font-semibold text-gray-700">{cert.grade}</p></div>}
                      <div><p className="text-xs text-gray-400 uppercase">Issued By</p><p className="font-semibold text-gray-700">{cert.institutionName}</p></div>
                      <div><p className="text-xs text-gray-400 uppercase">Issue Date</p><p className="font-semibold text-gray-700">{formatDate(cert.issueDate)}</p></div>
                    </div>

                    {result === 'revoked' && cert.revokeReason && (
                      <div className="mt-3 p-3 bg-orange-50 rounded-lg text-sm text-orange-700 border border-orange-100">
                        <strong>Revoke Reason:</strong> {cert.revokeReason}
                      </div>
                    )}

                    {cert.qrUrl && (
                      <div className="flex justify-center mt-4">
                        <img src={cert.qrUrl} alt="Certificate QR" className="w-32 h-32" />
                      </div>
                    )}

                    {cert.sha256Hash && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 uppercase">SHA-256 Hash</p>
                        <p className="font-mono text-xs text-gray-500 break-all">{cert.sha256Hash}</p>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-center text-gray-400 mt-4">
                  Verified on {new Date().toLocaleString('en-IN')} · PROVEXA Platform
                </p>
              </div>
            );
          })()}

          {loading && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-provexa-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500">Verifying certificate...</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
