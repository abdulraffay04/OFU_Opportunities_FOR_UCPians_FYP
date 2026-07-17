// SignupPage.js - Optimized for professional institutional portals

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function isValidUCPEmail(email) {
  const ucpPattern = /^L1[FS]\d{2}[A-Z]+\d{4}@ucp\.edu\.pk$/i;
  return ucpPattern.test(email);
}

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (selectedRole === 'student' && !isValidUCPEmail(email)) {
      toast.error('Students must use their UCP email address');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password, name, selectedRole);
      toast.success('Account created successfully!');
      
      if (selectedRole === 'student') navigate('/student/opportunities');
      else if (selectedRole === 'alumni' || selectedRole === 'employer') navigate('/alumni/post');
      else navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="w-10 h-10 bg-slate-900 rounded-sm flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-sm">O</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-widest">OFU Portal</h1>
        </div>

        {/* Signup Card */}
        <div className="bg-white border border-slate-200 p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-lg font-black text-slate-900 mb-1">Registration</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Create your institutional account</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                placeholder="name@ucp.edu.pk"
                required
              />
              {selectedRole === 'student' && (
                <p className="text-[9px] font-bold text-indigo-700 mt-2 uppercase tracking-widest">
                  Required: Institutional UCP Email
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Account Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              >
                <option value="student">Student</option>
                <option value="alumni">Alumni</option>
                <option value="employer">Employer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Confirm</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-indigo-800 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Register Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 hover:text-indigo-900">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
          © 2026 UCP Placement Office. All data is protected.
        </p>
      </div>
    </div>
  );
}

export default SignupPage;