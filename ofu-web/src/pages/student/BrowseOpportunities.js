// This is the Browse Opportunities page.
// Students can view, bookmark, and apply to approved opportunities.

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import StudentLayout from '../../components/StudentLayout';

// Styled colors for each opportunity type badge
const badgeColors = {
  job: 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
  internship: 'bg-blue-50 text-blue-700 border-blue-100/80',
  scholarship: 'bg-amber-50 text-amber-700 border-amber-100/80',
  freelance: 'bg-orange-50 text-orange-700 border-orange-100/80',
  event: 'bg-purple-50 text-purple-700 border-purple-100/80',
};

const filterOptions = ['all', 'job', 'internship', 'scholarship', 'freelance', 'event'];

const BrowseOpportunities = () => {
  // State for opportunities and saved IDs
  const [opportunities, setOpportunities] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State controls
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // State for recommended opportunities
  const [recommended, setRecommended] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  // State for the apply modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  // State for the details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsOpportunity, setDetailsOpportunity] = useState(null);

  // Load opportunities, saved list, and recommendations when the page loads
  useEffect(() => {
    loadData();
    loadRecommended();
  }, []);

  // Fetch opportunities and saved list from the backend
  const loadData = async () => {
    try {
      const opportunitiesResponse = await api.get('/opportunities');
      const savedResponse = await api.get('/saved');

      setOpportunities(opportunitiesResponse.data.data || []);

      const savedItems = savedResponse.data.data || [];
      const savedOpportunityIds = savedItems.map(item => item.opportunityID);
      setSavedIds(savedOpportunityIds);
    } catch (err) {
      toast.error('Failed to load opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recommended opportunities from the backend
  const loadRecommended = async () => {
    try {
      setLoadingRecommended(true);
      const response = await api.get('/opportunities/recommended');
      setRecommended(response.data.data || []);
    } catch (err) {
      console.log('Failed to load recommendations:', err.message);
      setRecommended([]);
    } finally {
      setLoadingRecommended(false);
    }
  };

  // Check if an opportunity is saved
  const isSaved = (opportunityId) => savedIds.includes(opportunityId);

  // Toggle bookmark — save or unsave an opportunity
  const toggleBookmark = async (opportunityId) => {
    try {
      if (isSaved(opportunityId)) {
        await api.delete(`/saved/${opportunityId}`);
        setSavedIds(prev => prev.filter(id => id !== opportunityId));
        toast.success('Removed from saved');
      } else {
        await api.post('/saved', { opportunityID: opportunityId });
        setSavedIds(prev => [...prev, opportunityId]);
        toast.success('Saved to bookmarks');
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  // Open the apply modal for an opportunity
  const openApplyModal = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setCoverLetter('');
    setResumeFile(null);
    setShowApplyModal(true);
  };

  // Close the apply modal
  const closeApplyModal = () => {
    setShowApplyModal(false);
    setSelectedOpportunity(null);
    setCoverLetter('');
    setResumeFile(null);
  };

  // Submit the application
  const handleApply = async () => {
    if (!coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    if (!resumeFile) {
      toast.error('Please upload your resume (PDF)');
      return;
    }

    setIsApplying(true);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const uploadResponse = await api.post('/uploads/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const resumeUrl = uploadResponse.data.data.url;

      await api.post('/applications', {
        opportunityID: selectedOpportunity.id,
        coverLetter: coverLetter,
        resumeUrl: resumeUrl,
      });

      toast.success('Application submitted successfully!');
      closeApplyModal();
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.error;
      toast.error(message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  // Open the details modal for an opportunity
  const openDetailsModal = (opportunity) => {
    setDetailsOpportunity(opportunity);
    setShowDetailsModal(true);
  };

  // Close the details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsOpportunity(null);
  };

  // Dynamic search and active badge classification calculation
  const filteredOpportunities = opportunities.filter((opp) => {
    const title = (opp.title || '').toLowerCase();
    const location = (opp.location || '').toLowerCase();
    const desc = (opp.description || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = title.includes(query) || location.includes(query) || desc.includes(query);
    const matchesFilter = activeFilter === 'all' || opp.type === activeFilter;

    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto py-4 relative space-y-12">

        {/* Ambient Decorative Background Glows */}
        <div className="absolute top-12 left-10 w-72 h-72 bg-indigo-200/10 rounded-full filter blur-3xl animate-pulse duration-[8000ms] -z-10" />
        <div className="absolute bottom-24 right-10 w-80 h-80 bg-purple-200/10 rounded-full filter blur-3xl animate-pulse duration-[10000ms] -z-10" />

        {/* ========== RECOMMENDED FOR YOU SECTION ========== */}
        {!loadingRecommended && recommended.length > 0 && (
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full mb-3 shadow-sm shadow-violet-500/5">
                <svg className="w-3.5 h-3.5 text-violet-500 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.43c.27-.135.59-.115.843.052L21 18l-1.313-5.813a1 1 0 01.32-.934L24 7l-5.904-.383a1 1 0 01-.84-.617L15 0l-2.256 5.917a1 1 0 01-.84.617L6 7l4.004 4.166a1 1 0 01.32.934L9.813 15.904z" />
                </svg>
                AI Placement Recommendation Engine
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">⭐ Match Matches Configured</h2>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">High-affinity roles aligned dynamically with your profile cgpa, department track, and skills.</p>
            </div>

            {/* Recommended Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended.map((opp) => {
                const typeColor = badgeColors[opp.type] || 'bg-gray-50 text-gray-700 border-gray-100';

                return (
                  <div
                    key={`rec-${opp.id}`}
                    className="backdrop-blur-md bg-white/80 rounded-3xl border border-indigo-100 p-6 flex flex-col justify-between transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-300 relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 border rounded-xl text-[10px] font-bold uppercase tracking-wider ${typeColor}`}>
                          {opp.type}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                          {opp.relevanceScore || 95}% match
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {opp.title}
                      </h3>

                      <div className="flex items-center text-gray-400 text-xs font-semibold mb-3">
                        <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3" />
                        </svg>
                        <span>{opp.location || 'Not specified'}</span>
                      </div>

                      <p className="text-gray-500 text-xs leading-relaxed mb-6 line-clamp-3 font-medium">
                        {opp.description}
                      </p>
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => openDetailsModal(opp)}
                        className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => openApplyModal(opp)}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-indigo-600/10"
                      >
                        Apply Node
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========== SEARCH & FILTER CONTROL BAR COMPONENTS ========== */}
        <div className="space-y-6 pt-4">
          <div>
            <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3 border border-indigo-100">
              General Pipeline
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Browse Open Opportunities</h2>
            <p className="text-gray-500 text-xs mt-1">Audit, filter, and lock applications across all authorized corporate partner roles.</p>
          </div>

          <div className="backdrop-blur-md bg-white/70 rounded-2xl border border-white/50 p-4 shadow-xl shadow-gray-200/20 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Filter Ribbons track selection chips */}
            <div className="flex flex-wrap gap-1 bg-gray-100/80 p-1 rounded-xl shadow-inner overflow-x-auto">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 transform active:scale-95 whitespace-nowrap uppercase ${
                    activeFilter === filter
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/10'
                      : 'bg-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {filter === 'all' ? 'All Matrix' : `${filter}s`}
                </button>
              ))}
            </div>

            {/* Live Input Query Box */}
            <div className="relative flex items-center w-full lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search positions, tags, location..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-700 shadow-sm transition-all duration-300"
              />
            </div>
          </div>

          {/* Opportunities Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => {
              const typeColor = badgeColors[opportunity.type] || 'bg-gray-50 text-gray-700 border-gray-100';

              return (
                <div 
                  key={opportunity.id} 
                  className="backdrop-blur-md bg-white/70 rounded-3xl border border-white/50 p-6 flex flex-col justify-between transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-indigo-100 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 border rounded-xl text-[10px] font-bold uppercase tracking-wider ${typeColor}`}>
                        {opportunity.type}
                      </span>
                      <button 
                        onClick={() => toggleBookmark(opportunity.id)} 
                        className="text-gray-400 hover:text-indigo-500 p-1.5 hover:bg-slate-50 rounded-xl transition-all duration-300"
                      >
                        {isSaved(opportunity.id) ? (
                          <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.022a.75.75 0 01.353.647v19.13a.75.75 0 01-1.22.573l-4.726-3.78-4.727 3.78a.75.75 0 01-1.22-.573V3.67a.75.75 0 01.353-.648L11.75 1.018a.75.75 0 01.5 0l5.343 2.004z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {opportunity.title}
                    </h3>

                    <div className="flex items-center text-gray-400 text-xs font-semibold mb-3">
                      <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3" />
                      </svg>
                      <span>{opportunity.location || 'Not specified'}</span>
                    </div>

                    <p className="text-gray-500 text-xs leading-relaxed mb-6 line-clamp-3 font-medium">
                      {opportunity.description}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => openDetailsModal(opportunity)}
                      className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => openApplyModal(opportunity)}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State View */}
          {filteredOpportunities.length === 0 && (
            <div className="backdrop-blur-md bg-white/70 text-center py-20 rounded-3xl border border-white/40 shadow-2xl shadow-gray-200/20">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18a2.25 2.25 0 012.25 2.25v4.25a2.25 2.25 0 01-2.25 2.25H2.25A2.25 2.25 0 010 20.25v-4.25A2.25 2.25 0 012.25 13.5z" />
                </svg>
              </div>
              <p className="text-gray-500 text-base font-semibold">No opportunities matched your parameters</p>
              <p className="text-gray-400 text-xs mt-1">Try modifying your text search query string or filtering criteria.</p>
            </div>
          )}
        </div>

        {/* ========== APPLY MODAL ========== */}
        {showApplyModal && selectedOpportunity && (
          <div className="fixed inset-0 backdrop-blur-sm bg-slate-950/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Submit Placement Resume</h2>
                <button onClick={closeApplyModal} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 bg-indigo-50/60 border border-indigo-100/50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-0.5">Applying for</span>
                  <p className="text-sm font-extrabold text-slate-950 leading-tight truncate max-w-[280px]">{selectedOpportunity.title}</p>
                </div>
                <span className={`px-2.5 py-0.5 border rounded-xl text-[9px] font-bold uppercase tracking-wider ${badgeColors[selectedOpportunity.type]}`}>
                  {selectedOpportunity.type}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Cover Letter Abstract *</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Draft a brief abstract..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-255 rounded-2xl text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Upload Verified Resume (PDF) *</label>
                <div className="relative group border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl p-4 bg-white">
                  <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Select candidate resume file</p>
                    </div>
                  </div>
                </div>
                {resumeFile && (
                  <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 w-fit">
                    Selected: {resumeFile.name}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button onClick={closeApplyModal} className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold">Cancel</button>
                <button onClick={handleApply} disabled={isApplying} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md">
                  {isApplying ? 'Uploading...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== DETAILS MODAL ========== */}
        {showDetailsModal && detailsOpportunity && (
          <div className="fixed inset-0 backdrop-blur-sm bg-slate-950/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-5 max-h-[85vh] overflow-y-auto scrollbar-thin">

              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">{detailsOpportunity.title}</h2>
                <button onClick={closeDetailsModal} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <span className={`inline-block px-3 py-1 border rounded-xl text-[10px] font-bold uppercase tracking-wider ${badgeColors[detailsOpportunity.type] || 'bg-gray-50'}`}>
                {detailsOpportunity.type}
              </span>

              {/* Metadata Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50/70 border border-gray-200/50 rounded-2xl">
                <div className="flex items-center text-gray-600 text-xs font-semibold gap-2">
                  <span>Location: {detailsOpportunity.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-gray-600 text-xs font-semibold gap-2">
                  <span>Salary: {detailsOpportunity.salary || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-gray-600 text-xs font-semibold gap-2 sm:col-span-2">
                  <span>Deadline: {detailsOpportunity.deadline ? new Date(detailsOpportunity.deadline).toLocaleDateString() : 'Not specified'}</span>
                </div>
              </div>

              {/* Required Skills Tags Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Required Skills Target</h3>
                <div className="flex flex-wrap gap-2 p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl">
                  {detailsOpportunity.skills ? (
                    detailsOpportunity.skills.split(',').map((skill, i) => (
                      <span 
                        key={i} 
                        className="px-2.5 py-1 text-[10px] font-extrabold bg-white text-indigo-600 border border-indigo-100 rounded-lg shadow-sm capitalize"
                      >
                        {skill.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-gray-400 font-medium pl-1">No explicit skill parameters cataloged.</span>
                  )}
                </div>
              </div>

              {/* Full Description Text Box */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Opportunity Description</h3>
                <div className="p-4 bg-white border border-gray-200 rounded-2xl">
                  <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line font-medium">
                    {detailsOpportunity.description}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={closeDetailsModal} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md">
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </StudentLayout>
  );
};

export default BrowseOpportunities;