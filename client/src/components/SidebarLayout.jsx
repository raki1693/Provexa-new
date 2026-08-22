import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

const roleConfig = {
  student: { gradient: 'student-gradient', label: 'Student Portal' },
  institution: { gradient: 'institution-gradient', label: 'Institution Portal' },
  employer: { gradient: 'employer-gradient', label: 'Employer Portal' },
  admin: { gradient: 'admin-gradient', label: 'Admin Portal' },
};

export default function SidebarLayout({ role, navItems, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { gradient, label } = roleConfig[role] || roleConfig.student;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLinks = () => (
    <nav className="flex flex-col gap-1 px-3 mt-4">
      {navItems.map((item) => {
        const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`sidebar-link text-white ${active ? 'active' : 'opacity-80 hover:opacity-100'}`}
          >
            {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-provexa-bg">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col w-64 min-h-screen ${gradient} fixed top-0 left-0 z-30`}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white border-opacity-20">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="PROVEXA Logo" className="w-9 h-9 rounded-xl border border-white/20 shadow-sm object-cover" />
            <span className="text-xl font-black text-white tracking-wider">PROVEXA</span>
          </div>
          <p className="text-xs text-white text-opacity-70 mt-0.5">{label}</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <NavLinks />
        </div>
        {/* User + Logout */}
        <div className="px-4 py-4 border-t border-white border-opacity-20">
          <div className="flex items-center gap-3 mb-3">
            <UserCircleIcon className="w-8 h-8 text-white opacity-80" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || user?.hrName || user?.companyName}</p>
              <p className="text-xs text-white text-opacity-60 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white text-opacity-80 hover:bg-white hover:bg-opacity-20 transition-colors text-sm">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <aside className={`relative flex flex-col w-72 min-h-screen ${gradient} z-50`}>
            <div className="px-6 py-5 border-b border-white border-opacity-20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/logo.jpg" alt="PROVEXA Logo" className="w-8 h-8 rounded-lg border border-white/20 object-cover" />
                <span className="text-lg font-black text-white">PROVEXA</span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="flex-1 py-2"><NavLinks /></div>
            <div className="px-4 py-4 border-t border-white border-opacity-20">
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white text-opacity-80 hover:bg-white hover:bg-opacity-20 transition-colors text-sm">
                <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className={`${gradient} lg:bg-none lg:bg-white sticky top-0 z-20 px-4 lg:px-8 py-3 flex items-center justify-between shadow-sm`}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Bars3Icon className="w-6 h-6 text-white lg:text-gray-700" />
            </button>
            <h1 className="text-base font-bold text-white lg:text-gray-800 hidden sm:block">{label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2">
              <UserCircleIcon className="w-8 h-8 text-white lg:text-gray-400" />
              <span className="text-sm font-medium text-white lg:text-gray-700 max-w-[120px] truncate">
                {user?.name || user?.hrName || user?.companyName}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
