import { useAuth } from '../../hooks/useAuth';
import { ShieldCheckIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function AdminProfile() {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Profile</h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">Administrator account details and credentials</p>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-6 space-y-6">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="p-4 bg-red-50 rounded-2xl">
            <ShieldCheckIcon className="w-10 h-10 text-provexa-red" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{user?.name || 'Administrator'}</h3>
            <p className="text-sm text-gray-500">Security Clearance Level: Super Admin</p>
            <p className="text-xs text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full mt-1.5 inline-block font-semibold">
              🛡️ Root Access
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Registered Admin Email</p>
              <p className="text-sm font-medium text-gray-700">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Last Session Login</p>
              <p className="text-sm font-medium text-gray-700">{formatDate(user?.lastLogin)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
