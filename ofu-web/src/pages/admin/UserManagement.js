// This is the User Management page.
// Admins can view all users, filter by role, and block users.

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import { 
  NoSymbolIcon, 
  CheckCircleIcon, 
  InboxIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const roleBadgeColors = {
  student: 'bg-blue-50 text-blue-700 border-blue-100/70',
  alumni: 'bg-purple-50 text-purple-700 border-purple-100/70',
  admin: 'bg-red-50 text-red-700 border-red-100/70',
};

const filterOptions = ['all', 'student', 'alumni'];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data || []);
    } catch (err) {
      console.log("Loading users error:", err.response && err.response.status, err.response && err.response.data);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlock = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/deactivate`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: false } : u));
      toast.success('User restricted successfully');
    } catch (err) { 
      toast.error('Failed to block user'); 
    }
  };

  const handleUnblock = async (userId) => {
    if (!window.confirm('Are you sure you want to unblock this user?')) return;
    try {
      await api.patch(`/admin/users/${userId}/activate`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: true } : u));
      toast.success('User unblocked successfully');
    } catch (err) { 
      toast.error('Failed to unblock user'); 
    }
  };

  const getFilterLabel = (f) => {
    if (f === 'all') return 'All';
    if (f === 'student') return 'Students';
    if (f === 'alumni') return 'Alumni';
    return f;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  // Active Multi-parameter Search & Filter Logic Processor
  const filteredUsers = users.filter(u => {
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = name.includes(query) || email.includes(query);
    const matchesFilter = activeFilter === 'all' || u.role === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-4 relative space-y-8">
        
        {/* Ambient Decorative Crimson Light Blobs */}
        <div className="absolute top-12 left-10 w-72 h-72 bg-red-200/10 rounded-full filter blur-3xl animate-pulse duration-[8000ms] -z-10" />
        <div className="absolute bottom-24 right-10 w-80 h-80 bg-rose-200/10 rounded-full filter blur-3xl animate-pulse duration-[10000ms] -z-10" />

        {/* Page Header */}
        <div>
          <span className="inline-block text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full mb-3 border border-red-100">
            Control Center
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text">
            User Management
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-xl">
            Audit system accounts, inspect global registration tokens, and administer security status changes seamlessly.
          </p>
        </div>

        {/* ========== SEARCH & FILTER CONTROL BAR ========== */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl border border-white/50 p-4 shadow-xl shadow-gray-200/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Real-time Role Filter Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100/80 p-1 rounded-xl shadow-inner w-full md:w-auto">
            {filterOptions.map((filter) => {
              const isAct = activeFilter === filter;
              return (
                <button 
                  key={filter} 
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 transform active:scale-95 ${
                    isAct 
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/10' 
                      : 'bg-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {getFilterLabel(filter)}
                </button>
              );
            })}
          </div>

          {/* Dynamic Search Box Input */}
          <div className="relative flex items-center w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <MagnifyingGlassIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-red-400/10 focus:border-red-500 text-gray-700 shadow-sm transition-all duration-300"
            />
          </div>

        </div>

        {/* ========== EMPTY STATE VIEW ========== */}
        {filteredUsers.length === 0 && (
          <div className="backdrop-blur-md bg-white/70 text-center py-20 rounded-3xl border border-white/40 shadow-2xl shadow-gray-200/20">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <InboxIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-base font-semibold">No target accounts found</p>
            <p className="text-gray-400 text-xs mt-1">There are no profiles registered matching your active search parameter filter.</p>
          </div>
        )}

        {/* ========== IDENTITY LIST CONTAINER ========== */}
        <div className="space-y-3">
          {filteredUsers.map((u) => {
            const roleColor = roleBadgeColors[u.role] || 'bg-gray-100 text-gray-700 border-gray-200';
            const active = u.isActive !== false;
            
            return (
              <div 
                key={u.id} 
                className="backdrop-blur-md bg-white/70 rounded-2xl border border-white/40 shadow-md shadow-gray-100/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:shadow-lg hover:border-gray-300/60 group"
              >
                {/* Section 1: Avatar + Primary Identity Data */}
                <div className="flex items-center gap-4 min-w-0 flex-1 sm:max-w-md">
                  <div className="w-11 h-11 bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-xl flex items-center justify-center font-black text-sm border border-slate-700/10 shadow-sm transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate tracking-tight">{u.name || 'Anonymous Profile'}</h3>
                    <div className="flex items-center gap-1 text-gray-400 text-xs font-semibold mt-0.5">
                      <EnvelopeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Roles and Vetting Badges aligned center */}
                <div className="flex items-center gap-4 flex-wrap sm:flex-initial">
                  <span className={`px-2.5 py-0.5 border rounded-xl text-[10px] font-bold uppercase tracking-wider ${roleColor}`}>
                    {u.role}
                  </span>
                  
                  {active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-green-100 rounded-full text-[10px] font-bold bg-green-50 text-green-700 uppercase tracking-wider">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-red-100 rounded-full text-[10px] font-bold bg-red-50 text-red-700 uppercase tracking-wider">
                      <NoSymbolIcon className="w-3.5 h-3.5" />
                      Blocked
                    </span>
                  )}
                </div>

                {/* Section 3: System Access Mutator Actions */}
                <div className="w-full sm:w-auto flex justify-end flex-shrink-0">
                  {active ? (
                    <button 
                      type="button"
                      onClick={() => handleBlock(u.id)} 
                      className="w-full sm:w-auto bg-white border border-orange-200 text-orange-600 hover:bg-orange-50/50 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm transform active:scale-95 inline-flex items-center justify-center gap-1.5"
                    >
                      <NoSymbolIcon className="w-3.5 h-3.5" />
                      Restrict Access
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => handleUnblock(u.id)} 
                      className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-green-600/10 transform active:scale-95 inline-flex items-center justify-center gap-1.5"
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Activate Node
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

export default UserManagement;