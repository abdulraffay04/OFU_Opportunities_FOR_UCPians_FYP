// PostOpportunityScreen.js
// Form for employers/alumni to post a new opportunity.
// Has fields for title, type, location, salary, description, deadline.

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

var COLORS = {
  primary: '#22c55e', white: '#ffffff', gray: '#6b7280',
  lightGray: '#f3f4f6', border: '#e5e7eb', black: '#000000',
};
var TYPES = ['Job', 'Internship', 'Scholarship', 'Freelance', 'Event'];

export default function PostOpportunityScreen({ navigation }) {
  var [title, setTitle] = useState('');
  var [selectedType, setSelectedType] = useState('');
  var [location, setLocation] = useState('');
  var [salary, setSalary] = useState('');
  var [description, setDescription] = useState('');
  var [deadline, setDeadline] = useState('');
  var [requiredSkills, setRequiredSkills] = useState('');
  var [loading, setLoading] = useState(false);
  var { logout } = useAuth();

  // Submit the opportunity
  async function handlePublish() {
    if (!title.trim() || !selectedType || !location.trim() || !description.trim() || !deadline.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    try {
      setLoading(true);
      await api.post('/opportunities', {
        title: title.trim(),
        type: selectedType.toLowerCase(),
        location: location.trim(),
        salary: salary.trim(),
        description: description.trim(),
        deadline: deadline.trim(),
        industry: 'Technology',
        requiredSkills: requiredSkills.trim(),
      });
      Alert.alert('Success', 'Opportunity submitted for admin review');
      // Clear form
      setTitle(''); setSelectedType(''); setLocation('');
      setSalary(''); setDescription(''); setDeadline('');
      setRequiredSkills('');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || error.message);
    }
    setLoading(false);
  }

  function handleLogout() { logout(); }

  return (
    <View style={s.container}>
      <Header title="Post a New Opportunity" navigation={navigation}
        role="employer" showLogout={true} onLogout={handleLogout} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>

        {/* Job Title */}
        <Text style={s.label}>Job Title *</Text>
        <TextInput style={s.input} placeholder="e.g. Freelance Graphic Designer"
          placeholderTextColor={COLORS.gray} value={title} onChangeText={setTitle} />

        {/* Type Selector */}
        <Text style={s.label}>Type *</Text>
        <View style={s.typeRow}>
          {TYPES.map(function (t) {
            var isSelected = selectedType === t;
            return (
              <TouchableOpacity key={t}
                style={[s.typeBtn, isSelected && s.typeBtnActive]}
                onPress={function () { setSelectedType(t); }}>
                <Text style={[s.typeBtnText, isSelected && s.typeBtnTextActive]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Location */}
        <Text style={s.label}>Location *</Text>
        <TextInput style={s.input} placeholder="e.g. Remote / Lahore"
          placeholderTextColor={COLORS.gray} value={location} onChangeText={setLocation} />

        {/* Budget/Salary */}
        <Text style={s.label}>Budget / Salary</Text>
        <TextInput style={s.input} placeholder="e.g. 50,000 PKR / Project"
          placeholderTextColor={COLORS.gray} value={salary} onChangeText={setSalary} />

        {/* Description */}
        <Text style={s.label}>Description *</Text>
        <TextInput style={[s.input, s.multiline]} placeholder="Describe the requirements..."
          placeholderTextColor={COLORS.gray} value={description} onChangeText={setDescription}
          multiline={true} numberOfLines={5} textAlignVertical="top" />

        {/* Deadline */}
        <Text style={s.label}>Deadline *</Text>
        <TextInput style={s.input} placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.gray} value={deadline} onChangeText={setDeadline} />

        {/* Required Skills (optional) */}
        <Text style={s.label}>Required Skills (comma separated, optional)</Text>
        <TextInput style={s.input} placeholder="e.g. React, Node.js, MongoDB"
          placeholderTextColor={COLORS.gray} value={requiredSkills} onChangeText={setRequiredSkills} />

        {/* Submit */}
        <TouchableOpacity style={[s.publishBtn, loading && { opacity: 0.7 }]}
          onPress={handlePublish} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.white} /> :
            <Text style={s.publishBtnText}>Publish Opportunity</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

var s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: { fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8,
    padding: 10, fontSize: 15, color: '#000', backgroundColor: '#fff',
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap' },
  typeBtn: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, margin: 4,
    borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff',
  },
  typeBtnActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  typeBtnText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  typeBtnTextActive: { color: '#fff' },
  publishBtn: {
    backgroundColor: '#22c55e', borderRadius: 8, padding: 15,
    alignItems: 'center', marginTop: 20, marginBottom: 40,
  },
  publishBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
