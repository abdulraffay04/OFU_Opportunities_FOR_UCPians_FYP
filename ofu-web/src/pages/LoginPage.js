// LoginPage.js - Optimized for professional institutional portals

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function isValidUCPEmail(email) {
  const ucpPattern = /^L1[FS]\d{2}[A-Z]+\d{4}@ucp\.edu\.pk$/i;
  return ucpPattern.test(email);
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await login(email, password);
      const tokenResult = await result.user.getIdTokenResult();
      const userRole = tokenResult.claims.role;

      if (userRole === 'student') {
        const userEmail = result.user.email || email;
        if (!isValidUCPEmail(userEmail)) {
          toast.error('Student accounts must use UCP email address');
          await logout();
          setIsLoading(false);
          return;
        }
      }

      toast.success('Login successful!');
      if (userRole === 'student') navigate('/student/opportunities');
      else if (userRole === 'alumni' || userRole === 'employer') navigate('/alumni/post');
      else if (userRole === 'admin') navigate('/admin/pending');
      else navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        
        {/* Institutional Branding */}
        <div className="text-center mb-10">
          <div className="w-10 h-10 bg-slate-900 rounded-sm flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-sm">O</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-widest">OFU Portal</h1>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-lg font-black text-slate-900 mb-1">Authentication</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                placeholder="name@ucp.edu.pk"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
              <a href="#forgot" className="text-slate-400 hover:text-slate-900">Forgot Password</a>
              <Link to="/signup" className="text-indigo-700 hover:text-indigo-900">Create Account</Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-indigo-800 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
          © 2026 UCP Placement Office. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;