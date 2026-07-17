// This is the Student Profile page.
// Students can view and edit their profile information here.

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import StudentLayout from '../../components/StudentLayout';

function StudentProfile() {
  // State for the profile form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [degree, setDegree] = useState('');
  const [semester, setSemester] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Get the user from AuthContext
  const { user, changePassword } = useAuth();

  // Load the user's profile when the page loads
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        const data = response.data.data;

        // Fill in the form fields with existing data
        setName(data.name || '');
        setEmail(data.email || '');
        setDegree(data.department || data.degree || '');
        setSemester(data.semester || '');
        setCgpa(data.cgpa || '');
        setPhone(data.phone || '');
        setSkills(data.skills || '');
        setBio(data.bio || '');

        // Check if all required fields are filled
        checkProfileComplete(data);
      } catch (err) {
        const status = err.response && err.response.status;

        if (status === 404) {
          // Profile does not exist yet — show empty form pre-filling email
          if (user && user.email) {
            setEmail(user.email);
          }
          setIsProfileComplete(false);
        } else {
          toast.error('Failed to load profile metrics');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Check if all required fields are filled in
  const checkProfileComplete = (data) => {
    const hasDepartment = data.department || data.degree;
    if (data.name && hasDepartment && data.semester && data.cgpa && data.phone && data.skills) {
      setIsProfileComplete(true);
    } else {
      setIsProfileComplete(false);
    }
  };

  // Handle the form submit to save the profile
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const profileData = {
        name: name,
        department: degree,
        semester: semester,
        cgpa: cgpa,
        phone: phone,
        skills: skills,
        bio: bio,
      };

      console.log("Sending to backend:", profileData);
      await api.patch('/users/profile', profileData);
      toast.success('Profile metrics synchronized successfully!');

      checkProfileComplete(profileData);
    } catch (err) {
      console.log("Error details:", err.response && err.response.data);
      toast.error('Failed to update system profile data');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Security token updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      if (error.code === "auth/wrong-password" || error.message.includes("invalid-credential")) {
        toast.error("Current account password parameter is incorrect");
      } else {
        toast.error("Failed to reconfigure credentials: " + error.message);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // Get the user's initials for the avatar
  const getInitials = () => {
    if (name) {
      const words = name.trim().split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return words[0][0].toUpperCase();
    }
    if (user && user.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
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
      <div className="max-w-4xl mx-auto relative space-y-8">
        
        {/* Ambient Decorative Graphic Blobs */}
        <div className="absolute top-12 left-10 w-64 h-64 bg-indigo-200/20 rounded-full filter blur-3xl animate-pulse duration-[8000ms] -z-10" />
        <div className="absolute bottom-24 right-10 w-72 h-72 bg-purple-200/20 rounded-full filter blur-3xl animate-pulse duration-[10000ms] -z-10" />

        {/* Page Heading */}
        <div>
          <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3 border border-indigo-100">
            Identity Module
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text">
            Profile Management
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-xl">
            Reconfigure structural placement records, showcase your technical skill array, and secure system access points.
          </p>
        </div>

        {/* ========== PROFILE COMPLETENESS MONITOR BANNER ========== */}
        {!isProfileComplete && (
          <div className="backdrop-blur-md bg-amber-50/80 border border-amber-200/70 rounded-2xl p-5 shadow-xl shadow-amber-900/5 flex items-start gap-4">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl mt-0.5 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 tracking-tight">Onboarding Actions Pending</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Your system profile metadata structure is currently incomplete. You must populate all required index fields marked with an asterisk <span className="font-extrabold text-amber-900">*</span> to acquire programmatic browsing and job placement eligibility tokens.
              </p>
            </div>
          </div>
        )}

        {/* ========== PRIMARY DATA COMPONENT CHASSIS ========== */}
        <div className="backdrop-blur-md bg-white/70 rounded-3xl border border-white/50 p-6 sm:p-8 shadow-xl shadow-gray-200/20 space-y-8">
          
          {/* Avatar Showcase Row */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-gray-100 w-full">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-600/20 border border-indigo-400/20 select-none">
              {getInitials()}
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">{name || 'Unidentified Candidate'}</h2>
              <p className="text-xs font-semibold text-slate-400 tracking-wide flex items-center justify-center sm:justify-start gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                {email}
              </p>
            </div>
          </div>

          {/* Core Fields Form Element */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Full Name input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-700 shadow-sm transition-all duration-300"
                  required
                />
              </div>

              {/* Read-Only Account Email input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Identifier Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 text-gray-400 text-sm font-medium rounded-xl cursor-not-allowed select-none shadow-sm"
                />
              </div>

              {/* Degree / Major text mapping */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Degree / Major discipline *</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. BS Computer Science"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-700 shadow-sm transition-all duration-300"
                  required
                />
              </div>

              {/* Semester structured selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Semester Track *</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-700 shadow-sm transition-all duration-300"
                  required
                >
                  <option value="">Select Semester</option>
                  {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map((sem) => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>

              {/* CGPA validation matrix input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cumulative CGPA *</label>
                <input
                  type="text"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g. 3.50"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-700 shadow-sm transition-all duration-300"
                  required
                />
              </div>

              {/* Mobile Phone Number input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Contact *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0325-7899976"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-700 shadow-sm transition-all duration-300"
                  required
                />
              </div>

              {/* Skills tokenization area input */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Skills Asset Taxonomy (comma-separated) *</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Python, Javascript, AI Optimization"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-700 shadow-sm transition-all duration-300"
                  required
                />
              </div>

              {/* Paragraph Biography long-form input */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Short Biography Abstract</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summarize engineering goals or experiential qualifications briefly..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-700 shadow-sm resize-none transition-all duration-300"
                />
              </div>

            </div>

            {/* Mutator save trigger panel */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSaving ? 'Synchronizing...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* ========== SECURITY ACCOUNT PARAMETERS MODULE ========== */}
        <div className="backdrop-blur-md bg-white/70 rounded-3xl border border-white/40 shadow-xl shadow-gray-200/20 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2 bg-violet-50 rounded-xl text-violet-500 border border-violet-100/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Security Credentials Vault</h3>
              <p className="text-xs text-gray-400 mt-0.5">Modify system entry tokens to secure active sessions.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Current security token */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-700 shadow-sm transition-all duration-300"
                />
              </div>
              
              <div className="hidden md:block"></div>
              
              {/* New structural password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-700 shadow-sm transition-all duration-300"
                />
              </div>
              
              {/* Validation tracking match block */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-700 shadow-sm transition-all duration-300"
                />
              </div>

            </div>

            {/* Submission access key update trigger */}
            <div className="flex justify-start pt-2">
              <button
                type="submit"
                disabled={changingPassword}
                className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-violet-600/10 hover:shadow-lg hover:shadow-violet-600/20 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
              >
                {changingPassword ? 'Updating Vault...' : 'Update Security Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </StudentLayout>
  );
}

export default StudentProfile;