// NotificationBell.js
// A bell icon with unread count badge and a dropdown panel of notifications.
// Polls for unread count every 30 seconds. Clicking opens the full list.

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Helper function to turn a date into a relative time string
const formatTimeAgo = (date) => {
  let dateObj;
  if (date && date._seconds) {
    dateObj = new Date(date._seconds * 1000);
  } else if (date && date.seconds) {
    dateObj = new Date(date.seconds * 1000);
  } else {
    dateObj = new Date(date);
  }

  const now = new Date();
  const diffMs = now - dateObj;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch the unread notification count from the backend
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      const count = response.data.data.count || 0;
      setUnreadCount(count);
    } catch (error) {
      console.log('Failed to fetch unread count:', error.message);
    }
  };

  // Fetch the full notification list from the backend
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      const data = response.data.data || [];
      setNotifications(data);
    } catch (error) {
      console.log('Failed to fetch notifications:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle the dropdown open/closed
  const handleBellClick = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  // Handle clicking on a single notification
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await api.patch(`/notifications/${notification.id}/read`);

        // Update the notification in local state to show as read
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );

        // Decrease the unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      if (notification.relatedId) {
        navigate('/student/opportunities');
      }
    } catch (error) {
      console.log('Failed to mark notification as read:', error.message);
    }
    setIsOpen(false);
  };

  // Handle "Mark all read" button click
  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');

      // Update all notifications in local state to show as read
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.log('Failed to mark all as read:', error.message);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      
      {/* ===== Native SVG Bell Button Icon ===== */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-slate-400 hover:text-slate-100 bg-transparent hover:bg-slate-900 rounded-xl transition-all duration-300 focus:outline-none flex items-center justify-center"
        title="Notifications"
      >
        <svg 
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'scale-110 text-indigo-400' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.93 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>

        {/* Dynamic Glowing Crimson Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ===== Glassmorphic Dropdown Panel ===== */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 backdrop-blur-xl bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-3 duration-250">
          
          {/* Header Row */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-900">
            <span className="font-extrabold text-sm text-slate-100 tracking-tight">Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-2.5 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1"
              >
                {/* Native Check SVG */}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Mark all read
              </button>
            )}
          </div>

          {/* Scrollable Notification List Container */}
          <div className="overflow-y-auto max-h-80 divide-y divide-slate-900">
            
            {/* Loading Spinner */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 text-slate-500">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
                <span className="text-xs font-semibold">Fetching logs...</span>
              </div>
            )}

            {/* Empty State */}
            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl mb-3 text-slate-500">
                  {/* Native Inbox SVG */}
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18a2.25 2.25 0 012.25 2.25v4.25a2.25 2.25 0 01-2.25 2.25H2.25A2.25 2.25 0 010 20.25v-4.25A2.25 2.25 0 012.25 13.5z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-400">All caught up!</p>
                <p className="text-[10px] text-slate-600 mt-0.5">No unread notifications present.</p>
              </div>
            )}

            {/* Rendered Notification Feed Items */}
            {!loading && notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`px-5 py-4 cursor-pointer transition-all duration-300 flex items-start gap-3 relative ${
                  notification.isRead 
                    ? 'bg-transparent text-slate-300 hover:bg-slate-900/40' 
                    : 'bg-indigo-950/20 text-slate-100 hover:bg-indigo-950/35'
                }`}
              >
                {!notification.isRead && (
                  <span className="absolute left-1.5 top-[22px] w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <p className={`text-xs tracking-tight truncate ${notification.isRead ? 'font-semibold text-slate-300' : 'font-extrabold text-slate-100'}`}>
                    {notification.title}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    {notification.message}
                  </p>
                  <span className="inline-block text-[9px] font-bold text-slate-500 pt-0.5">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;