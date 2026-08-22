import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { UserCircleIcon, PhoneIcon, EnvelopeIcon, IdentificationIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

export default function StudentProfile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    profilePhoto: user?.profilePhoto || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) {
      return toast.error('Name and Mobile are required');
    }
    setLoading(true);
    try {
      const res = await api.put('/student/profile', form);
      // Update local storage and auth context state
      const token = localStorage.getItem('provexa_token');
      login(token, res.data.data, 'student');
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Info card */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 border-b pb-6 mb-6">
            {form.profilePhoto ? (
              <img src={form.profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-provexa-blue" />
            ) : (
              <UserCircleIcon className="w-20 h-20 text-gray-300" />
            )}
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-gray-800">{user?.name}</h3>
              <p className="text-sm text-gray-500">Student Portal User</p>
              <p className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1.5 inline-block font-semibold">Verified Account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-2">Editable Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field focus:ring-provexa-blue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="text"
                value={form.mobile}
                onChange={e => setForm({ ...form, mobile: e.target.value })}
                className="input-field focus:ring-provexa-blue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo URL</label>
              <input
                type="text"
                value={form.profilePhoto}
                onChange={e => setForm({ ...form, profilePhoto: e.target.value })}
                className="input-field focus:ring-provexa-blue"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full bg-provexa-navy hover:bg-blue-900 mt-2"
            >
              {loading ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Read-only account details */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider border-b pb-3 mb-4">Official Verification Details</h4>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Registered Email</p>
                <p className="text-sm font-medium text-gray-700">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <IdentificationIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Roll Number</p>
                <p className="text-sm font-medium text-gray-700">{user?.rollNumber || 'Not Specified'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BuildingLibraryIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Institution Name</p>
                <p className="text-sm font-medium text-gray-700">{user?.institutionName || 'Not Linked'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
