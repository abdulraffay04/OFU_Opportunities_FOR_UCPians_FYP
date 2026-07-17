// This is the Admin Applications page.
// Admin can view all applications for opportunities they posted.

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import {
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  StarIcon,
  ChevronDownIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

// Reusable premium accordion section component
const AccordionSection = ({ title, defaultOpen, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen || false);

  return (
    <div className="border border-gray-100/80 rounded-2xl overflow-hidden bg-white/50 shadow-sm transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
      >
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-500' : ''}`}
        />
      </button>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 py-4 border-t border-gray-50/50 bg-white/40">{children}</div>
      </div>
    </div>
  );
};

function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  // Search and Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState('all');

  useEffect(() => { loadApplications(); }, []);

  const loadApplications = async () => {
    try {
      const response = await api.get('/applications/admin/all');
      setApplications(response.data.data || []);
    } catch (err) {
      console.log("Load admin apps error:", err.response && err.response.data);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name || name === 'Student') return 'S';
    const words = name.trim().split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return words[0][0].toUpperCase();
  };

  const getMatchLevel = (student) => {
    if (!student || !student.skills) return 'low';
    let parts = student.skills.split(',');
    if (parts.length <= 1) parts = student.skills.split(' ');
    const count = parts.filter(s => s.trim().length > 0).length;
    if (count > 3) return 'high';
    if (count >= 2) return 'medium';
    return 'low';
  };

  const getMatchBadge = (student) => {
    const level = getMatchLevel(student);
    if (level === 'high') return { text: 'High Match', color: 'bg-green-50 text-green-700 border-green-100' };
    if (level === 'medium') return { text: 'Medium Match', color: 'bg-amber-50 text-yellow-800 border-amber-100' };
    return { text: 'Low Match', color: 'bg-red-50 text-red-700 border-red-100' };
  };

  const parseSkills = (skillsStr) => {
    if (!skillsStr) return [];
    return skillsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
  };

  const getStudentName = (app) => {
    if (app.student && app.student.name && app.student.name !== 'Student') return app.student.name;
    if (app.student && app.student.email) return app.student.email;
    return 'Student';
  };

  const cleanResumeUrl = (url) => {
    if (!url) return '';
    url = url.replace('/fl_attachment/', '/');
    url = url.replace('/fl_attachment', '');
    return url;
  };

  const handleViewResume = (resumeUrl, studentName) => {
    if (!resumeUrl) { toast.error('No resume uploaded'); return; }
    const cleanUrl = cleanResumeUrl(resumeUrl);
    window.open(cleanUrl, '_blank');
  };

  const handleDownloadResume = (resumeUrl, studentName) => {
    if (!resumeUrl) { toast.error('No resume uploaded'); return; }
    const cleanUrl = cleanResumeUrl(resumeUrl);
    const downloadName = (studentName || 'resume').replace(/\s+/g, '_') + '.pdf';
    const link = document.createElement('a');
    link.href = cleanUrl;
    link.download = downloadName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      setSelectedApp(null);
      toast.success(`Application ${newStatus}`);
    } catch (err) {
      console.log("Status update error:", err.response && err.response.data);
      toast.error('Failed to update application');
    }
  };

  const getStatusBadgeStyle = (status) => {
    if (status === 'accepted') return 'bg-green-50 text-green-700 border-green-100';
    if (status === 'rejected') return 'bg-red-50 text-red-700 border-red-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  // Extract list of unique opportunity titles for dropdown filtering options
  const uniqueOpportunities = ['all', ...new Set(applications.map(app => app.opportunityTitle).filter(Boolean))];

  // Pipeline Filter Logic Processor
  const filteredApplications = applications.filter(app => {
    const studentName = getStudentName(app).toLowerCase();
    const studentSkills = (app.student?.skills || '').toLowerCase();
    const opportunityTitle = (app.opportunityTitle || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    // 1. Text Search Filter
    const matchesSearch = studentName.includes(query) || studentSkills.includes(query) || opportunityTitle.includes(query);

    // 2. Dropdown Position Filter
    const matchesOpportunity = selectedOpportunity === 'all' || app.opportunityTitle === selectedOpportunity;

    // 3. Dropdown Skills Match Index Filter
    const matchesLevel = selectedMatch === 'all' || getMatchLevel(app.student) === selectedMatch;

    return matchesSearch && matchesOpportunity && matchesLevel;
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-4 relative">
        
        {/* Background Ambient Glow Sprites */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-red-200/10 rounded-full filter blur-3xl animate-pulse duration-[8000ms] -z-10" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-rose-200/10 rounded-full filter blur-3xl animate-pulse duration-[10000ms] -z-10" />

        {/* Page Header */}
        <div className="mb-10">
          <span className="inline-block text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full mb-3 border border-red-100">
            Admin Channel
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Applications Received</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-xl">
            Manage student applications submitted to official university opportunities and administer candidate updates.
          </p>
        </div>

        {/* ========== ACTIVE INTERACTIVE SEARCH & FILTER CORE BAR ========== */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl border border-white/50 p-4 sm:p-5 shadow-xl shadow-gray-200/30 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          
          {/* Real-time text query search field */}
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <MagnifyingGlassIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, skills..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-red-400/10 focus:border-red-500 text-gray-700 shadow-sm"
            />
          </div>

          {/* Opportunity Dropdown Filter */}
          <div className="relative inline-flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FunnelIcon className="w-4 h-4" />
            </div>
            <select
              value={selectedOpportunity}
              onChange={(e) => setSelectedOpportunity(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-red-400/10 focus:border-red-500 appearance-none cursor-pointer text-gray-700 shadow-sm font-medium"
            >
              <option value="all">Filter by Position Link</option>
              {uniqueOpportunities.filter(t => t !== 'all').map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <ChevronDownIcon className="w-4 h-4" />
            </div>
          </div>


        </div>

        {/* ========== EMPTY STATE ========== */}
        {filteredApplications.length === 0 && (
          <div className="backdrop-blur-md bg-white/70 text-center py-20 rounded-3xl border border-white/40 shadow-2xl shadow-gray-200/20">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <InboxIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-800 text-lg font-bold tracking-tight">No matching data compiled</p>
            <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto">
              We couldn't track any records syncing with the search query parameters or filter indexes applied.
            </p>
          </div>
        )}

        {/* ========== APPLICATIONS GRID ========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((app) => {
            const student = app.student || {};
            const badge = getMatchBadge(student);
            const studentName = getStudentName(app);

            return (
              <div key={app.id} className="backdrop-blur-md bg-white/70 rounded-3xl border border-white/40 shadow-xl shadow-gray-200/15 p-6 flex flex-col justify-between transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-gradient-to-tr from-red-600 to-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/10">
                      <span className="text-white font-extrabold text-base tracking-tight">{getInitials(studentName)}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate tracking-tight">{studentName}</h3>
                      <p className="text-gray-400 text-xs truncate mt-0.5 font-medium">{app.opportunityTitle || ''}</p>
                    </div>
                  </div>

                  <p className="text-gray-500 text-xs mb-4 line-clamp-2 font-medium bg-gray-50/50 p-2.5 border border-gray-100 rounded-xl">
                    {student.skills || 'No unique technical tags compiled.'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className={`px-2.5 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>{badge.text}</span>
                    {app.status !== 'submitted' && (
                      <span className={`px-2.5 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider capitalize ${getStatusBadgeStyle(app.status)}`}>
                        {app.status}
                      </span>
                    )}
                  </div>

                  <button 
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    className="w-full bg-white border border-gray-200 hover:border-red-500 text-gray-700 hover:text-red-600 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm"
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========== PROFILE MODAL ========== */}
        {selectedApp && (() => {
          const student = selectedApp.student || {};
          const studentName = getStudentName(selectedApp);

          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/80 bg-gray-50/50 flex-shrink-0">
                  <h2 className="text-base font-bold text-gray-800 tracking-tight">Applicant Portfolio Data</h2>
                  <button type="button" onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-all">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-6 py-6 space-y-5">
                  <div className="text-center pb-4 border-b border-gray-100/80">
                    <div className="w-16 h-16 bg-gradient-to-tr from-red-600 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-500/10">
                      <span className="text-white font-extrabold text-xl tracking-tight">{getInitials(studentName)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">{studentName}</h3>
                    <p className="text-xs font-medium text-gray-400 mt-1">
                      Applied targeting: <span className="text-red-600 font-semibold">{selectedApp.opportunityTitle || 'N/A'}</span>
                    </p>
                  </div>

                  <AccordionSection title="Contact Credentials" defaultOpen={false}>
                    <div className="space-y-2.5">
                      {student.email ? (
                        <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 font-medium">{student.email}</span>
                        </div>
                      ) : <p className="text-xs text-gray-400">No email defined.</p>}
                      {student.phone ? (
                        <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                          <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 font-medium">{student.phone}</span>
                        </div>
                      ) : <p className="text-xs text-gray-400">No telemetry phone parameter.</p>}
                    </div>
                  </AccordionSection>

                  <AccordionSection title="Academic Matrices" defaultOpen={false}>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                        <div className="flex items-center gap-1 mb-1 text-gray-400">
                          <AcademicCapIcon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Dept</span>
                        </div>
                        <p className="text-sm font-bold text-gray-700 truncate">{student.department || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Term</span>
                        <p className="text-sm font-bold text-gray-700">{student.semester || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3 border-l-4 border-l-red-500">
                        <div className="flex items-center gap-1 mb-1 text-gray-400">
                          <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">CGPA</span>
                        </div>
                        <p className="text-sm font-black text-gray-800">{student.cgpa || 'N/A'}</p>
                      </div>
                    </div>
                    {student.bio && (
                      <div className="mt-3 bg-gray-50/50 border border-gray-100 rounded-xl p-3.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Statement Biography</span>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">{student.bio}</p>
                      </div>
                    )}
                  </AccordionSection>

                  <AccordionSection title="Compiled Stack Skills" defaultOpen={true}>
                    {parseSkills(student.skills).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {parseSkills(student.skills).map((skill, idx) => (
                          <span key={idx} className="bg-red-50 text-red-700 px-3 py-1 border border-red-100/50 rounded-xl text-xs font-bold">{skill}</span>
                        ))}
                      </div>
                    ) : <p className="text-xs text-gray-400">No skill descriptors found.</p>}
                  </AccordionSection>

                  <AccordionSection title="Cover Pitch Letter" defaultOpen={false}>
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50/50 border border-gray-100 rounded-xl p-4 font-medium">
                      {selectedApp.coverLetter || 'No cover letter context provided.'}
                    </p>
                  </AccordionSection>

                  <div className="border border-gray-100 rounded-2xl px-5 py-4 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm text-red-500">
                        <DocumentIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-800 block leading-tight">Curriculum Vitae</span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5 block">Format Protocol: PDF</span>
                      </div>
                    </div>
                    {selectedApp.resumeUrl ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewResume(selectedApp.resumeUrl, studentName)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <DocumentIcon className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadResume(selectedApp.resumeUrl, studentName)}
                          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                          Download
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 font-medium">No system resume uploaded</p>
                    )}
                  </div>
                </div>

                {/* Bottom buttons */}
                <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex-shrink-0">
                  {selectedApp.status === 'submitted' ? (
                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => handleStatusUpdate(selectedApp.id, 'accepted')}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-green-600/10 transform active:scale-95 transition-transform"
                      >
                        Accept Candidate
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleStatusUpdate(selectedApp.id, 'rejected')}
                        className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-red-500/10 transform active:scale-95 transition-transform"
                      >
                        Reject Application
                      </button>
                      <button 
                        type="button"
                        onClick={() => setSelectedApp(null)}
                        className="flex-1 bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 py-3 rounded-xl text-xs font-bold"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 items-center justify-between">
                      <span className={`px-4 py-2 border rounded-full text-xs font-bold uppercase tracking-wider capitalize ${getStatusBadgeStyle(selectedApp.status)}`}>
                        {selectedApp.status}
                      </span>
                      <button 
                        type="button"
                        onClick={() => setSelectedApp(null)}
                        className="px-6 bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 py-2.5 rounded-xl text-xs font-bold"
                      >
                        Close Portal
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })()}
      </div>
    </AdminLayout>
  );
}

export default AdminApplications;