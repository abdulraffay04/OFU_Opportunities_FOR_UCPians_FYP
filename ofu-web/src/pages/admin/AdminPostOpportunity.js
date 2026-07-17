// This is the Admin Post Opportunity page.
// Admins can post official opportunities that are auto-approved.

import { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';

function AdminPostOpportunity() {
  // State for form fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState('job');
  const [location, setLocation] = useState('');
  const [organization, setOrganization] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requiredSkills, setRequiredSkills] = useState('');

  // Handle the form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Build the opportunity data to send to the backend
      const opportunityData = {
        title: title,
        type: type,
        location: location,
        organization: organization,
        description: description,
        deadline: deadline,
        requiredSkills: requiredSkills,
      };

      console.log("Posting opportunity:", opportunityData);

      await api.post('/admin/opportunities', opportunityData);

      // Show success message
      toast.success('Opportunity published successfully');

      // Clear the form after success
      setTitle('');
      setType('job');
      setLocation('');
      setOrganization('');
      setDescription('');
      setDeadline('');
      setRequiredSkills('');
    } catch (err) {
      console.log("Error:", err.response && err.response.status, err.response && err.response.data);
      toast.error('Failed to publish opportunity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = "w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-sm shadow-sm";
  const labelStyle = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";

  return (
    <AdminLayout>
      {/* Centered page wrapper */}
      <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 relative">
        
        {/* Ambient Decorative Crimson Light Blobs */}
        <div className="absolute top-12 left-10 w-72 h-72 bg-red-200/10 rounded-full filter blur-3xl animate-pulse duration-[8000ms] -z-10" />
        <div className="absolute bottom-24 right-10 w-80 h-80 bg-rose-200/10 rounded-full filter blur-3xl animate-pulse duration-[10000ms] -z-10" />

        {/* Header Section with elegant center alignment */}
        <div className="mb-10 text-center animate-fade-in-down duration-500">
          <span className="inline-block text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full mb-3 border border-red-100">
            Admin Authority Hub
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text">
            Post Official Opportunity
          </h1>
          <p className="mt-2.5 text-sm text-gray-500 max-w-xl mx-auto">
            Create verified opportunities on behalf of administration departments. These entries bypass vetting blocks and instantly go live.
          </p>
        </div>

        {/* Frosted Glass Form Container */}
        <div className="backdrop-blur-md bg-white/70 rounded-3xl border border-white/40 shadow-2xl shadow-gray-200/50 overflow-hidden transform transition-all duration-500 hover:shadow-red-950/5">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-100/70">
            
            {/* Section 1: Basic Classification */}
            <div className="p-6 sm:p-10 space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2.5">
                <div className="p-2 bg-red-50 rounded-lg text-red-500 border border-red-100/50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                Core Specification
              </h2>

              <div className="group">
                <label className={labelStyle}>Opportunity Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. UCP Annual Job Fair"
                  className={inputStyle}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Opportunity Type *</label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-sm appearance-none cursor-pointer shadow-sm text-gray-700"
                      required
                    >
                      <option value="scholarship">Scholarship</option>
                      <option value="job">Job Listing</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                      <option value="event">Official Event</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Campus / Remote"
                    className={inputStyle}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Hosting Entities */}
            <div className="p-6 sm:p-10 space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2.5">
                <div className="p-2 bg-red-50 rounded-lg text-red-500 border border-red-100/50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                Host & Deadlines
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Organization / Department *</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. UCP Administration"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className={labelStyle}>Application Deadline *</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-sm text-gray-700 shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Requirements Description */}
            <div className="p-6 sm:p-10 space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2.5">
                <div className="p-2 bg-red-50 rounded-lg text-red-500 border border-red-100/50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                Specifications
              </h2>

              <div>
                <label className={labelStyle}>Opportunity Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline complete details, registration guides, or agenda..."
                  rows={5}
                  className={`${inputStyle} resize-none leading-relaxed`}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Required Skills</label>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Comma-separated values</span>
                </div>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, MongoDB"
                  className={inputStyle}
                />
              </div>
            </div>

            {/* Form Footer Action */}
            <div className="p-6 sm:px-10 py-8 bg-white/40 backdrop-blur-sm flex justify-end gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-red-600/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none text-sm inline-flex justify-center items-center gap-2"
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
    </AdminLayout>
  );
}

export default AdminPostOpportunity;