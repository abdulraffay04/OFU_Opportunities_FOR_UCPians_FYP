// This is the Saved Opportunities page.
// Students can view and manage their bookmarked opportunities, with details and apply capability.

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import StudentLayout from '../../components/StudentLayout';

const badgeColors = {
  job: 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
  internship: 'bg-blue-50 text-blue-700 border-blue-100/80',
  scholarship: 'bg-amber-50 text-amber-700 border-amber-100/80',
  freelance: 'bg-orange-50 text-orange-700 border-orange-100/80',
  event: 'bg-purple-50 text-purple-700 border-purple-100/80',
};

const SavedOpportunities = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsOpportunity, setDetailsOpportunity] = useState(null);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    try {
      const response = await api.get('/saved');
      setSavedItems(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load saved opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (opportunityId) => {
    try {
      await api.delete(`/saved/${opportunityId}`);
      setSavedItems((prev) => prev.filter((item) => item.opportunityID !== opportunityId));
      toast.success('Removed from saved');
    } catch (err) {
      toast.error('Failed to remove bookmark');
    }
  };

  const openApplyModal = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setCoverLetter('');
    setResumeFile(null);
    setShowApplyModal(true);
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setSelectedOpportunity(null);
    setCoverLetter('');
    setResumeFile(null);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsOpportunity(null);
  };

  const handleApply = async () => {
    if (!coverLetter.trim() || !resumeFile) {
      toast.error('Please fill in cover letter and upload PDF');
      return;
    }
    setIsApplying(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const uploadRes = await api.post('/uploads/resume', formData);
      await api.post('/applications', {
        opportunityID: selectedOpportunity.id,
        coverLetter,
        resumeUrl: uploadRes.data.data.url,
      });
      toast.success('Application submitted!');
      closeApplyModal();
    } catch (err) {
      toast.error('Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

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
      <div className="max-w-7xl mx-auto py-4 relative space-y-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Saved Opportunities</h1>

        {savedItems.length === 0 && (
          <div className="backdrop-blur-md bg-white/70 text-center py-20 rounded-3xl border border-white/40 shadow-2xl">
            <p className="text-gray-500 font-semibold">No bookmarked items</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedItems.map((item) => {
            const opp = item.opportunity;
            if (!opp) return null;
            const typeColor = badgeColors[opp.type] || 'bg-gray-50';

            return (
              <div key={item.id} className="backdrop-blur-md bg-white/70 rounded-3xl border border-white/50 p-6 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 border rounded-xl text-[10px] font-bold uppercase ${typeColor}`}>
                      {opp.type}
                    </span>
                    <button onClick={() => handleUnsave(item.opportunityID)} className="text-indigo-500 hover:text-red-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z" /></svg>
                    </button>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">{opp.title}</h3>
                  <p className="text-gray-500 text-xs line-clamp-3 mb-6">{opp.description}</p>
                </div>
                
                <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                  <button onClick={() => { setDetailsOpportunity(opp); setShowDetailsModal(true); }} className="flex-1 bg-white border border-gray-200 py-2.5 rounded-xl text-xs font-bold text-gray-700">View Details</button>
                  <button onClick={() => openApplyModal(opp)} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold">Apply</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* APPLY MODAL */}
        {showApplyModal && selectedOpportunity && (
          <div className="fixed inset-0 backdrop-blur-sm bg-slate-950/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-black">Apply for {selectedOpportunity.title}</h2>
              <textarea className="w-full border rounded-xl p-3 text-sm" placeholder="Cover Letter..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
              <input type="file" onChange={(e) => setResumeFile(e.target.files[0])} />
              <button onClick={handleApply} disabled={isApplying} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold">
                {isApplying ? 'Uploading...' : 'Submit Application'}
              </button>
              <button onClick={closeApplyModal} className="w-full text-gray-500 text-sm">Cancel</button>
            </div>
          </div>
        )}

        {/* DETAILS MODAL */}
        {showDetailsModal && detailsOpportunity && (
          <div className="fixed inset-0 backdrop-blur-sm bg-slate-950/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 rounded-3xl p-8 w-full max-w-lg space-y-4">
              <h2 className="text-xl font-black">{detailsOpportunity.title}</h2>
              <div className="flex flex-wrap gap-2">
                {detailsOpportunity.skills?.split(',').map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] rounded-lg border font-bold">{s.trim()}</span>
                ))}
              </div>
              <p className="text-sm text-gray-600">{detailsOpportunity.description}</p>
              <button onClick={closeDetailsModal} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold">Close</button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default SavedOpportunities;