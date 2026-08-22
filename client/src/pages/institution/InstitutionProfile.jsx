import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { BuildingLibraryIcon, UserIcon, PhoneIcon, GlobeAltIcon, MapPinIcon, IdentificationIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function InstitutionProfile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    contactPerson: user?.contactPerson || '',
    contactMobile: user?.contactMobile || '',
    address: user?.address || '',
    website: user?.website || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/institution/profile', form);
      const token = localStorage.getItem('provexa_token');
      login(token, res.data.data, 'institution');
      toast.success('Institution profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Institution Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Manage institutional contact and profile details</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Main Details Form */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <div className="flex items-center gap-4 border-b pb-6 mb-6">
            <div className="p-4 bg-green-50 rounded-2xl">
              <BuildingLibraryIcon className="w-10 h-10 text-provexa-green" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.type || 'Educational Institution'}</p>
              <p className="text-xs text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full mt-1.5 inline-block font-semibold">
                ✓ Approved Partner
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-2">Editable Details</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name</label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                  className="input-field focus:ring-provexa-green"
                  placeholder="Registrar / Admin Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Mobile Number</label>
                <input
                  type="text"
                  value={form.contactMobile}
                  onChange={e => setForm({ ...form, contactMobile: e.target.value })}
                  className="input-field focus:ring-provexa-green"
                  placeholder="Official Contact Number"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                  className="input-field focus:ring-provexa-green"
                  placeholder="https://yourinstitution.edu.in"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="input-field focus:ring-provexa-green"
                  placeholder="Complete campus address"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full bg-provexa-green hover:bg-green-800 mt-2"
            >
              {loading ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Official Non-editable Details */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider border-b pb-3 mb-4">Official Verification Details</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="text-xs text-gray-400">Registration Number</p>
                <p className="text-sm font-medium text-gray-700 font-mono">{user?.registrationNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">State / Region</p>
                <p className="text-sm font-medium text-gray-700">{user?.state || 'Jharkhand'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">District</p>
                <p className="text-sm font-medium text-gray-700">{user?.district || 'Not Specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
