// EmployerProfileScreen.js
// Profile form for employer/alumni users.
// Load profile on mount, edit fields, save changes.

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

var C = {
  primary: '#22c55e', white: '#fff', gray: '#6b7280',
  lightGray: '#f3f4f6', border: '#e5e7eb', black: '#000',
};

export default function EmployerProfileScreen({ navigation }) {
  var [name, setName] = useState('');
  var [company, setCompany] = useState('');
  var [jobTitle, setJobTitle] = useState('');
  var [industry, setIndustry] = useState('');
  var [linkedin, setLinkedin] = useState('');
  var [location, setLocation] = useState('');
  var [bio, setBio] = useState('');
  var [website, setWebsite] = useState('');
  var [phone, setPhone] = useState('');
  var [openToConnect, setOpenToConnect] = useState(true);
  var [loading, setLoading] = useState(true);
  var [saving, setSaving] = useState(false);

  // Password change state
  var [currentPassword, setCurrentPassword] = useState('');
  var [newPassword, setNewPassword] = useState('');
  var [confirmNewPassword, setConfirmNewPassword] = useState('');
  var [changingPassword, setChangingPassword] = useState(false);

  var { logout, changePassword } = useAuth();

  useEffect(function () { loadProfile(); }, []);

  // Load both basic user info and employer/alumni profile data
  async function loadProfile() {
    try {
      // Get basic user info
      var meResponse = await api.get('/auth/me');
      var meData = meResponse.data.data || meResponse.data || {};
      setName(meData.name || '');

      // Get alumni/employer profile
      var profileResponse = await api.get('/alumni/profile');
      var profile = profileResponse.data.data || profileResponse.data || {};
      setCompany(profile.company || profile.currentCompany || '');
      setJobTitle(profile.jobTitle || profile.currentPosition || '');
      setIndustry(profile.industry || '');
      setLinkedin(profile.linkedin || profile.linkedinUrl || '');
      setLocation(profile.location || '');
      setBio(profile.bio || '');
      setWebsite(profile.website || '');
      setPhone(profile.phone || meData.phone || '');
      if (profile.openToConnect !== undefined) {
        setOpenToConnect(profile.openToConnect);
      }
    } catch (error) {
      console.log('Load profile error:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    try {
      setSaving(true);
      await api.post('/alumni/profile', {
        name: name.trim(),
        company: company.trim(),
        currentCompany: company.trim(),
        jobTitle: jobTitle.trim(),
        currentPosition: jobTitle.trim(),
        industry: industry.trim(),
        linkedin: linkedin.trim(),
        linkedinUrl: linkedin.trim(),
        location: location.trim(),
        bio: bio.trim(),
        website: website.trim(),
        phone: phone.trim(),
        openToConnect: openToConnect,
      });
      Alert.alert('Success', 'Profile saved');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
    setSaving(false);
  }

  async function handlePasswordChange() {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "Please fill all password fields");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("Success", "Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      if (error.code === "auth/wrong-password" || error.message.includes("invalid-credential")) {
        Alert.alert("Error", "Current password is incorrect");
      } else {
        Alert.alert("Error", "Failed to update password: " + error.message);
      }
    }
    setChangingPassword(false);
  }

  if (loading) {
    return (
      <View style={s.container}>
        <Header title="My Profile" navigation={navigation}
          role="employer" showLogout={true} onLogout={function () { logout(); }} />
        <View style={s.centered}><ActivityIndicator size="large" color={C.primary} /></View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Header title="My Profile" navigation={navigation}
        role="employer" showLogout={true} onLogout={function () { logout(); }} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>

        <Text style={s.label}>Full Name *</Text>
        <TextInput style={s.input} value={name} onChangeText={setName}
          placeholder="Enter your name" placeholderTextColor={C.gray} />

        <Text style={s.label}>Company</Text>
        <TextInput style={s.input} value={company} onChangeText={setCompany}
          placeholder="e.g. Google" placeholderTextColor={C.gray} />

        <Text style={s.label}>Job Title</Text>
        <TextInput style={s.input} value={jobTitle} onChangeText={setJobTitle}
          placeholder="e.g. Software Engineer" placeholderTextColor={C.gray} />

        <Text style={s.label}>Industry</Text>
        <TextInput style={s.input} value={industry} onChangeText={setIndustry}
          placeholder="e.g. Technology" placeholderTextColor={C.gray} />

        <Text style={s.label}>LinkedIn URL</Text>
        <TextInput style={s.input} value={linkedin} onChangeText={setLinkedin}
          placeholder="https://linkedin.com/in/..." placeholderTextColor={C.gray}
          autoCapitalize="none" />

        <Text style={s.label}>Location</Text>
        <TextInput style={s.input} value={location} onChangeText={setLocation}
          placeholder="e.g. Lahore, Pakistan" placeholderTextColor={C.gray} />

        <Text style={s.label}>Bio</Text>
        <TextInput style={[s.input, s.multiline]} value={bio} onChangeText={setBio}
          placeholder="Tell us about yourself..." placeholderTextColor={C.gray}
          multiline={true} numberOfLines={4} textAlignVertical="top" />

        <Text style={s.label}>Website</Text>
        <TextInput style={s.input} value={website} onChangeText={setWebsite}
          placeholder="https://..." placeholderTextColor={C.gray}
          autoCapitalize="none" />

        <Text style={s.label}>Phone</Text>
        <TextInput style={s.input} value={phone} onChangeText={setPhone}
          placeholder="e.g. 0300-1234567" placeholderTextColor={C.gray}
          keyboardType="phone-pad" />

        {/* Open to Connect toggle */}
        <Text style={s.label}>Open to Connect with Students</Text>
        <TouchableOpacity style={[s.toggle, openToConnect ? s.toggleOn : s.toggleOff]}
          onPress={function () { setOpenToConnect(!openToConnect); }}>
          <Text style={[s.toggleText, openToConnect ? { color: C.white } : { color: C.gray }]}>
            {openToConnect ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={C.white} /> :
            <Text style={s.saveBtnText}>Save Profile</Text>}
        </TouchableOpacity>

        {/* Change Password Section */}
        <View style={s.divider} />
        <Text style={s.sectionHeader}>Change Password</Text>

        <Text style={s.label}>Current Password</Text>
        <TextInput style={s.input} value={currentPassword} onChangeText={setCurrentPassword}
          secureTextEntry={true} placeholderTextColor={C.gray} />

        <Text style={s.label}>New Password</Text>
        <TextInput style={s.input} value={newPassword} onChangeText={setNewPassword}
          secureTextEntry={true} placeholderTextColor={C.gray} />

        <Text style={s.label}>Confirm New Password</Text>
        <TextInput style={s.input} value={confirmNewPassword} onChangeText={setConfirmNewPassword}
          secureTextEntry={true} placeholderTextColor={C.gray} />

        <TouchableOpacity style={s.pwdBtn} onPress={handlePasswordChange} disabled={changingPassword}>
          {changingPassword ? <ActivityIndicator color={C.white} /> :
            <Text style={s.saveBtnText}>Update Password</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

var s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8,
    padding: 10, fontSize: 15, color: '#000', backgroundColor: '#fff',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  toggle: { width: 60, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  toggleOn: { backgroundColor: '#22c55e' },
  toggleOff: { backgroundColor: '#e5e7eb' },
  toggleText: { fontSize: 12, fontWeight: 'bold' },
  saveBtn: {
    backgroundColor: '#22c55e', borderRadius: 8, padding: 15,
    alignItems: 'center', marginTop: 20, marginBottom: 40,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 20 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 5 },
  pwdBtn: {
    backgroundColor: '#9333ea', borderRadius: 8, padding: 15,
    alignItems: 'center', marginTop: 20, marginBottom: 40,
  },
});
