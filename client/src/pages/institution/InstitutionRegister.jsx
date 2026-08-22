import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BuildingLibraryIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';

const INST_TYPES = ['University', 'College', 'School', 'Institute', 'Other'];

export default function InstitutionRegister() {
  const [form, setForm] = useState({
    name: '',
    registrationNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactPerson: '',
    contactMobile: '',
    address: '',
    state: '',
    district: '',
    website: '',
    type: 'College',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/institution/register', form);
      toast.success('Registration submitted! Awaiting admin approval.');
      navigate('/institution/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-900 py-10 px-4 relative overflow-hidden flex items-center justify-center">
      {/* Glow effects */}
      <div className="absolute w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl -top-20 -left-20" />
      <div className="absolute w-80 h-80 rounded-full bg-teal-500/10 blur-3xl -bottom-20 -right-20" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-6">
          <Link to="/" className="text-xl font-black text-white tracking-wider">🛡️ PROVEXA</Link>
          <div className="flex items-center justify-center gap-2 mt-2 text-white">
            <BuildingLibraryIcon className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold">Institution Registration</h1>
          </div>
          <p className="text-xs text-white/60 mt-1">Fill in your institution details. An admin will review and approve your request.</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 sm:p-8 text-white shadow-2xl">
          {/* Top Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" /> Back
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-white/80 mb-1">Institution Name *</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="XYZ University"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Registration Number *</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.registrationNumber}
                  onChange={set('registrationNumber')}
                  placeholder="UGC/NAAC reg no."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Institution Type</label>
                <select
                  className="w-full px-3 py-2.5 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  value={form.type}
                  onChange={set('type')}
                >
                  {INST_TYPES.map(t => <option className="bg-slate-950" key={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-white/80 mb-1">Official Email *</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="office@university.edu"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Password *</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min 6 characters"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Confirm password"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Contact Person</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.contactPerson}
                  onChange={set('contactPerson')}
                  placeholder="Registrar / Principal"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Contact Mobile</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.contactMobile}
                  onChange={set('contactMobile')}
                  placeholder="Mobile phone"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">State</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.state}
                  onChange={set('state')}
                  placeholder="Jharkhand"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">District</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.district}
                  onChange={set('district')}
                  placeholder="District"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-white/80 mb-1">Address</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-white/30"
                  rows={2}
                  value={form.address}
                  onChange={set('address')}
                  placeholder="Full official address"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-white/80 mb-1">Website</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.website}
                  onChange={set('website')}
                  placeholder="https://your-institution.edu.in"
                />
              </div>
            </div>

            <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-300">
              ⚠️ Your registration will be reviewed by a PROVEXA administrator. You will receive an email verification once approved.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </form>
          
          <p className="text-sm text-center text-white/70 mt-5">
            Already registered? <Link to="/institution/login" className="text-emerald-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
