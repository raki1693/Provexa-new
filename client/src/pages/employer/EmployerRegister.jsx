import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { BriefcaseIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function EmployerRegister() {
  const [form, setForm] = useState({ companyName: '', cin: '', hrName: '', designation: '', email: '', mobile: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/employer/register', form);
      toast.success('Registration request sent! Please check your email for the OTP.');
      navigate('/employer/verify-otp', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-900 py-10 px-4 relative overflow-hidden flex items-center justify-center">
      {/* Glow effects */}
      <div className="absolute w-80 h-80 rounded-full bg-purple-500/10 blur-3xl -top-20 -left-20" />
      <div className="absolute w-80 h-80 rounded-full bg-fuchsia-500/10 blur-3xl -bottom-20 -right-20" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <Link to="/" className="text-xl font-black text-white tracking-wider">🛡️ PROVEXA</Link>
          <div className="flex items-center justify-center gap-2 mt-2 text-white">
            <BriefcaseIcon className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold">Employer Registration</h1>
          </div>
          <p className="text-xs text-white/60 mt-1">Register your organization to verify candidate credentials</p>
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
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Company Name *</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.companyName}
                  onChange={set('companyName')}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">CIN / GST No.</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.cin}
                  onChange={set('cin')}
                  placeholder="e.g. U12345MH2024PTC123456"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">HR Name *</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.hrName}
                  onChange={set('hrName')}
                  placeholder="e.g. Sarah Connor"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Designation</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.designation}
                  onChange={set('designation')}
                  placeholder="e.g. Talent Acquisition Lead"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-white/80 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="hr@acme.com"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-white/80 mb-1">Mobile Number</label>
                <input
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-white/30"
                  value={form.mobile}
                  onChange={set('mobile')}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm mt-2 transition-colors"
            >
              {loading ? 'Submitting...' : 'Verify Email & Continue'}
            </button>
          </form>
          
          <p className="text-sm text-center text-white/70 mt-5">
            Already registered? <Link to="/employer/login" className="text-purple-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
