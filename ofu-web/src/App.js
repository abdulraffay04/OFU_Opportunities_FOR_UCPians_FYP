// This is the main App component.
// It sets up routing for all pages and wraps the app in AuthProvider.

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Student pages
import StudentProfile from './pages/student/StudentProfile';
import BrowseOpportunities from './pages/student/BrowseOpportunities';
import SavedOpportunities from './pages/student/SavedOpportunities';
import ConnectAlumni from './pages/student/ConnectAlumni';
import ResumeAnalyzer from './pages/student/ResumeAnalyzer';
import Chatbot from './pages/student/Chatbot';

// Alumni and Employer pages
import PostOpportunity from './pages/alumni/PostOpportunity';
import ApplicationsReceived from './pages/alumni/ApplicationsReceived';
import MyPostedOpportunities from './pages/alumni/MyPostedOpportunities';
import AlumniProfile from './pages/alumni/AlumniProfile';

// Admin pages
import AdminPostOpportunity from './pages/admin/AdminPostOpportunity';
import PendingOpportunities from './pages/admin/PendingOpportunities';
import AdminApplications from './pages/admin/AdminApplications';
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/Analytics';

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <BrowserRouter>
        <Routes>

          {/* Public routes — no authentication needed */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Student routes — only students can access */}
          <Route path="/student/profile" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentProfile />
            </ProtectedRoute>
          } />
          <Route path="/student/opportunities" element={
            <ProtectedRoute allowedRoles={['student']}>
              <BrowseOpportunities />
            </ProtectedRoute>
          } />
          <Route path="/student/saved" element={
            <ProtectedRoute allowedRoles={['student']}>
              <SavedOpportunities />
            </ProtectedRoute>
          } />
          <Route path="/student/alumni" element={
            <ProtectedRoute allowedRoles={['student']}>
              <ConnectAlumni />
            </ProtectedRoute>
          } />
          <Route path="/student/resume" element={
            <ProtectedRoute allowedRoles={['student']}>
              <ResumeAnalyzer />
            </ProtectedRoute>
          } />
          <Route path="/student/chatbot" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Chatbot />
            </ProtectedRoute>
          } />

          {/* Alumni and Employer routes — alumni and employers can access */}
          <Route path="/alumni/post" element={
            <ProtectedRoute allowedRoles={['alumni', 'employer']}>
              <PostOpportunity />
            </ProtectedRoute>
          } />
          <Route path="/alumni/applications" element={
            <ProtectedRoute allowedRoles={['alumni', 'employer']}>
              <ApplicationsReceived />
            </ProtectedRoute>
          } />
          <Route path="/alumni/my-posts" element={
            <ProtectedRoute allowedRoles={['alumni', 'employer']}>
              <MyPostedOpportunities />
            </ProtectedRoute>
          } />
          <Route path="/alumni/profile" element={
            <ProtectedRoute allowedRoles={['alumni', 'employer']}>
              <AlumniProfile />
            </ProtectedRoute>
          } />

          {/* Admin routes — only admins can access */}
          <Route path="/admin/post" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPostOpportunity />
            </ProtectedRoute>
          } />
          <Route path="/admin/pending" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PendingOpportunities />
            </ProtectedRoute>
          } />
          <Route path="/admin/applications" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminApplications />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Analytics />
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
