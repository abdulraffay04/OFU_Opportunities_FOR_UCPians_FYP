// ResumeScreen.js
// This screen lets students upload their resume for AI analysis on mobile.
// Shows ATS score, skills, improvement suggestions, and job match results.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Header from '../../components/Header';
import StudentMenuBar from '../../components/StudentMenuBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Color constants used throughout the screen
var COLORS = {
  primary: '#6366f1',
  white: '#fff',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  border: '#e5e7eb',
  black: '#111827',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
};

export default function ResumeScreen({ navigation }) {
  // Form state
  var [selectedFile, setSelectedFile] = useState(null);
  var [jobDescription, setJobDescription] = useState('');
  var [pastedText, setPastedText] = useState('');
  var [loading, setLoading] = useState(false);
  var [result, setResult] = useState(null);
  var { logout } = useAuth();

  // Open the document picker so the user can choose a resume file
  async function handlePickFile() {
    try {
      var pickerResult = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        setSelectedFile(pickerResult.assets[0]);
        setPastedText('');
        Alert.alert('Success', 'File selected: ' + pickerResult.assets[0].name);
      }
    } catch (error) {
      console.log('Picker error:', error.message);
      Alert.alert('Error', 'Failed to pick file');
    }
  }

  // Send the resume to the backend AI service for analysis
  async function handleAnalyze() {
    // Make sure user provided either a file or pasted text
    if (!selectedFile && !pastedText.trim()) {
      Alert.alert('Error', 'Please select a file or paste resume text');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      // Build form data to send to the backend
      var formData = new FormData();

      if (selectedFile) {
        // User picked a file from device
        formData.append('file', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType || 'application/pdf',
        });
      } else {
        // User pasted text - send as a text file
        formData.append('file', {
          uri: 'data:text/plain;base64,' + btoa(pastedText),
          name: 'resume.txt',
          type: 'text/plain',
        });
      }

      // Add job description if user provided one
      if (jobDescription.trim()) {
        formData.append('job_description', jobDescription.trim());
      }

      // Send to the Node.js backend (which forwards to Python AI)
      var response = await api.post('/ai/analyze-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000,
      });

      setResult(response.data.data);
      Alert.alert('Success', 'Analysis complete!');
    } catch (error) {
      console.log('Analyze error:', error.message);
      var errorMessage = error.response?.data?.error || error.message;
      Alert.alert('Error', 'Analysis failed: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Reset everything so user can analyze another resume
  function handleReset() {
    setSelectedFile(null);
    setJobDescription('');
    setPastedText('');
    setResult(null);
  }

  // Get the color for the ATS score based on grade
  function getScoreColor(grade) {
    if (grade === 'High') {
      return COLORS.success;
    }
    if (grade === 'Medium') {
      return COLORS.warning;
    }
    return COLORS.error;
  }

  // Render the results section
  function renderResults() {
    if (!result) {
      return null;
    }

    return (
      <View style={styles.resultsContainer}>
        {/* ATS Score Circle */}
        <View style={styles.scoreSection}>
          <Text style={styles.sectionTitle}>ATS Score</Text>
          <View
            style={[
              styles.scoreCircle,
              { backgroundColor: getScoreColor(result.ats?.grade) },
            ]}
          >
            <Text style={styles.scoreNumber}>
              {Math.round(result.ats?.score || 0)}
            </Text>
          </View>
          <Text
            style={[
              styles.gradeText,
              { color: getScoreColor(result.ats?.grade) },
            ]}
          >
            {result.ats?.grade || 'N/A'}
          </Text>
          <Text style={styles.confidenceText}>
            Confidence: {result.ats?.confidence || 0}%
          </Text>
        </View>

        {/* Skills Found */}
        {result.resume_skills && result.resume_skills.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Skills Found ({result.resume_skills.length})
            </Text>
            <View style={styles.tagContainer}>
              {result.resume_skills.map(function (skill, index) {
                return (
                  <View key={index} style={styles.greenTag}>
                    <Text style={styles.tagText}>{skill}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Improvement Suggestions */}
        {result.improvements && result.improvements.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Suggestions for Improvement</Text>
            {result.improvements.map(function (tip, index) {
              return (
                <View key={index} style={styles.tipRow}>
                  <Text style={styles.tipNumber}>{index + 1}.</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Job Match Section - only show if match data exists */}
        {result.match && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Job Match Score</Text>

            {/* Match percentage */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.matchScore}>
                {Math.round(result.match.match_score || 0)}%
              </Text>
              <Text style={styles.matchLabel}>overall match</Text>
            </View>

            {/* Matched skills */}
            {result.match.matched_skills && result.match.matched_skills.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.subLabel}>Matched Skills</Text>
                <View style={styles.tagContainer}>
                  {result.match.matched_skills.map(function (skill, index) {
                    return (
                      <View key={index} style={styles.greenTag}>
                        <Text style={styles.tagText}>{skill}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Missing skills */}
            {result.match.missing_skills && result.match.missing_skills.length > 0 && (
              <View>
                <Text style={styles.subLabel}>Missing Skills</Text>
                <View style={styles.tagContainer}>
                  {result.match.missing_skills.map(function (skill, index) {
                    return (
                      <View key={index} style={styles.redTag}>
                        <Text style={styles.tagText}>{skill}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Resume Completeness */}
        {result.contact_info && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Resume Completeness</Text>
            {renderCheckItem('Email', result.contact_info.has_email)}
            {renderCheckItem('Phone', result.contact_info.has_phone)}
            {renderCheckItem('LinkedIn', result.contact_info.has_linkedin)}
            {renderCheckItem('GitHub', result.contact_info.has_github)}
            {renderCheckItem('Summary', result.contact_info.has_summary)}
            {renderCheckItem('Experience', result.contact_info.has_experience)}
            {renderCheckItem('Education', result.contact_info.has_education)}
            {renderCheckItem('Certifications', result.contact_info.has_certifications)}
            {result.contact_info.word_count ? (
              <Text style={styles.wordCount}>
                Word count: {result.contact_info.word_count}
              </Text>
            ) : null}
          </View>
        )}

        {/* Analyze Another button */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Analyze Another Resume</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render a single checklist item (has email, has phone, etc.)
  function renderCheckItem(label, hasIt) {
    return (
      <View style={styles.checkRow}>
        <Text style={hasIt ? styles.checkYes : styles.checkNo}>
          {hasIt ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.checkLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="AI Resume Analyzer"
        navigation={navigation}
        role="student"
        showLogout={true}
        onLogout={function () { logout(); }}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Upload box */}
        <View style={styles.uploadBox}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>{'📄'}</Text>
          <Text style={styles.uploadTitle}>Upload Your Resume</Text>
          <Text style={styles.uploadSubtitle}>PDF, DOCX, or TXT (max 10MB)</Text>

          <TouchableOpacity style={styles.pickButton} onPress={handlePickFile}>
            <Text style={styles.pickButtonText}>Select File</Text>
          </TouchableOpacity>

          {selectedFile ? (
            <Text style={styles.fileNameText}>
              {'📎'} {selectedFile.name}
            </Text>
          ) : null}
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR PASTE TEXT</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Resume text area */}
        <TextInput
          style={styles.textArea}
          placeholder="Paste your Resume/CV content here..."
          placeholderTextColor={COLORS.gray}
          value={pastedText}
          onChangeText={function (text) {
            setPastedText(text);
            if (text) {
              setSelectedFile(null);
            }
          }}
          multiline={true}
          numberOfLines={6}
          textAlignVertical="top"
        />

        {/* Job description (optional) */}
        <Text style={styles.jdLabel}>Job Description (optional)</Text>
        <TextInput
          style={styles.jdTextArea}
          placeholder="Paste job description to see skill match..."
          placeholderTextColor={COLORS.gray}
          value={jobDescription}
          onChangeText={function (text) { setJobDescription(text); }}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.jdHint}>
          Adding a job description will show you a skill match analysis
        </Text>

        {/* Analyze button */}
        <TouchableOpacity
          style={[styles.analyzeButton, loading ? { opacity: 0.6 } : null]}
          onPress={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator color={COLORS.white} />
              <Text style={[styles.analyzeButtonText, { marginLeft: 8 }]}>
                Analyzing...
              </Text>
            </View>
          ) : (
            <Text style={styles.analyzeButtonText}>Analyze Resume</Text>
          )}
        </TouchableOpacity>

        {/* Results */}
        {renderResults()}
      </ScrollView>
      <StudentMenuBar activeScreen="Resume" navigation={navigation} />
    </View>
  );
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Upload section
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  uploadSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 16,
  },
  pickButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pickButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fileNameText: {
    color: '#6366f1',
    fontSize: 13,
    marginTop: 10,
    fontWeight: '500',
  },
  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Text input
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f3f4f6',
    color: '#000',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  // Job description
  jdLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  jdTextArea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f3f4f6',
    color: '#000',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  jdHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  // Analyze button
  analyzeButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Results
  resultsContainer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  scoreNumber: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  gradeText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  confidenceText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  // Cards
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  // Tags
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  greenTag: {
    backgroundColor: '#22c55e',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 3,
  },
  redTag: {
    backgroundColor: '#ef4444',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 3,
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  // Tips
  tipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipNumber: {
    fontSize: 13,
    color: '#f59e0b',
    fontWeight: '600',
    marginRight: 8,
    width: 20,
  },
  tipText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  // Match
  matchScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  matchLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  // Checklist
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkYes: {
    fontSize: 13,
    color: '#22c55e',
    fontWeight: '600',
    width: 30,
  },
  checkNo: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
    width: 30,
  },
  checkLabel: {
    fontSize: 13,
    color: '#374151',
  },
  wordCount: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  // Reset button
  resetButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
