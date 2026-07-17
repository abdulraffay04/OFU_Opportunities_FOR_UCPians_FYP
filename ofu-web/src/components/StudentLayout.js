// This component provides the sidebar layout for all student pages.
// It features a premium dark sidebar layout, matching top header glassmorphism, a responsive mobile drawer menu, and user contextual parameters.

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  UserIcon,
  BriefcaseIcon,
  BookmarkIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import NotificationBell from './NotificationBell';

const navLinks = [
  {
    label: 'Profile Management',
    path: '/student/profile',
    icon: UserIcon,
  },
  {
    label: 'Browse Opportunities',
    path: '/student/opportunities',
    icon: BriefcaseIcon,
  },
  {
    label: 'Saved Opportunities',
    path: '/student/saved',
    icon: BookmarkIcon,
  },
  {
    label: 'Connect with Alumni',
    path: '/student/alumni',
    icon: UserGroupIcon,
  },
];

const aiLinks = [
  {
    label: 'Resume Analyzer',
    path: '/student/resume',
    icon: DocumentTextIcon,
    isAi: true,
  },
  {
    label: 'Chatbot Assistance',
    path: '/student/chatbot',
    icon: ChatBubbleLeftRightIcon,
    isAi: true,
  },
];

function StudentLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Extracting user context directly from AuthContext
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Local state to hold the real fetched name
  const [realName, setRealName] = useState('');

  // Fetch the detailed user payload on mount to capture the profile name
  useEffect(() => {
    const fetchRealName = async () => {
      try {
        const response = await api.get('/auth/me');

        const rootData = response.data;
        const nestedData = response.data?.data;
        const userObj = response.data?.user;

        if (nestedData?.name) {
          setRealName(nestedData.name);
        } else if (rootData?.name) {
          setRealName(rootData.name);
        } else if (userObj?.name) {
          setRealName(userObj.name);
        } else if (nestedData?.student?.name) {
          setRealName(nestedData.student.name);
        }
      } catch (err) {
        console.log("Failed to fetch verified user name metrics:", err);
      }
    };
    fetchRealName();
  }, [user]);

  // Handle the sign out button click
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Check if a link is the currently active page
  const isActive = (path) => location.pathname === path;

  // Get high-contrast sidebar link classes
  const getLinkClasses = (path, isAi = false) => {
    const isCurrent = isActive(path);
    const baseClasses = "flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group";

    if (isCurrent) {
      if (isAi) {
        return `${baseClasses} bg-violet-500/10 text-violet-400 border-l-4 border-violet-500 shadow-lg shadow-violet-500/5 translate-x-1`;
      }
      return `${baseClasses} bg-indigo-500/10 text-indigo-400 border-l-4 border-indigo-500 shadow-lg shadow-indigo-500/5 translate-x-1`;
    }
    return `${baseClasses} text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 hover:translate-x-0.5`;
  };

  // Automated Multi-fallback Username Parser Engine
  const resolveStudentName = () => {
    if (realName && realName !== 'Student') return realName;
    if (user?.name && user.name !== 'Student') return user.name;
    if (user?.displayName && user.displayName !== 'Student') return user.displayName;
    if (user?.student?.name && user.student.name !== 'Student') return user.student.name;
    if (user?.email) return user.email.split('@')[0];
    return 'UCP Student';
  };

  const displayName = resolveStudentName();

  // Safe username parsing logic for the avatar string fallback
  const getInitials = (name) => {
    if (!name || name === 'UCP Student') return 'S';
    const cleanName = name.trim();
    if (cleanName.includes(' ')) {
      const parts = cleanName.split(' ');
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.charAt(0).toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">

      {/* Dynamic Keyframes injected globally for moving text gradients */}
      <style>{`
        @keyframes movingStudentGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-moving-student-text {
          background-size: 200% auto;
          animation: movingStudentGradient 4s linear infinite;
        }
      `}</style>

      {/* ========== DESKTOP SIDEBAR ========== */}
      <aside className="hidden lg:flex w-64 bg-slate-950 border-r border-slate-900 fixed h-full flex-col z-20 transition-all duration-300">


        {/* Logo Section */}
        <div className="h-20 px-6 flex items-center border-b border-slate-900 bg-slate-950">
          <Link
            to="/student/opportunities"
            className="flex items-center gap-3 group w-full"
          >
            {/* Logo Icon with specialized indigo/purple fluid gradient */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all duration-300 border border-indigo-500/10">
              <span className="text-white font-extrabold text-sm tracking-wider">OFU</span>
            </div>

            {/* Brand Text */}
            <div className="flex flex-col">
              <h1 className="text-white font-bold text-sm leading-none tracking-wide group-hover:text-indigo-400 transition-colors">
                Opportunities
              </h1>
              <span className="text-slate-500 text-[10px] font-semibold tracking-wider uppercase mt-1">
                For UCPians
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">

          {/* Main Core Links */}
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link key={link.path} to={link.path} className={getLinkClasses(link.path)}>
                <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* AI Tools Section Sub-label */}
          <div className="pt-6 pb-2 px-4 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              AI Tools Suite
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
          </div>

          {/* AI Sub-navigation Links */}
          {aiLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link key={link.path} to={link.path} className={getLinkClasses(link.path, true)}>
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

          {/* Mobile Hamburg trigger & Hub Title branding */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <div className="flex items-center">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-indigo-300 to-indigo-400 animate-moving-student-text">
                Student Portal
              </h2>
            </div>
          </div>

          {/* Top Bar Right Controls */}
          <div className="flex items-center space-x-4">
            {/* Profile Pill - Left side of the control block */}
            <div className="flex items-center">
              <Link to="/student/profile" className="flex items-center space-x-3 p-1.5 pr-3 hover:bg-slate-900 rounded-2xl transition-all duration-300 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/20 border border-indigo-400/10 select-none transform group-hover:scale-105 transition-transform duration-300">
                  {getInitials(displayName)}
                </div>
                <div className="text-left hidden sm:block max-w-[120px]">
                  <span className="block text-xs font-bold text-slate-100 leading-none truncate capitalize">
                    {displayName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 tracking-wider mt-1.5 block leading-none uppercase">
                    Student
                  </span>
                </div>
              </Link>
            </div>

            {/* Notification Bell - Clean, standalone separation right at the edge boundary */}
            <div className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-xl border border-slate-800 hover:bg-slate-900 flex items-center justify-center">
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Dynamic Drawer Mobile Menu Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <nav className="fixed top-0 bottom-0 left-0 w-64 bg-slate-950 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-white tracking-tight">Navigation</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {/* Core links */}
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

                  <div className="pt-4 pb-1 px-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Suite</span>
                  </div>

                  {/* AI links */}
                  {aiLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={getLinkClasses(link.path, true)}
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

export default StudentLayout;