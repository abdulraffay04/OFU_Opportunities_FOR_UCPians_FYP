// This is the My Posted Opportunities page for alumni/employers.
// They can view all opportunities they have posted.

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AlumniLayout from '../../components/AlumniLayout';
import { 
  BriefcaseIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  InboxIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

// Status badge colors
const statusColors = {
  approved: 'bg-green-50 text-green-700 border-green-100',
  pending: 'bg-amber-50 text-yellow-800 border-amber-100',
  rejected: 'bg-red-50 text-red-700 border-red-100',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

// Status display text
const statusText = {
  approved: 'Active',
  pending: 'Pending review',
  rejected: 'Rejected',
  closed: 'Closed',
};

function MyPostedOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadMyOpportunities(); }, []);

  const loadMyOpportunities = async () => {
    try {
      const response = await api.get('/opportunities/my');
      console.log("My opportunities with applicant counts:", response.data.data);
      setOpportunities(response.data.data || []);
    } catch (err) {
      console.log("Loading my opportunities error:", err.response && err.response.status, err.response && err.response.data);
      toast.error('Failed to load your opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate parameters to dynamically scale bars
  const maxApplicants = opportunities.length > 0 
    ? Math.max(...opportunities.map(o => o.applicantCount || 0), 1) 
    : 1;

  if (isLoading) {
    return (
      <AlumniLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
      </AlumniLayout>
    );
  }

  return (
    <AlumniLayout>
      <div className="max-w-5xl mx-auto py-4 relative space-y-12">
        
        {/* Ambient Decorative Light Blobs */}
        <div className="absolute top-12 left-10 w-72 h-72 bg-green-200/20 rounded-full filter blur-3xl animate-pulse duration-[8000ms] -z-10" />
        <div className="absolute bottom-24 right-10 w-80 h-80 bg-emerald-200/15 rounded-full filter blur-3xl animate-pulse duration-[10000ms] -z-10" />

        {/* Header Section */}
        <div>
          <span className="inline-block text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full mb-3 border border-green-100">
            Postings Tracker
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text">
            My Posted Opportunities
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-xl">
            Monitor verification cycles, view historical records, and track real-time metric counters for total applicants.
          </p>
        </div>

        {/* Empty state */}
        {opportunities.length === 0 && (
          <div className="backdrop-blur-md bg-white/70 text-center py-20 rounded-3xl border border-white/40 shadow-2xl shadow-gray-200/20">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <InboxIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-base font-medium">No system positions published from your profile yet.</p>
          </div>
        )}

        {/* Opportunities list */}
        <div className="space-y-5">
          {opportunities.map((opp) => {
            const badgeColor = statusColors[opp.status] || 'bg-gray-100 text-gray-600 border-gray-200';
            const badgeText = statusText[opp.status] || opp.status;

            return (
              <div 
                key={opp.id} 
                className="backdrop-blur-md bg-white/70 rounded-2xl border border-white/40 shadow-xl shadow-gray-200/15 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transform transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-gray-200/30"
              >
                {/* Left — title and status */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">{opp.title}</h3>
                    <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-gray-400">
                    <div className="flex items-center gap-1.5 capitalize">
                      <BriefcaseIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{opp.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{opp.location || 'No location parameters'}</span>
                    </div>
                    {opp.deadline && (
                      <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
                        <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>Deadline: {new Date(opp.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right — applicant count status token node */}
                <div className="flex items-center sm:justify-end flex-shrink-0">
                  <div className="flex items-center gap-4 bg-gray-50/50 border border-gray-100 px-5 py-3 rounded-2xl shadow-sm min-w-[140px] justify-between">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-green-600 border border-green-50/50">
                      <UserGroupIcon className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900 leading-none">{opp.applicantCount || 0}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Applicants</p>
                    </div>
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>

        {/* ========== VISUAL VERTICAL GRAPH SECTION ========== */}
        {opportunities.length > 0 && (
          <div className="backdrop-blur-md bg-white/70 rounded-3xl border border-white/40 shadow-xl shadow-gray-200/15 p-6 sm:p-8 space-y-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="p-2 bg-green-50 rounded-xl text-green-600 border border-green-100/50">
                <ChartBarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Applicant Pipeline Volume</h3>
                <p className="text-xs text-gray-400 mt-0.5">Real-time analytical comparison chart of inbound engagement.</p>
              </div>
            </div>

            {/* Premium Bar Graph Chassis */}
            <div className="relative pt-4">
              {/* Y-Axis Value Labels Grid */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-bold text-gray-300 h-64 border-l border-b border-gray-100 pb-2 pl-2">
                <div>{maxApplicants}</div>
                <div>{Math.round(maxApplicants * 0.75)}</div>
                <div>{Math.round(maxApplicants * 0.5)}</div>
                <div>{Math.round(maxApplicants * 0.25)}</div>
                <div>0</div>
              </div>

              {/* Chart Bar Box Layout */}
              <div className="h-64 pl-8 flex items-end gap-4 sm:gap-8 justify-around pt-2">
                {opportunities.map((opp) => {
                  const barHeight = ((opp.applicantCount || 0) / maxApplicants) * 100;
                  
                  return (
                    <div key={`chart-bar-${opp.id}`} className="flex flex-col items-center flex-1 h-full justify-end group max-w-[60px]">
                      {/* Floating tooltip data bubble on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md mb-2 absolute -translate-y-16 shadow-md z-10 font-mono">
                        {opp.applicantCount || 0} Apps
                      </div>

                      {/* Animated Core Vertical Column Bar */}
                      <div 
                        style={{ height: `${Math.max(barHeight, 4)}%` }}
                        className="w-full bg-gradient-to-t from-green-600 via-green-500 to-emerald-400 rounded-t-xl transition-all duration-1000 ease-out shadow-md shadow-green-500/10 group-hover:from-green-500 group-hover:to-emerald-300 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Text Identifiers Footer */}
              <div className="pl-8 flex justify-around gap-4 sm:gap-8 mt-4 pt-2 border-t border-gray-100">
                {opportunities.map((opp) => (
                  <div key={`label-${opp.id}`} className="text-[11px] font-bold text-gray-500 text-center truncate flex-1 max-w-[60px] tracking-tight group-hover:text-gray-900" title={opp.title}>
                    {opp.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </AlumniLayout>
  );
}

export default MyPostedOpportunities;