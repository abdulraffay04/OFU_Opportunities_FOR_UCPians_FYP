// This is the Connect with Alumni page.
// Students can browse alumni profiles and contact them with search and filter functionality.

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import StudentLayout from '../../components/StudentLayout';
import { 
  BuildingOfficeIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  MagnifyingGlassIcon, 
  UserGroupIcon,
  XMarkIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

function ConnectAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndustry, setActiveIndustry] = useState('all');

  useEffect(() => { loadAlumni(); }, []);

  const loadAlumni = async () => {
    try {
      const response = await api.get('/alumni');
      setAlumni(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load alumni profiles');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique industries for filter dropdown
  const industries = ['all', ...new Set(alumni.map(a => a.industry || 'Other').filter(Boolean))];

  const filteredAlumni = alumni.filter(a => {
    const searchMatch = (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (a.company || '').toLowerCase().includes(searchQuery.toLowerCase());
    const industryMatch = activeIndustry === 'all' || (a.industry || 'Other') === activeIndustry;
    return searchMatch && industryMatch;
  });

  const getInitials = (name) => {
    if (!name) return 'A';
    const words = name.trim().split(' ');
    return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : words[0][0].toUpperCase();
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
        
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Connect with Alumni</h1>
          <p className="text-gray-500 text-sm mt-1">Explore our network and reach out for mentorship or career guidance.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl border border-white/50 p-4 shadow-xl shadow-gray-200/20 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative w-full lg:w-2/3">
            <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or company..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="w-full lg:w-1/3 py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10"
            value={activeIndustry}
            onChange={(e) => setActiveIndustry(e.target.value)}
          >
            {industries.map(ind => <option key={ind} value={ind} className="capitalize">{ind}</option>)}
          </select>
        </div>

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((a) => (
            <div key={a.id} className="backdrop-blur-md bg-white/70 rounded-3xl border border-white/50 p-6 text-center shadow-lg hover:shadow-2xl transition-all">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-black text-2xl shadow-xl shadow-indigo-600/20">
                {getInitials(a.name)}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">{a.name || 'Alumni Member'}</h3>
              <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4 flex items-center justify-center gap-1">
                <BriefcaseIcon className="w-3 h-3" /> {a.jobTitle || 'UCP Graduate'}
              </p>
              
              <div className="space-y-1 mb-6 text-xs text-gray-500 font-semibold">
                <p className="flex items-center justify-center gap-1.5"><BuildingOfficeIcon className="w-3.5 h-3.5" /> {a.company || 'Not specified'}</p>
                {a.location && <p className="flex items-center justify-center gap-1.5"><MapPinIcon className="w-3.5 h-3.5" /> {a.location}</p>}
              </div>

              <button 
                onClick={() => setSelectedAlumni(a)}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <EnvelopeIcon className="w-4 h-4" /> Contact Profile
              </button>
            </div>
          ))}
        </div>

        {/* Contact Popup */}
        {selectedAlumni && (
          <div className="fixed inset-0 backdrop-blur-sm bg-slate-950/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-black">Contact {selectedAlumni.name}</h2>
                <button onClick={() => setSelectedAlumni(null)}><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
              </div>
              <div className="space-y-3">
                {selectedAlumni.email && <a href={`mailto:${selectedAlumni.email}`} className="block bg-indigo-50 text-indigo-700 p-3 rounded-xl text-xs font-bold text-center">Email: {selectedAlumni.email}</a>}
                {selectedAlumni.linkedinUrl && <a href={selectedAlumni.linkedinUrl} target="_blank" rel="noreferrer" className="block bg-blue-600 text-white p-3 rounded-xl text-xs font-bold text-center">View LinkedIn</a>}
                <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600">{selectedAlumni.bio || "No bio available."}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default ConnectAlumni;