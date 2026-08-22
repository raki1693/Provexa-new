import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const loginOptions = [
    { label: '🎓 Student Login', path: '/student/login', color: 'text-blue-700' },
    { label: '🏢 Employer Login', path: '/employer/login', color: 'text-purple-700' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
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
    </nav>
  );
}
