// This component provides the sidebar layout for all alumni/employer pages.
// It features a premium dark sidebar and a matching dark glassmorphic top navigation bar with moving text gradient effects.

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  PlusCircleIcon,
  InboxStackIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navLinks = [
  { label: 'Post Opportunity', path: '/alumni/post', icon: PlusCircleIcon },
  { label: 'Applications Received', path: '/alumni/applications', icon: InboxStackIcon },
  { label: 'My Posted Opportunities', path: '/alumni/my-posts', icon: ClipboardDocumentListIcon },
  { label: 'My Profile', path: '/alumni/profile', icon: UserIcon },
];

function AlumniLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function getUserData() {
      try {
        const res = await api.get('/auth/me');
        if (res.data) {
          const fetchedName = res.data.data?.name || res.data.name || res.data.user?.name;
          if (fetchedName && fetchedName.trim() !== '') {
            setUserName(fetchedName);
            return;
          }
        }
      } catch (err) {
        console.log("auth/me fetch error:", err);
      }

      try {
        const profileRes = await api.get('/alumni/profile');
        if (profileRes.data && profileRes.data.data && profileRes.data.data.name) {
          setUserName(profileRes.data.data.name);
        }
      } catch (err) {
        console.log("alumni/profile fetch error:", err);
      }
    }

    getUserData();
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const getEmployerName = () => {
    if (userName && userName.trim() !== '') {
      return userName;
    }

    if (user) {
      const activeUser = user.user || user.data || user;
      const contextName = activeUser.name || activeUser.fullName || activeUser.username;

      if (contextName && typeof contextName === 'string' && contextName.trim() !== '' && !contextName.includes('@')) {
        return contextName;
      }

      const activeEmail = activeUser.email || user.email;
      if (activeEmail) {
        const emailHandle = activeEmail.split('@')[0];
        return emailHandle
          .split(/[\._-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }

    return 'Employer Member';
  };

  const getLinkClasses = (path) => {
    const isCurrent = location.pathname === path;
    const baseClasses = "flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group";

    if (isCurrent) {
      return `${baseClasses} bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 shadow-lg shadow-emerald-500/5 translate-x-1`;
    }
    return `${baseClasses} text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 hover:translate-x-0.5`;
  };

  const displayName = getEmployerName();
  const displayLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-gray-50/50">

      {/* Dynamic Keyframes injected globally for moving gradient text */}
      <style>{`
        @keyframes movingGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-moving-text {
          background-size: 200% auto;
          animation: movingGradient 4s linear infinite;
        }
      `}</style>

      {/* Desktop Sidebar (Fixed sidebar width normalized to standard w-64) */}
      <aside className="hidden lg:flex w-64 bg-slate-950 border-r border-slate-900 fixed h-full flex-col z-20 transition-all duration-300">

        {/* Dark Sidebar Brand Header */}
        <div className="h-20 px-6 flex items-center border-b border-slate-800 bg-slate-950">
          <Link
            to="/alumni/post"
            className="flex items-center gap-3 group w-full"
          >
            {/* Logo */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-bold text-lg">OFU</span>
            </div>

            {/* Brand Text */}
            <div className="flex flex-col">
              <h1 className="text-white font-bold text-lg leading-none tracking-wide">
                Opportunities
              </h1>
              <p className="text-slate-400 text-xs">
                For UCPians
              </p>
            </div>
          </Link>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path} className={getLinkClasses(link.path)}>
                <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section with Dark Sign Out */}
        <div className="p-4 border-t border-slate-900">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-950/25 hover:text-red-400 w-full transition-all duration-300 group"
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Right Column Container (Corrected offset margin-left: lg:ml-64) */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">

        {/* Sticky Top Dark Glassmorphic Navbar */}
        <header className="sticky top-0 z-30 w-full h-20 backdrop-blur-md bg-slate-950/95 border-b border-slate-900 px-6 sm:px-8 flex items-center justify-between transition-all duration-300">

          {/* Mobile Menu Button & Dashboard Branding */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Highly Attractive Left Brand Title with Moving Green/Emerald Gradient */}
            <div className="flex items-center">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-green-400 to-emerald-500 animate-moving-text">
                Employer/Alumni Dashboard
              </h2>
            </div>
          </div>

          {/* Real Employer Profile Panel */}
          <div className="flex items-center space-x-5">
            {/* Profile Pill - Displays user name cleanly */}
            <Link to="/alumni/profile" className="flex items-center space-x-3 p-1.5 pr-3 hover:bg-slate-900 rounded-2xl transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-green-600/10">
                {displayLetter}
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-100 leading-none">
                  {displayName}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider mt-1.5 block leading-none">
                  Employer
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Mobile Slide-over Drawer Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <nav className="fixed top-0 bottom-0 left-0 w-64 bg-slate-950 p-6 shadow-2xl flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">Portal Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-slate-400">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={getLinkClasses(link.path)}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-950/25 hover:text-red-400 transition-colors"
              >
                <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
            </nav>
          </div>
        )}

        {/* Main Routed Children Viewport */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AlumniLayout;