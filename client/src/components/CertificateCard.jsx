import { ArrowDownTrayIcon, ShareIcon, EyeIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import StatusBadge from './StatusBadge';

export default function CertificateCard({ cert, onView, onDownload, onShare }) {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="bg-white rounded-xl card-shadow border border-gray-100 p-5 hover:card-shadow-hover transition-all duration-200 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="font-mono text-xs font-bold text-provexa-navy bg-provexa-lightblue px-2 py-1 rounded">
            {cert.certId}
          </span>
          <h3 className="text-base font-semibold text-gray-800 mt-2 truncate">{cert.course}</h3>
          {cert.degree && <p className="text-sm text-gray-500">{cert.degree}{cert.specialization ? ` · ${cert.specialization}` : ''}</p>}
        </div>
        <StatusBadge status={cert.status} />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Institution</p>
          <p className="font-medium text-gray-700 truncate">{cert.institutionName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Type</p>
          <p className="font-medium text-gray-700">{cert.certType}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Issued</p>
          <p className="font-medium text-gray-700">{formatDate(cert.issueDate)}</p>
        </div>
        {cert.grade && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Grade</p>
            <p className="font-medium text-gray-700">{cert.grade}{cert.percentage ? ` · ${cert.percentage}%` : ''}</p>
          </div>
        )}
      </div>

      {/* Revoke reason */}
      {cert.status === 'revoked' && cert.revokeReason && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-700">
          <span className="font-semibold">Revoked:</span> {cert.revokeReason}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {onView && (
          <button onClick={() => onView(cert)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-provexa-navy bg-provexa-lightblue rounded-lg hover:bg-blue-100 transition-colors">
            <EyeIcon className="w-4 h-4" /> View
          </button>
        )}
        {onDownload && cert.pdfUrl && (
          <button onClick={() => onDownload(cert)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-provexa-green bg-provexa-lightgreen rounded-lg hover:bg-green-100 transition-colors">
            <ArrowDownTrayIcon className="w-4 h-4" /> Download
          </button>
        )}
        {onShare && (
          <button onClick={() => onShare(cert)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-provexa-purple bg-provexa-lightpurple rounded-lg hover:bg-purple-100 transition-colors">
            <ShareIcon className="w-4 h-4" /> Share
          </button>
        )}
      </div>
    </div>
  );
}
