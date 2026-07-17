// This is the Alumni Profile page.
// Alumni can set up their professional profile so students can find them.

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AlumniLayout from '../../components/AlumniLayout';

function AlumniProfile() {
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [openToConnect, setOpenToConnect] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const { user, changePassword } = useAuth();

  // Load existing profile on mount
  useEffect(() => {
    async function loadProfile() {
      // First try to get user name from /auth/me
      try {
        const meResponse = await api.get('/auth/me');
        if (meResponse.data.data && meResponse.data.data.name) {
          setFullName(meResponse.data.data.name);
        }
      } catch (err) {
        // Not critical if this fails
      }

      // Then load alumni profile
      try {
        const response = await api.get('/alumni/profile');
        const data = response.data.data;
        // Alumni profile name takes priority
        if (data.name) setFullName(data.name);
        setCompany(data.company || '');
        setJobTitle(data.jobTitle || '');
        setIndustry(data.industry || '');
        setLinkedinUrl(data.linkedinUrl || '');
        setGithubUrl(data.githubUrl || '');
        setLocation(data.location || '');
        setBio(data.bio || '');
        setWebsite(data.website || '');
        setPhone(data.phone || '');
        setOpenToConnect(data.openToConnect !== false);
      } catch (err) {
        // 404 means no profile yet — that's fine
        const status = err.response && err.response.status;
        if (status !== 404) {
          toast.error('Failed to load profile');
        }
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();

    // Validate required name
    if (!fullName.trim()) {
      toast.error('Full Name is required');
      return;
    }

    setIsSaving(true);
    try {
      const profileData = {
        name: fullName,
        company: company,
        jobTitle: jobTitle,
        industry: industry,
        linkedinUrl: linkedinUrl,
        githubUrl: githubUrl,
        location: location,
        bio: bio,
        website: website,
        phone: phone,
        email: user ? user.email : '',
        openToConnect: openToConnect,
      };
      await api.post('/alumni/profile', profileData);
      toast.success('Profile saved successfully!');
    } catch (err) {
      console.log("Save error:", err.response && err.response.data);
      toast.error('Failed to save profile');
    }
    setIsSaving(false);
  }

  async function handlePasswordChange(e) {
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
      toast.success("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      if (error.code === "auth/wrong-password" || error.message.includes("invalid-credential")) {
        toast.error("Current password is incorrect");
      } else {
        toast.error("Failed to update password: " + error.message);
      }
    }
    setChangingPassword(false);
  }

  if (isLoading) {
    return (
      <AlumniLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
      </AlumniLayout>
    );
  }

  const inputStyle = "w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-green-500 text-sm shadow-sm";
  const labelStyle = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";

  return (
    <AlumniLayout>
      {/* Visual page content box centered perfectly inside layout viewports */}
      <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 relative">
        
        {/* Ambient Glow Sprites */}
        <div className="absolute top-12 left-10 w-72 h-72 bg-green-200/20 rounded-full filter blur-3xl animate-pulse duration-[8000ms] -z-10" />
        <div className="absolute bottom-24 right-10 w-80 h-80 bg-emerald-200/15 rounded-full filter blur-3xl animate-pulse duration-[10000ms] -z-10" />

        {/* Header Section */}
        <div className="mb-10 text-center">
          <span className="inline-block text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full mb-3 border border-green-100">
            Identity Node
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text">
            My Profile
          </h1>
          <p className="mt-2.5 text-sm text-gray-500 max-w-xl mx-auto">
            Set up your professional portfolio matrix so student nodes can search, find, and link to your mentorship channel.
          </p>
        </div>

        {/* Frosted Glass Profile Form Container */}
        <div className="backdrop-blur-md bg-white/70 rounded-3xl border border-white/40 shadow-2xl shadow-gray-200/50 overflow-hidden mb-8 transform transition-all duration-500">
          <form onSubmit={handleSave}>
            <div className="p-6 sm:p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name — full width, first field */}
                <div className="md:col-span-2">
                  <label className={labelStyle}>Full Name *</label>
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ahmed Khan"
                    className={`${inputStyle} ${!fullName.trim() ? 'border-red-300 focus:ring-red-400/10 focus:border-red-500' : ''}`}
                    required 
                  />
                </div>

                <div>
                  <label className={labelStyle}>Company</label>
                  <input 
                    type="text" 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google" 
                    className={inputStyle} 
                  />
                </div>

                <div>
                  <label className={labelStyle}>Job Title</label>
                  <input 
                    type="text" 
                    value={jobTitle} 
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Software Engineer" 
                    className={inputStyle} 
                  />
                </div>

                <div>
                  <label className={labelStyle}>Industry</label>
                  <input 
                    type="text" 
                    value={industry} 
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Technology" 
                    className={inputStyle} 
                  />
                </div>

                <div>
                  <label className={labelStyle}>Location</label>
                  <input 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lahore, Pakistan" 
                    className={inputStyle} 
                  />
                </div>

                <div>
                  <label className={labelStyle}>LinkedIn URL</label>
                  <input 
                    type="url" 
                    value={linkedinUrl} 
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile" 
                    className={inputStyle} 
                  />
                </div>

                <div>
                  <label className={labelStyle}>GitHub URL</label>
                  <input 
                    type="url" 
                    value={githubUrl} 
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/yourusername" 
                    className={inputStyle} 
                  />
                </div>

                <div>
                  <label className={labelStyle}>Website</label>
                  <input 
                    type="url" 
                    value={website} 
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com" 
                    className={inputStyle} 
                  />
                </div>

                <div>
                  <label className={labelStyle}>Phone</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0300-1234567" 
                    className={inputStyle} 
                  />
                </div>

                {/* Bio - full width */}
                <div className="md:col-span-2">
                  <label className={labelStyle}>Bio</label>
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell students about your career journey..." 
                    rows={4}
                    className={`${inputStyle} resize-none leading-relaxed`} 
                  />
                </div>

                {/* Open to Connect toggle - full width */}
                <div className="md:col-span-2 pt-2">
                  <label className="flex items-center space-x-3.5 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={openToConnect}
                        onChange={(e) => setOpenToConnect(e.target.checked)}
                        className="sr-only" 
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${openToConnect ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${openToConnect ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                      Open to Connect with Students
                    </span>
                  </label>
                  <p className="text-xs text-gray-400 mt-2 ml-14 leading-relaxed">
                    When enabled, students can find and contact you through the Connect with Alumni resource panel.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Action Bar */}
            <div className="p-6 sm:px-10 py-8 bg-white/40 backdrop-blur-sm flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-10 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none text-sm inline-flex justify-center items-center gap-2"
              >
                {isSaving ? 'Saving Parameters...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password section */}
        <div className="backdrop-blur-md bg-white/70 rounded-3xl border border-white/40 shadow-2xl shadow-gray-200/50 overflow-hidden mb-8">
          <div className="px-6 sm:px-10 py-5 border-b border-gray-100/70 bg-white/40">
            <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
            <p className="text-xs text-gray-400 mt-0.5">Keep authentication parameters secure by regularly cycling passwords.</p>
          </div>

          <form onSubmit={handlePasswordChange}>
            <div className="p-6 sm:p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputStyle}
                    placeholder="••••••••"
                  />
                </div>
                <div className="hidden md:block"></div>
                <div>
                  <label className={labelStyle}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputStyle}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className={labelStyle}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={inputStyle}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Password Action Bar */}
            <div className="p-6 sm:px-10 py-8 bg-white/40 backdrop-blur-sm flex justify-end">
              <button
                type="submit"
                disabled={changingPassword}
                className="w-full sm:w-auto bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 hover:opacity-90 text-white px-10 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-slate-950/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none text-sm inline-flex justify-center items-center gap-2"
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </AlumniLayout>
  );
}

export default AlumniProfile;