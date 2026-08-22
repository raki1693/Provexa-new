export default function StatusBadge({ status }) {
  const config = {
    active: { label: 'Active', classes: 'bg-green-100 text-green-800' },
    verified: { label: 'Verified ✓', classes: 'bg-green-100 text-green-800' },
    revoked: { label: 'Revoked', classes: 'bg-red-100 text-red-800' },
    pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
    invalid: { label: 'Invalid ✗', classes: 'bg-red-100 text-red-800' },
    open: { label: 'Open', classes: 'bg-blue-100 text-blue-800' },
    under_review: { label: 'Under Review', classes: 'bg-yellow-100 text-yellow-800' },
    resolved: { label: 'Resolved', classes: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-800' },
    suspended: { label: 'Suspended', classes: 'bg-orange-100 text-orange-800' },
    approved: { label: 'Approved', classes: 'bg-green-100 text-green-800' },
  };

  const { label, classes } = config[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}
