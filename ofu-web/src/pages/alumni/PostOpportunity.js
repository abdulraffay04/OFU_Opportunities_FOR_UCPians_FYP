// This is the Post Opportunity page for alumni/employers.
// They can submit new opportunities for admin review.

import { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AlumniLayout from '../../components/AlumniLayout';

function PostOpportunity() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('freelance');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert the date input (YYYY-MM-DD) to ISO8601 format
      var deadlineISO = new Date(deadline).toISOString();

      var data = {
        title: title,
        type: type,
        location: location,
        salary: salary,
        description: description,
        deadline: deadlineISO,
        industry: 'Technology',
        requiredSkills: requiredSkills,
      };

      console.log("Submitting opportunity:", data);

      await api.post('/opportunities', data);
      toast.success('Opportunity submitted for admin review');

      // Clear form
      setTitle('');
      setType('freelance');
      setLocation('');
      setSalary('');
      setDescription('');
      setDeadline('');
      setRequiredSkills('');
    } catch (err) {
      console.log("API error:", err.response && err.response.status, err.response && err.response.data);
      toast.error('Failed to submit opportunity');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AlumniLayout>
      {/* Centered page wrapper utilizing standard margins within standard layout bounds */}
      <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 relative">
        
        {/* Ambient Decorative Light Blobs */}
        <div className="absolute top-12 left-10 w-72 h-72 bg-green-200/20 rounded-full filter blur-3xl animate-pulse duration-[8000ms] -z-10" />
        <div className="absolute bottom-24 right-10 w-80 h-80 bg-emerald-200/15 rounded-full filter blur-3xl animate-pulse duration-[10000ms] -z-10" />

        {/* Header Section with slide-down entry animation */}
        <div className="mb-10 text-center animate-fade-in-down duration-500">
          <span className="inline-block text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full mb-3 border border-green-100">
            Publish Hub
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text">
            Post a New Opportunity
          </h1>
          <p className="mt-2.5 text-sm text-gray-500 max-w-xl mx-auto">
            Share jobs, internships, or projects with your alumni network. Submissions will be vetted by administrators.
          </p>
        </div>

        {/* Frosted Glass Form Container */}
        <div className="backdrop-blur-md bg-white/70 rounded-3xl border border-white/40 shadow-2xl shadow-gray-200/50 overflow-hidden transform transition-all duration-500 hover:shadow-emerald-950/5">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-100/70">
            
            {/* Section 1: Core Details */}
            <div className="p-6 sm:p-10 space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2.5">
                <div className="p-2 bg-green-50 rounded-lg text-green-500 border border-green-100/50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                Basic Information
              </h2>
              
              <div className="group">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 text-sm shadow-sm" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Opportunity Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={type} 
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 text-sm appearance-none cursor-pointer shadow-sm text-gray-700" 
                      required
                    >
                      <option value="freelance">Freelance Project</option>
                      <option value="job">Full-time Job</option>
                      <option value="internship">Internship</option>
                      <option value="scholarship">Scholarship</option>
                      <option value="event">Event</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <svg className="w-4 h-4 transition-transform duration-300 group-focus-within:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote / Lahore, PK"
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 text-sm shadow-sm" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Logistics & Budget */}
            <div className="p-6 sm:p-10 space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2.5">
                <div className="p-2 bg-green-50 rounded-lg text-green-500 border border-green-100/50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                Logistics & Budget
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Budget / Salary Range
                  </label>
                  <input 
                    type="text" 
                    value={salary} 
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. 150,000 - 200,000 PKR"
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 text-sm shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Application Deadline <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    value={deadline} 
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 text-sm text-gray-700 shadow-sm" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Detailed Specifications */}
            <div className="p-6 sm:p-10 space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2.5">
                <div className="p-2 bg-green-50 rounded-lg text-green-500 border border-green-100/50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                Requirements & Description
              </h2>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the responsibilities, day-to-day tasks, and clear project expectations..." 
                  rows={5}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 text-sm resize-none leading-relaxed shadow-sm" 
                  required 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Required Skills</label>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Comma-separated values</span>
                </div>
                <input 
                  type="text" 
                  value={requiredSkills} 
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, TailwindCSS"
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 text-sm shadow-sm" 
                />
              </div>
            </div>

            {/* Form Footer Action */}
            <div className="p-6 sm:px-10 py-8 bg-white/40 backdrop-blur-sm flex justify-end gap-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none text-sm inline-flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish Opportunity
                    <svg className="w-4 h-4 ml-0.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </AlumniLayout>
  );
}

export default PostOpportunity;