// ResumeAnalyzer.js
// This page lets students upload their resume for AI-powered analysis.
// Shows ATS score, skills found, improvement suggestions, and job match results.

import { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import StudentLayout from '../../components/StudentLayout';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

function ResumeAnalyzer() {
  // State for file upload and text input
  var [selectedFile, setSelectedFile] = useState(null);
  var [jobDescription, setJobDescription] = useState('');
  var [pastedText, setPastedText] = useState('');
  var [loading, setLoading] = useState(false);
  var [result, setResult] = useState(null);

  // Handle when user picks a file
  function handleFileChange(e) {
    var file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      toast.success('File selected: ' + file.name);
    }
  }

  // Send the resume to the AI service for analysis
  async function handleAnalyze() {
    // Make sure user provided either a file or pasted text
    if (!selectedFile && !pastedText.trim()) {
      toast.error('Please upload a file or paste resume text');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      // Build the form data to send to the backend
      var formData = new FormData();

      if (selectedFile) {
        // User uploaded a file
        formData.append('file', selectedFile);
      } else {
        // User pasted text - convert to a text file
        var blob = new Blob([pastedText], { type: 'text/plain' });
        formData.append('file', blob, 'resume.txt');
      }

      // Add job description if user provided one
      if (jobDescription.trim()) {
        formData.append('job_description', jobDescription.trim());
      }

      // Send to our Node.js backend (which forwards to Python AI service)
      var response = await api.post('/ai/analyze-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000, // 90 seconds for AI processing
      });

      setResult(response.data.data);
      toast.success('Analysis complete!');
    } catch (err) {
      console.log('Analysis error:', err);
      var errorMessage = err.response?.data?.error || err.message;
      toast.error('Analysis failed: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Reset the form to analyze another resume
  function handleReset() {
    setSelectedFile(null);
    setJobDescription('');
    setPastedText('');
    setResult(null);
  }

  // Get the color for the ATS score based on the grade
  function getScoreColor(grade) {
    if (grade === 'High') {
      return '#22c55e';
    }
    if (grade === 'Medium') {
      return '#f59e0b';
    }
    return '#ef4444';
  }

  // Get the color class for the score circle border
  function getScoreClasses(grade) {
    if (grade === 'High') {
      return 'text-green-500 border-green-500';
    }
    if (grade === 'Medium') {
      return 'text-yellow-500 border-yellow-500';
    }
    return 'text-red-500 border-red-500';
  }

  return (
    <StudentLayout>
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Resume Analyzer</h1>

      {/* Show results or upload form */}
      {result ? (
        // ========== RESULTS VIEW ==========
        <div className="space-y-6">

          {/* ATS Score Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ATS Score</h2>
            <div
              className={'w-32 h-32 rounded-full border-4 flex items-center justify-center mx-auto mb-4 ' + getScoreClasses(result.ats?.grade)}
              style={{ borderColor: getScoreColor(result.ats?.grade) }}
            >
              <span className="text-4xl font-bold" style={{ color: getScoreColor(result.ats?.grade) }}>
                {Math.round(result.ats?.score || 0)}
              </span>
            </div>
            <p className="text-lg font-medium" style={{ color: getScoreColor(result.ats?.grade) }}>
              {result.ats?.grade || 'N/A'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Confidence: {result.ats?.confidence || 0}%
            </p>
          </div>

          {/* Skills Found */}
          {result.resume_skills && result.resume_skills.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Skills Found ({result.resume_skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.resume_skills.map(function (skill, index) {
                  return (
                    <span
                      key={index}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Improvement Suggestions */}
          {result.improvements && result.improvements.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Suggestions for Improvement
              </h3>
              <ol className="space-y-3">
                {result.improvements.map(function (tip, index) {
                  return (
                    <li key={index} className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{tip}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* Job Match Section - only show if job description was provided */}
          {result.match && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Match Score</h3>

              {/* Match score */}
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-indigo-600">
                  {Math.round(result.match.match_score || 0)}%
                </span>
                <p className="text-gray-500 text-sm mt-1">overall match</p>
              </div>

              {/* Matched skills */}
              {result.match.matched_skills && result.match.matched_skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Matched Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {result.match.matched_skills.map(function (skill, index) {
                      return (
                        <span
                          key={index}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {result.match.missing_skills && result.match.missing_skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Missing Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {result.match.missing_skills.map(function (skill, index) {
                      return (
                        <span
                          key={index}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resume Completeness / Contact Info */}
          {result.contact_info && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Completeness</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Each checklist item */}
                {[
                  { label: 'Email', key: 'has_email' },
                  { label: 'Phone', key: 'has_phone' },
                  { label: 'LinkedIn', key: 'has_linkedin' },
                  { label: 'GitHub', key: 'has_github' },
                  { label: 'Summary', key: 'has_summary' },
                  { label: 'Experience', key: 'has_experience' },
                  { label: 'Education', key: 'has_education' },
                  { label: 'Certifications', key: 'has_certifications' },
                  { label: 'Dates', key: 'has_dates' },
                ].map(function (item) {
                  var hasItem = result.contact_info[item.key];
                  return (
                    <div key={item.key} className="flex items-center gap-2">
                      {hasItem ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-400" />
                      )}
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                  );
                })}
              </div>
              {result.contact_info.word_count && (
                <p className="text-sm text-gray-500 mt-4">
                  Word count: {result.contact_info.word_count}
                </p>
              )}
            </div>
          )}

          {/* Analyze Another button */}
          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-medium transition-colors"
            >
              Analyze Another Resume
            </button>
          </div>
        </div>
      ) : (
        // ========== UPLOAD FORM ==========
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">

          {/* Icon and title */}
          <div className="text-center mb-6">
            <DocumentTextIcon className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 mb-1">Upload Your Resume</h2>
            <p className="text-gray-500 text-sm">PDF, DOCX, or TXT (max 10MB)</p>
          </div>

          {/* File upload zone */}
          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors mb-6">
            <CloudArrowUpIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            {selectedFile ? (
              <p className="text-indigo-600 font-medium text-sm">{selectedFile.name}</p>
            ) : (
              <>
                <p className="text-gray-600 text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-gray-400 text-xs mt-1">PDF, DOCX, TXT up to 10MB</p>
              </>
            )}
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-gray-400 text-xs font-medium">OR PASTE TEXT</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Textarea for pasting resume text */}
          <textarea
            value={pastedText}
            onChange={function (e) { setPastedText(e.target.value); }}
            placeholder="Paste your Resume/CV content here..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none mb-6"
          />

          {/* Job description textarea (optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description (optional)
            </label>
            <textarea
              value={jobDescription}
              onChange={function (e) { setJobDescription(e.target.value); }}
              placeholder="Paste the job description here to see how well your resume matches..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
            />
            <p className="text-gray-400 text-xs mt-1">
              Adding a job description will show you a skill match analysis
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Analyzing... (this may take a minute)' : 'Analyze Resume'}
            </button>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}

export default ResumeAnalyzer;
