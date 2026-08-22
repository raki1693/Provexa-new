import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [setupKey, setSetupKey] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('key') !== 'admin_terminal') {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/login', form);
      if (res.data.requireTotp) {
        toast('Please enter your 2FA code', { icon: '🔑' });
        navigate('/admin/verify-totp', { state: { tempToken: res.data.tempToken } });
      } else {
        login(res.data.token, res.data.user, 'admin');
        toast.success(`Welcome to Admin Panel, ${res.data.user.name}`);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupTOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/setup-totp', {
        setupKey,
        adminEmail: form.email,
        adminPassword: form.password,
        adminName: 'Super Admin',
      });
      setSetupData(res.data);
      toast.success('2FA Setup secret generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - red/maroon theme */}
      <div className="hidden lg:flex lg:w-1/2 admin-gradient flex-col justify-between p-12 text-white">
        <div><Link to="/" className="text-xl font-black tracking-wider">🛡️ PROVEXA</Link></div>
        <div>
          <ShieldCheckIcon className="w-16 h-16 mb-6 opacity-80" />
          <h2 className="text-4xl font-black leading-tight mb-4">Admin Dashboard</h2>
          <p className="text-red-100 text-lg leading-relaxed font-light">Supervise the entire authenticity network, manage institution licenses, monitor complaints, and audit all transactions.</p>
        </div>
        <p className="text-xs text-red-200">Secure Government Oversight Terminal</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-tr from-slate-900 via-red-950 to-slate-900 p-6 relative overflow-hidden flex-col">
        {/* Glow circles */}
        <div className="absolute w-80 h-80 rounded-full bg-red-500/10 blur-3xl -top-20 -left-20" />
        <div className="absolute w-80 h-80 rounded-full bg-orange-500/10 blur-3xl -bottom-20 -right-20" />

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
              <div className="p-2 bg-red-500/20 rounded-xl"><ShieldCheckIcon className="w-7 h-7 text-red-400" /></div>
              <div>
                <h1 className="text-xl font-bold">Admin Portal</h1>
                <p className="text-xs text-white/60">Secure administrator sign-in</p>
              </div>
            </div>

            {!showSetup ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm placeholder-white/30"
                    placeholder="admin@provexa.in"
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
                      className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm placeholder-white/30 pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-white/60 hover:text-white">
                      {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm mt-2 transition-colors"
                >
                  {loading ? 'Verifying...' : 'Sign In to Admin Portal'}
                </button>
                <div className="text-center pt-2">
                  <button type="button" onClick={() => setShowSetup(true)} className="text-xs text-white/50 hover:text-white hover:underline">
                    First time setup? Setup 2FA Authenticator
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSetupTOTP} className="space-y-4">
                <p className="text-xs text-white/60 mb-2">To setup your Google Authenticator 2FA, enter the setup key along with your administrator email & password.</p>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">Admin Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm placeholder-white/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">Admin Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm placeholder-white/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">2FA Setup Key *</label>
                  <input
                    type="password"
                    value={setupKey}
                    onChange={e => setSetupKey(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/40 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm placeholder-white/30"
                    placeholder="Enter key from backend environment"
                    required
                  />
                </div>
                
                {setupData && (
                  <div className="bg-slate-950/60 p-4 border border-white/10 rounded-xl space-y-3 text-center text-white">
                    <p className="text-xs font-semibold text-indigo-300">Scan QR Code with Google Authenticator:</p>
                    <img src={setupData.qrCode} alt="TOTP QR" className="w-32 h-32 mx-auto border border-white/10" />
                    <p className="text-xs text-white/50 font-mono">Secret Key: {setupData.secret}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Generating Secret...' : 'Generate 2FA Secret'}
                </button>
                <div className="text-center pt-2">
                  <button type="button" onClick={() => { setShowSetup(false); setSetupData(null); }} className="text-xs text-red-400 hover:underline">
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
