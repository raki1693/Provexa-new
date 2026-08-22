import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { MegaphoneIcon } from '@heroicons/react/24/outline';

export default function SystemSettings() {
  const [roles, setRoles] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (role) => {
    setRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (roles.length === 0) return toast.error('Select at least one target role');
    if (!title.trim() || !message.trim()) return toast.error('Title and message are required');
    setLoading(true);
    try {
      const res = await api.post('/admin/announcements', { roles, title, message });
      toast.success(res.data.message || 'Announcement broadcasted successfully');
      setTitle('');
      setMessage('');
      setRoles([]);
    } catch {
      toast.error('Broadcast failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">System Governance Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5 font-medium">Broadcast notices and configure operational parameters</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Broadcast Form */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <MegaphoneIcon className="w-6 h-6 text-provexa-red" />
            <h3 className="font-bold text-gray-800">Broadcast Global Announcement</h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Roles *</label>
              <div className="flex flex-wrap gap-4">
                {['student', 'institution', 'employer'].map(role => (
                  <label key={role} className="flex items-center gap-2 text-sm font-semibold capitalize cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roles.includes(role)}
                      onChange={() => handleRoleChange(role)}
                      className="rounded border-gray-300 text-provexa-red focus:ring-provexa-red"
                    />
                    {role}s
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Maintenance Notice"
                className="input-field focus:ring-provexa-red"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert Message *</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe the details of the broadcast..."
                rows={4}
                className="input-field focus:ring-provexa-red"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || roles.length === 0}
              className="btn-primary w-full bg-provexa-red hover:bg-red-800"
            >
              {loading ? 'Sending Broadcast...' : 'Publish Announcement'}
            </button>
          </form>
        </div>

        {/* Global Settings */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <h3 className="font-bold text-gray-800 border-b pb-4 mb-4">Verification Configuration</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex justify-between border-b pb-2">
              <span>OTP Expiry Duration</span>
              <span className="font-bold text-gray-800">10 Minutes</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Allowed File Types (Bulk upload)</span>
              <span className="font-bold text-gray-800">.xlsx, .xls, .csv</span>
            </div>
            <div className="flex justify-between">
              <span>Max Upload Size</span>
              <span className="font-bold text-gray-800">5 MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
