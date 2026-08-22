import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const [verifyOpen, setVerifyOpen] = useState(false);

  return (
    <footer className="bg-provexa-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheckIcon className="w-7 h-7 text-provexa-blue" />
              <span className="text-xl font-black tracking-wider">PROVEXA</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Authenticity Validator for Academia — making academic credentials trustworthy, verifiable, and tamper-proof.
            </p>
            <p className="text-xs text-gray-400 mt-3">Smart Education Credential Network</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-200">Portals</h4>
            <ul className="space-y-2">
              {[
                { label: 'Student Portal', path: '/student/login' },
                { label: 'Employer Portal', path: '/employer/login' },
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <h4 className="font-semibold mb-3 text-gray-200">Quick Verify</h4>
            <p className="text-sm text-gray-400 mb-3">Have a certificate ID? Verify its authenticity instantly.</p>
            <button
              onClick={() => setVerifyOpen(!verifyOpen)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-provexa-blue text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Verify Now ▾
            </button>
            {verifyOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-gray-700 rounded-xl shadow-xl py-2 z-30">
                <Link
                  to="/student/login"
                  onClick={() => setVerifyOpen(false)}
                  className="block px-4 py-2.5 text-sm text-blue-400 hover:bg-slate-800 transition-colors font-medium"
                >
                  🎓 Student Login
                </Link>
                <Link
                  to="/employer/login"
                  onClick={() => setVerifyOpen(false)}
                  className="block px-4 py-2.5 text-sm text-purple-400 hover:bg-slate-800 transition-colors font-medium"
                >
                  🏢 Employer Login
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center">
          <p className="text-xs text-gray-400">
            © 2026 PROVEXA | Developed by Rakesh Vepuri | All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
