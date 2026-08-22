import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { BriefcaseIcon, UserIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon } from '@heroicons/react/24/outline';

export default function EmployerProfile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    hrName: user?.hrName || '',
    designation: user?.designation || '',
    mobile: user?.mobile || '',
    companyName: user?.companyName || '',
    cin: user?.cin || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hrName.trim() || !form.companyName.trim()) {
      return toast.error('HR Name and Company Name are required');
    }
    setLoading(true);
    try {
      const res = await api.put('/employer/profile', form);
      const token = localStorage.getItem('provexa_token');
      login(token, res.data.data, 'employer');
      toast.success('Employer profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Employer Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your HR profile and organization details</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <div className="flex items-center gap-4 border-b pb-6 mb-6">
            <div className="p-4 bg-purple-50 rounded-2xl">
              <BriefcaseIcon className="w-10 h-10 text-provexa-purple" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{user?.companyName}</h3>
              <p className="text-sm text-gray-500">{user?.hrName} ({user?.designation || 'Representative'})</p>
              <p className="text-xs text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full mt-1.5 inline-block font-semibold">
                Employer Account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-2">Organization Details</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={e => setForm({ ...form, companyName: e.target.value })}
                  className="input-field focus:ring-provexa-purple"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CIN / GST No.</label>
                <input
                  type="text"
                  value={form.cin}
                  onChange={e => setForm({ ...form, cin: e.target.value })}
                  className="input-field focus:ring-provexa-purple"
                  placeholder="Company registration number"
                />
              </div>

              <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider sm:col-span-2 pt-4 border-t mb-2">Representative details</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HR Representative Name *</label>
                <input
                  type="text"
                  value={form.hrName}
                  onChange={e => setForm({ ...form, hrName: e.target.value })}
                  className="input-field focus:ring-provexa-purple"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={e => setForm({ ...form, designation: e.target.value })}
                  className="input-field focus:ring-provexa-purple"
                  placeholder="e.g. HR Manager"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">HR Contact Number</label>
                <input
                  type="text"
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })}
                  className="input-field focus:ring-provexa-purple"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full bg-provexa-purple hover:bg-purple-800 mt-2"
            >
              {loading ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Account email */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider border-b pb-3 mb-4">Official Verification Details</h4>
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">HR Verification Email</p>
              <p className="text-sm font-medium text-gray-700">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
