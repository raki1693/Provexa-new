import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  
  // Backdoor trigger states
  const [clickCount, setClickCount] = useState(0);
  const [showBackdoorModal, setShowBackdoorModal] = useState(false);
  const [backdoorPin, setBackdoorPin] = useState('');

  const loginOptions = [
    { label: '🎓 Student Login', path: '/student/login', color: 'text-blue-700' },
    { label: '🏢 Employer Login', path: '/employer/login', color: 'text-purple-700' },
  ];

  const handleLogoClick = (e) => {
    e.preventDefault();
    const newCount = clickCount + 1;
    if (newCount >= 5) {
      setClickCount(0);
      setShowBackdoorModal(true);
    } else {
      setClickCount(newCount);
      // Auto-reset tap count if user pauses for more than 2.5 seconds
      setTimeout(() => setClickCount(0), 2500);
    }
  };

  const handleBackdoorSubmit = (e) => {
    e.preventDefault();
    if (backdoorPin === '965216') {
      setShowBackdoorModal(false);
      setBackdoorPin('');
      toast.success('Backdoor access authorized!');
      // Prompt user to select destination
    } else {
      toast.error('Access Denied: Invalid PIN');
      setBackdoorPin('');
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div onClick={handleLogoClick} className="flex items-center gap-2.5 cursor-pointer select-none">
            <img src="/logo.jpg" alt="PROVEXA Logo" className="w-9 h-9 rounded-xl border border-slate-100 shadow-sm object-cover" />
            <span className="text-xl font-black text-provexa-navy tracking-wider">PROVEXA</span>
          </div>

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

      {/* Backdoor Modal Overlay */}
      {showBackdoorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 text-center animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-2">🔐 System Terminal</h3>
            <p className="text-xs text-gray-500 mb-4">A protected access sequence has been triggered. Please supply the passcode to verify system credentials.</p>
            
            <form onSubmit={handleBackdoorSubmit} className="space-y-4">
              <input
                type="password"
                maxLength={6}
                value={backdoorPin}
                onChange={e => setBackdoorPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full text-center text-2xl tracking-[0.75em] font-mono border-2 border-gray-200 rounded-xl py-2.5 focus:border-provexa-navy focus:ring-1 focus:ring-provexa-navy focus:outline-none"
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowBackdoorModal(false); setBackdoorPin(''); }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-provexa-navy text-white hover:opacity-95 transition-opacity"
                >
                  Verify PIN
                </button>
              </div>
            </form>

            {/* Backdoor portal list shown ONLY when correct PIN is typed */}
            {backdoorPin === '965216' && (
              <div className="mt-5 border-t pt-4 space-y-2 text-left animate-slide-up">
                <p className="text-[11px] font-bold text-green-600 uppercase mb-2">✅ Authorization Success. Portals Unlocked:</p>
                <button
                  onClick={() => {
                    setShowBackdoorModal(false);
                    setBackdoorPin('');
                    navigate('/institution/login?key=partner');
                  }}
                  className="w-full text-left py-2 px-3 hover:bg-green-50 text-green-700 font-semibold text-xs rounded-lg transition-colors border border-green-200 flex justify-between items-center"
                >
                  <span>🏛️ Institution login Portal</span>
                  <span className="font-mono text-[9px] bg-green-100 px-1.5 py-0.5 rounded">?key=partner</span>
                </button>
                <button
                  onClick={() => {
                    setShowBackdoorModal(false);
                    setBackdoorPin('');
                    navigate('/admin/login?key=admin_terminal');
                  }}
                  className="w-full text-left py-2 px-3 hover:bg-red-50 text-red-700 font-semibold text-xs rounded-lg transition-colors border border-red-200 flex justify-between items-center"
                >
                  <span>💼 Admin Control terminal</span>
                  <span className="font-mono text-[9px] bg-red-100 px-1.5 py-0.5 rounded">?key=admin_terminal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
