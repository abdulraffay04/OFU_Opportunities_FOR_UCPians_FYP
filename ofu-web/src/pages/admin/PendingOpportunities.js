// This is the Pending Opportunities page.
// Admins can approve or reject pending opportunities here.

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import {
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  InboxIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

// Modern high-contrast translucent styling for opportunity types
const badgeColors = {
  job: 'bg-green-50 text-green-700 border-green-100',
  internship: 'bg-blue-50 text-blue-700 border-blue-100',
  scholarship: 'bg-yellow-50 text-yellow-800 border-yellow-100',
  freelance: 'bg-orange-50 text-orange-700 border-orange-100',
  event: 'bg-purple-50 text-purple-700 border-purple-100',
};

function PendingOpportunities() {
  const [pendingList, setPendingList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Rejection flow states
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadPending();
  }, []);

  // Fetch pending opportunities from the backend
  const loadPending = async () => {
    try {
      const response = await api.get('/admin/pending');
      console.log("Pending opportunities response:", response.data);
      setPendingList(response.data.data || []);
    } catch (err) {
      console.log("Loading pending error:", err.response && err.response.status, err.response && err.response.data);
      toast.error('Failed to load pending opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  // Approve an opportunity
  const handleApprove = async (opportunityId) => {
    if (!window.confirm('Are you sure you want to approve this opportunity?')) {
      return;
    }

    try {
      await api.patch(`/admin/opportunities/${opportunityId}/approve`);

      // Remove the approved item from local state
      setPendingList(prevList => prevList.filter(item => item.id !== opportunityId));
      toast.success('Opportunity approved and listed live!');
    } catch (err) {
      console.log("Approve error:", err.response && err.response.data);
      toast.error('Failed to approve opportunity');
    }
  };

  // Start the reject flow — show the reason input inline
  const startReject = (opportunityId) => {
    setRejectId(opportunityId);
    setRejectReason('');
  };

  // Cancel the reject flow
  const cancelReject = () => {
    setRejectId(null);
    setRejectReason('');
  };

  // Confirm the rejection with a reason
  const handleReject = async (opportunityId) => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a reason for rejection');
      return;
    }

    try {
      await api.patch(`/admin/opportunities/${opportunityId}/reject`, {
        rejectReason: rejectReason,
      });

      // Remove the rejected item from local state
      setPendingList(prevList => prevList.filter(item => item.id !== opportunityId));

      // Clear the reject state variables
      setRejectId(null);
      setRejectReason('');
      toast.success('Opportunity application rejected');
    } catch (err) {
      console.log("Reject error:", err.response && err.response.data);
      toast.error('Failed to reject opportunity');
    }
  };

  // Format deadline date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (e) { return dateStr; }
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

  const inputStyle = "flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-sm shadow-sm";

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto py-4 relative">
        
        {/* Ambient Decorative Crimson Light Blobs */}
        <div className="absolute top-12 left-10 w-72 h-72 bg-red-200/10 rounded-full filter blur-3xl animate-pulse duration-[8000ms] -z-10" />
        <div className="absolute bottom-24 right-10 w-80 h-80 bg-rose-200/10 rounded-full filter blur-3xl animate-pulse duration-[10000ms] -z-10" />

        {/* Page Heading */}
        <div className="mb-10">
          <span className="inline-block text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full mb-3 border border-red-100">
            Vetting Board
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Pending Opportunities</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-xl">
            Review incoming opportunities posted by alumni and employer partners. Verify eligibility standards before releasing them live to students.
          </p>
        </div>

        {/* Empty State */}
        {pendingList.length === 0 && (
          <div className="backdrop-blur-md bg-white/70 text-center py-20 rounded-3xl border border-white/40 shadow-2xl shadow-gray-200/20">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100/50">
              <InboxIcon className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-gray-800 text-lg font-bold tracking-tight">Vetting Pipeline Empty</p>
            <p className="text-gray-400 text-xs mt-1">All clear! No external submissions are currently awaiting review.</p>
          </div>
        )}

        {/* Pending list */}
        <div className="space-y-5">
          {pendingList.map((opportunity) => {
            const typeColor = badgeColors[opportunity.type] || 'bg-gray-100 text-gray-700 border-gray-200';

            return (
              <div key={opportunity.id} className="backdrop-blur-md bg-white/70 rounded-2xl border border-white/40 shadow-xl shadow-gray-200/15 p-6 transition-all duration-300 hover:shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">

                  {/* Left Column: Post Data Details */}
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">{opportunity.title}</h3>
                      <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${typeColor}`}>
                        {opportunity.type}
                      </span>
                    </div>

                    {/* Poster Context Block */}
                    <div className="inline-flex items-center gap-2 bg-gray-50/80 border border-gray-100 px-3 py-1.5 rounded-xl text-xs">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Posted by:</span>
                      <span className="font-bold text-gray-700">{opportunity.posterName || 'Unknown Alumni'}</span>
                      {opportunity.posterEmail && (
                        <span className="text-gray-400 font-medium">({opportunity.posterEmail})</span>
                      )}
                    </div>

                    {/* Technical Metadata Row */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-gray-400">
                      {opportunity.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{opportunity.location}</span>
                        </div>
                      )}
                      {opportunity.deadline && (
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>Deadline: {formatDate(opportunity.deadline)}</span>
                        </div>
                      )}
                      {opportunity.organization && (
                        <div className="flex items-center gap-1.5">
                          <BuildingOfficeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{opportunity.organization}</span>
                        </div>
                      )}
                    </div>

                    {/* Text Area Summary Description */}
                    {opportunity.description && (
                      <p className="text-gray-500 text-xs leading-relaxed font-medium bg-white/50 p-3 border border-gray-100 rounded-xl line-clamp-3">
                        {opportunity.description}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Execution Action buttons */}
                  <div className="flex sm:flex-row lg:flex-col items-stretch lg:items-end gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(opportunity.id)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-green-600/10 hover:shadow-lg transform active:scale-95"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Approve Listing
                    </button>
                    <button
                      onClick={() => startReject(opportunity.id)}
                      className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50/50 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm transform active:scale-95"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Decline Application
                    </button>
                  </div>

                </div>

                {/* Inline Rejection Block: Sliding input drawer */}
                {rejectId === opportunity.id && (
                  <div className="mt-5 pt-5 border-t border-gray-100 animate-fade-in">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                      Specify Rejection Protocol Reason:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Incomplete specifications, mismatch on required deadline format..."
                        className={inputStyle}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(opportunity.id)}
                          className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          onClick={cancelReject}
                          className="flex-1 sm:flex-initial bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

export default PendingOpportunities;