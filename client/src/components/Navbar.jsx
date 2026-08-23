import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [taps, setTaps] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [pin, setPin] = useState('');
  const navigate = useNavigate();

  const handleTap = (e) => {
    e.preventDefault();
    const newTaps = taps + 1;
    setTaps(newTaps);

    if (newTaps >= 5) {
      setTaps(0);
      setShowSecret(true);
    } else {
      navigate('/');
    }

    // Auto reset taps after 2 seconds
    const timer = setTimeout(() => {
      setTaps(0);
    }, 2000);
    return () => clearTimeout(timer);
  };

  const loginOptions = [
    { label: '🎓 Student Login', path: '/student/login', color: 'text-blue-700' },
    { label: '🏢 Employer Login', path: '/employer/login', color: 'text-purple-700' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" onClick={handleTap} className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="PROVEXA Logo" className="w-9 h-9 rounded-xl border border-slate-100 shadow-sm object-cover" />
            <span className="text-xl font-black text-provexa-navy tracking-wider">PROVEXA</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-provexa-navy transition-colors">Home</Link>
            <Link to="/verify/demo" className="text-sm font-medium text-gray-600 hover:text-provexa-navy transition-colors">Verify Certificate</Link>

            {/* Login dropdown */}
            <div className="relative">
              <button
                onClick={() => setLoginOpen(!loginOpen)}
                className="px-5 py-2 provexa-gradient text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Login ▾
              </button>
              {loginOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {loginOptions.map(opt => (
                    <Link key={opt.path} to={opt.path} onClick={() => setLoginOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors ${opt.color}`}>
                      {opt.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 py-2">Home</Link>
          {loginOptions.map(opt => (
            <Link key={opt.path} to={opt.path} onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium py-2 ${opt.color}`}>
              {opt.label}
            </Link>
          ))}
        </div>
      )}

      {/* Secret Portal Modal */}
      {showSecret && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 text-white shadow-2xl relative">
            <button
              onClick={() => {
                setShowSecret(false);
                setPin('');
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="p-3 bg-indigo-500/10 rounded-full w-fit mx-auto border border-indigo-500/20 text-indigo-400">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold">Secret Access Portal</h2>
              <p className="text-xs text-white/60">Enter verification PIN to access gateway keys</p>
            </div>

            {pin !== '965216' ? (
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter 6-Digit PIN"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full text-center tracking-[8px] text-lg font-bold py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-white/20 text-white"
                />
                {pin.length === 6 && pin !== '965216' && (
                  <p className="text-[10px] text-red-400 text-center font-semibold">Invalid PIN. Access Denied.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] text-green-400 text-center font-bold uppercase tracking-wider mb-2">Access Granted</p>
                <Link
                  to="/admin/login?key=admin_terminal"
                  onClick={() => setShowSecret(false)}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-slate-950/60 border border-white/5 hover:border-red-500/30 rounded-xl text-left text-sm font-semibold hover:bg-slate-950 transition-all group"
                >
                  <span className="p-1.5 bg-red-500/10 text-red-400 rounded-lg group-hover:bg-red-500/20">🛡️</span>
                  <div>
                    <p className="font-bold text-white">Admin Terminal</p>
                    <p className="text-[10px] text-white/50">Manage platforms & approvals</p>
                  </div>
                </Link>
                <Link
                  to="/institution/login?key=partner"
                  onClick={() => setShowSecret(false)}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-slate-950/60 border border-white/5 hover:border-emerald-500/30 rounded-xl text-left text-sm font-semibold hover:bg-slate-950 transition-all group"
                >
                  <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500/20">🏫</span>
                  <div>
                    <p className="font-bold text-white">Institution Portal</p>
                    <p className="text-[10px] text-white/50">Issue & manage credentials</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
