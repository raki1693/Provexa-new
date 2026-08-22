import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BriefcaseIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function EmployerLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/employer/login', form);
      login(res.data.token, res.data.user, 'employer');
      toast.success(`Welcome back, ${res.data.user.hrName}!`);
      navigate('/employer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - purple theme */}
      <div className="hidden lg:flex lg:w-1/2 employer-gradient flex-col justify-between p-12 text-white">
        <div><Link to="/" className="text-xl font-black tracking-wider">🛡️ PROVEXA</Link></div>
        <div>
          <BriefcaseIcon className="w-16 h-16 mb-6 opacity-80" />
          <h2 className="text-4xl font-black leading-tight mb-4">Employer Portal</h2>
          <p className="text-purple-100 text-lg leading-relaxed font-light">Verify candidates' certificates by Certificate ID, scan QR code, or bulk upload spreadsheet lists of certificate IDs.</p>
          <ul className="mt-8 space-y-3">
            {['Verify by unique Certificate ID', 'Scan QR using camera or image', 'Bulk excel verification', 'Raise fraud/forgery complaints', 'Verification logs history'].map(f => (
              <li key={f} className="flex items-center gap-2 text-purple-100 text-sm font-medium"><span className="w-2 h-2 bg-white rounded-full" />{f}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-purple-200">PROVEXA Credential Validation Suite</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-900 p-6 relative overflow-hidden flex-col">
        {/* Glow circles */}
        <div className="absolute w-80 h-80 rounded-full bg-purple-500/10 blur-3xl -top-20 -left-20" />
        <div className="absolute w-80 h-80 rounded-full bg-fuchsia-500/10 blur-3xl -bottom-20 -right-20" />

        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden text-center mb-8"><Link to="/" className="text-xl font-black text-white">🛡️ PROVEXA</Link></div>
          
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

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-xl"><BriefcaseIcon className="w-7 h-7 text-purple-400" /></div>
              <div>
                <h1 className="text-xl font-bold">Employer Login</h1>
                <p className="text-xs text-white/60">Sign in to verify candidate credentials</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">HR Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-white/30"
                  placeholder="hr@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-white/30 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-white/60 hover:text-white">
                    {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <Link to="/forgot-password?role=employer" className="text-xs text-purple-400 hover:underline">Forgot Password?</Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm mt-2 transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In to Employer Portal'}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <p className="text-sm text-center text-white/70">
                Need an account?{' '}
                <Link to="/employer/register" className="text-purple-400 font-semibold hover:underline">Register your company</Link>
              </p>
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-center text-white/50">
                  Not an employer?{' '}
                  <Link to="/student/login" className="text-blue-400 hover:underline">Student</Link> ·{' '}
                  <Link to="/institution/login" className="text-green-400 hover:underline">Institution</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
