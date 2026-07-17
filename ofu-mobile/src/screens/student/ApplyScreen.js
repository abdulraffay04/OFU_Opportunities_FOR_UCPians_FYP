// ApplyScreen.js
// Shown when student clicks "Apply" on an opportunity.
// Has a cover letter field, resume upload, and submit button.

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Header from '../../components/Header';
import api from '../../services/api';

var COLORS = {
  primary: '#6366f1', white: '#ffffff', gray: '#6b7280',
  lightGray: '#f3f4f6', border: '#e5e7eb', black: '#000000',
  success: '#22c55e',
};

export default function ApplyScreen({ route, navigation }) {
  // Get the opportunity passed from BrowseScreen
  var opportunity = route.params?.opportunity || {};

  var [coverLetter, setCoverLetter] = useState('');
  var [selectedFile, setSelectedFile] = useState(null);
  var [fileName, setFileName] = useState('');
  var [submitting, setSubmitting] = useState(false);

  // Pick a PDF resume
  async function pickResume() {
    try {
      var result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setFileName(result.assets[0].name);
      }
    } catch (error) {
      console.log('Picker error:', error.message);
    }
  }

  // Submit the application
  async function handleSubmit() {
    if (!coverLetter.trim()) {
      Alert.alert('Error', 'Please write a cover letter');
      return;
    }

    try {
      setSubmitting(true);
      var resumeUrl = '';

      // Step 1: Upload resume if selected
      if (selectedFile) {
        var formData = new FormData();
        formData.append('resume', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: 'application/pdf',
        });
        var uploadResponse = await api.post('/uploads/resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        resumeUrl = uploadResponse.data.url || '';
      }

      // Step 2: Submit application
      await api.post('/applications', {
        opportunityId: opportunity.id,
        coverLetter: coverLetter.trim(),
        resumeUrl: resumeUrl,
      });

      Alert.alert('Success', 'Application submitted successfully!', [
        { text: 'OK', onPress: function () { navigation.goBack(); } },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit');
    }
    setSubmitting(false);
  }

  // Back button for header
  var backButton = (
    <TouchableOpacity onPress={function () { navigation.goBack(); }}>
      <Text style={styles.cancelText}>Cancel</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Apply"
        onMenuPress={function () { navigation.goBack(); }}
        rightButton={backButton}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Opportunity title */}
        <Text style={styles.oppTitle}>{opportunity.title || 'Opportunity'}</Text>
        <Text style={styles.oppCompany}>{opportunity.company || opportunity.organization || ''}</Text>

        {/* Cover letter */}
        <Text style={styles.label}>Cover Letter</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Write your cover letter here..."
          placeholderTextColor={COLORS.gray}
          value={coverLetter}
          onChangeText={setCoverLetter}
          multiline={true}
          numberOfLines={6}
          textAlignVertical="top"
        />

        {/* Resume upload */}
        <Text style={styles.label}>Resume (PDF)</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickResume}>
          <Text style={styles.uploadBtnText}>
            {fileName ? '📄 ' + fileName : '📄 Upload Resume'}
          </Text>
        </TouchableOpacity>
        {fileName ? (
          <Text style={styles.fileHint}>✅ File selected</Text>
        ) : null}

        {/* Submit button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitBtnText}>Submit Application</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { padding: 20, paddingBottom: 40 },
  cancelText: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },

  oppTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.black, marginBottom: 4 },
  oppCompany: { fontSize: 14, color: COLORS.gray, marginBottom: 20 },

  label: { fontSize: 14, fontWeight: '500', color: COLORS.black, marginBottom: 6, marginTop: 16 },
  textArea: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    padding: 12, fontSize: 15, backgroundColor: COLORS.lightGray,
    color: COLORS.black, minHeight: 120, textAlignVertical: 'top',
  },

  uploadBtn: {
    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8,
    padding: 12, alignItems: 'center', backgroundColor: COLORS.white,
  },
  uploadBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
  fileHint: { fontSize: 12, color: COLORS.success, marginTop: 4 },

  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    padding: 14, alignItems: 'center', marginTop: 24,
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});
