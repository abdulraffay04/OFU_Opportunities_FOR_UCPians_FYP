// This component provides the sidebar layout for all admin pages.
// It features a premium dark sidebar and a matching dark glassmorphic top navigation bar with a moving text gradient effect.

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircleIcon,
  ClipboardDocumentCheckIcon,
  InboxStackIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navLinks = [
  {
    label: 'Post Opportunity',
    path: '/admin/post',
    icon: PlusCircleIcon,
  },
  {
    label: 'Verify Opportunities',
    path: '/admin/pending',
    icon: ClipboardDocumentCheckIcon,
  },
  {
    label: 'Applications Received',
    path: '/admin/applications',
    icon: InboxStackIcon,
  },
  {
    label: 'User Management',
    path: '/admin/users',
    icon: UsersIcon,
  },
  {
    label: 'Reports & Analytics',
    path: '/admin/analytics',
    icon: ChartBarIcon,
  },
];

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle the sign out button click
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Check if a link is the currently active page
  const isActive = (path) => location.pathname === path;

  // Get high-contrast crimson sidebar active link classes
  const getLinkClasses = (path) => {
    const isCurrent = isActive(path);
    const baseClasses = "flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group";
    
    if (isCurrent) {
      return `${baseClasses} bg-red-500/10 text-red-400 border-l-4 border-red-500 shadow-lg shadow-red-500/5 translate-x-1`;
    }
    return `${baseClasses} text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 hover:translate-x-0.5`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      
      {/* Dynamic Keyframes injected globally for moving red/crimson gradient text */}
      <style>{`
        @keyframes movingRedGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-moving-red-text {
          background-size: 200% auto;
          animation: movingRedGradient 4s linear infinite;
        }
      `}</style>

      {/* ========== DESKTOP SIDEBAR (Deep Slate Dark Theme) ========== */}
      <aside className="hidden lg:flex w-64 bg-slate-950 border-r border-slate-900 fixed h-full flex-col z-20 transition-all duration-300">
        
       {/* Logo Section */}
        {/* Dark Sidebar Brand Header */}
        <div className="h-20 px-6 flex items-center border-b border-slate-900 bg-slate-950">
          <Link
            to="/admin/analytics"
            className="flex items-center gap-3 group w-full"
          >
            {/* Logo with matching crimson/red gradient */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-105 transition-all duration-300 border border-red-500/10">
              <span className="text-white font-extrabold text-sm tracking-wider">OFU</span>
            </div>

            {/* Brand Text */}
            <div className="flex flex-col">
              <h1 className="text-white font-bold text-sm leading-none tracking-wide group-hover:text-red-400 transition-colors">
                Opportunities
              </h1>
              <span className="text-slate-500 text-[10px] font-semibold tracking-wider uppercase mt-1">
                For UCPians
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link key={link.path} to={link.path} className={getLinkClasses(link.path)}>
                <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Sign Out Box */}
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

      {/* ========== RIGHT VIEWPORT CONTAINER ========== */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        {/* Sticky Top Dark Glassmorphic Navbar */}
        <header className="sticky top-0 z-30 w-full h-20 backdrop-blur-md bg-slate-950/95 border-b border-slate-900 px-6 sm:px-8 flex items-center justify-between transition-all duration-300">
          
          {/* Mobile Hamburg menu & Dashboard dynamic branding */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            {/* Highly Stylized Brand Title with Moving Red/Rose Gradient */}
            <div className="flex items-center">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-rose-400 to-red-500 animate-moving-red-text">
                Admin Portal Hub
              </h2>
            </div>
          </div>

          {/* Quick status badge */}
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm shadow-red-500/5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
              Admin Root Mode
            </span>
          </div>
        </header>

        {/* Dynamic Drawer Mobile Menu Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <nav className="fixed top-0 bottom-0 left-0 w-64 bg-slate-950 p-6 shadow-2xl flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">Admin Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {navLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <Link 
                        key={link.path} 
                        to={link.path} 
                        onClick={() => setMobileMenuOpen(false)}
                        className={getLinkClasses(link.path)}
                      >
                        <IconComponent className="w-5 h-5" />
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

        {/* ========== MAIN CONTENT CONTAINER ========== */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-10">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}

export default AdminLayout;