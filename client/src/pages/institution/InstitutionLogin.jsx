import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BuildingLibraryIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function InstitutionLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('key') !== 'partner') {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/institution/login', form);
      login(res.data.token, res.data.user, 'institution');
      toast.success(`Welcome, ${res.data.user.name}!`);
      navigate('/institution/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      const status = err.response?.data?.approvalStatus;
      if (status === 'pending') toast('Your registration is pending admin approval. Please wait.', { icon: '⏳' });
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - green theme */}
      <div className="hidden lg:flex lg:w-1/2 institution-gradient flex-col justify-between p-12 text-white">
        <div><Link to="/" className="text-xl font-black tracking-wider">🛡️ PROVEXA</Link></div>
        <div>
          <BuildingLibraryIcon className="w-16 h-16 mb-6 opacity-80" />
          <h2 className="text-4xl font-black leading-tight mb-4">Institution Portal</h2>
          <p className="text-green-100 text-lg leading-relaxed">Issue digitally signed academic certificates to your students with bulk upload, revocation, and full audit trails.</p>
          <ul className="mt-8 space-y-3">
            {['Issue single & bulk certificates', 'SHA-256 digital signing', 'Revoke with audit trail', 'Bulk CSV/Excel upload', 'Issue history & analytics'].map(f => (
              <li key={f} className="flex items-center gap-2 text-green-100 text-sm"><span className="w-2 h-2 bg-white rounded-full" />{f}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-green-200">Register your institution to get started</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-900 p-6 relative overflow-hidden flex-col">
        {/* Glow circles */}
        <div className="absolute w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl -top-20 -left-20" />
        <div className="absolute w-80 h-80 rounded-full bg-teal-500/10 blur-3xl -bottom-20 -right-20" />

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
              <div className="p-2 bg-emerald-500/20 rounded-xl"><BuildingLibraryIcon className="w-7 h-7 text-emerald-400" /></div>
              <div>
                <h1 className="text-xl font-bold">Institution Login</h1>
                <p className="text-xs text-white/60">Manage your academic certificates</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-white/30"
                  placeholder="institution@example.com"
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
                    className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder-white/30 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-white/60 hover:text-white">
                    {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <Link to="/forgot-password?role=institution" className="text-xs text-emerald-400 hover:underline">Forgot Password?</Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm mt-2 transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In to Institution Portal'}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <p className="text-sm text-center text-white/70">
                Not registered?{' '}
                <Link to="/institution/register" className="text-emerald-400 font-semibold hover:underline">Register your institution</Link>
              </p>
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-center text-white/50">
                  Not an institution?{' '}
                  <Link to="/student/login" className="text-blue-400 hover:underline">Student</Link> ·{' '}
                  <Link to="/employer/login" className="text-purple-400 hover:underline">Employer</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
