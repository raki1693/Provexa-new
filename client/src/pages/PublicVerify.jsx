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

  const borderColors = {
    default: '#1B4F72',
    elegant_gold: '#B8860B',
    modern_emerald: '#145A32',
    royal_ruby: '#641E16',
  };

  const secondaryBorderColors = {
    default: '#2E86C1',
    elegant_gold: '#D7C460',
    modern_emerald: '#1E8449',
    royal_ruby: '#922B21',
  };

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

                    {cert.pdfUrl && (
                      <div className="mt-4 flex justify-center">
                        <a
                          href={cert.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl text-center shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                        >
                          📥 Download Official PDF Certificate
                        </a>
                      </div>
                    )}

                    {cert.institution?.certificateDesign && (
                      <div className="mt-6 border-t border-gray-100 pt-6">
                        <p className="text-[10px] font-bold text-gray-400 mb-3 text-center uppercase tracking-wider">Credential Visual Preview</p>
                        <div className="flex items-center justify-center">
                          <div
                            className="w-full max-w-sm aspect-[1.414/1] bg-white border-[6px] rounded-lg p-5 relative flex flex-col justify-between shadow-sm text-center"
                            style={{ borderColor: borderColors[cert.institution.certificateDesign.templateType || 'default'] }}
                          >
                            <div
                              className="absolute inset-2 border border-dashed rounded"
                              style={{ borderColor: secondaryBorderColors[cert.institution.certificateDesign.templateType || 'default'] }}
                            />
                            
                            <div className="relative z-10 flex flex-col justify-between h-full text-center">
                              <div className="mt-1">
                                <h4 className="text-[10px] tracking-widest font-black uppercase" style={{ color: borderColors[cert.institution.certificateDesign.templateType || 'default'] }}>
                                  PROVEXA ACADEMIC CERTIFICATE
                                </h4>
                                <p className="text-[7px] text-gray-400 font-medium tracking-wide mt-0.5">AUTHENTICITY VALIDATOR FOR ACADEMIA</p>
                              </div>

                              <div className="my-2">
                                <p className="text-[8px] text-gray-450">This is to certify that</p>
                                <p className="text-sm font-extrabold uppercase tracking-wider my-0.5" style={{ color: borderColors[cert.institution.certificateDesign.templateType || 'default'] }}>
                                  {cert.studentName}
                                </p>
                                <p className="text-[8px] text-gray-500 leading-snug">
                                  has successfully completed the course in <strong className="text-gray-700">{cert.course}</strong>
                                </p>
                                {cert.grade && (
                                  <p className="text-[9px] font-extrabold mt-1" style={{ color: secondaryBorderColors[cert.institution.certificateDesign.templateType || 'default'] }}>
                                    Grade: {cert.grade} {cert.percentage ? `(${cert.percentage}%)` : ''}
                                  </p>
                                )}
                              </div>

                              <div className="flex justify-between items-end px-3">
                                {/* Signature */}
                                <div className="text-left flex flex-col items-center">
                                  {cert.institution.certificateDesign.signatureUrl ? (
                                    <img src={cert.institution.certificateDesign.signatureUrl} alt="Signature" className="h-5 object-contain mb-0.5 max-w-[60px]" />
                                  ) : (
                                    <div className="h-5 w-12 border border-dashed border-gray-200 rounded flex items-center justify-center text-[6px] text-gray-300 mb-0.5">
                                      No Sig
                                    </div>
                                  )}
                                  <div className="w-16 border-t border-gray-200 my-0.5" />
                                  <span className="text-[6px] text-gray-400">Authorized Signatory</span>
                                </div>

                                {/* QR Code */}
                                <div className="text-right flex flex-col items-center">
                                  {cert.qrUrl ? (
                                    <img src={cert.qrUrl} alt="QR" className="w-7 h-7 mb-0.5" />
                                  ) : (
                                    <div className="w-7 h-7 border border-gray-200 bg-gray-50 rounded flex items-center justify-center text-[6px] text-gray-350 mb-0.5">
                                      QR
                                    </div>
                                  )}
                                  <span className="text-[5px] text-gray-400">Scan to Verify</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
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
