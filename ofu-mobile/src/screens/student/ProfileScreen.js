// ProfileScreen.js
// Student profile form — load, edit, save.

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import Header from '../../components/Header';
import StudentMenuBar from '../../components/StudentMenuBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { auth } from '../../config/firebase';

var COLORS = {
  primary: '#6366f1', white: '#ffffff', gray: '#6b7280',
  lightGray: '#f3f4f6', border: '#e5e7eb', black: '#000000',
};
var SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

export default function ProfileScreen({ navigation }) {
  var [name, setName] = useState('');
  var [email, setEmail] = useState('');
  var [department, setDepartment] = useState('');
  var [semester, setSemester] = useState('');
  var [cgpa, setCgpa] = useState('');
  var [phone, setPhone] = useState('');
  var [skills, setSkills] = useState('');
  var [bio, setBio] = useState('');
  var [loading, setLoading] = useState(true);
  var [saving, setSaving] = useState(false);

  // Password change state
  var [currentPassword, setCurrentPassword] = useState('');
  var [newPassword, setNewPassword] = useState('');
  var [confirmNewPassword, setConfirmNewPassword] = useState('');
  var [changingPassword, setChangingPassword] = useState(false);

  var { logout, changePassword } = useAuth();

  useEffect(function () { loadProfile(); }, []);

  // Load profile data from backend API and fill in the form fields
  async function loadProfile() {
    try {
      setLoading(true);
      console.log('Loading profile...');
      console.log("Loading profile, calling /auth/me")
      console.log("Current Firebase user:", auth.currentUser?.email)

      var response = await api.get('/auth/me');

      // Backend wraps response in { success: true, data: {...} }
      var profile = response.data.data ||
        response.data || {};

      console.log('Profile loaded:', profile.name);

      setName(profile.name || '');
      setEmail(profile.email || '');
      setDepartment(profile.department || '');
      setSemester(profile.semester || '');
      setCgpa(profile.cgpa ? String(profile.cgpa) : '');
      setPhone(profile.phone ? String(profile.phone) : '');
      setSkills(profile.skills || '');
      setBio(profile.bio || '');

    } catch (error) {
      console.log('Profile error:', error.message);
      console.log("Profile load failed:", error.message)
      console.log("Error status:", error.response?.status)
      console.log("Error code:", error.code)
      if (error.response?.status !== 404) {
        Alert.alert('Error',
          'Failed to load profile: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    console.log('Save button pressed');

    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    var profileData = {
      name: name.trim(),
      department: department.trim(),
      semester: semester,
      cgpa: cgpa.trim(),
      phone: phone.trim(),
      skills: skills.trim(),
      bio: bio.trim(),
    };

    console.log('Form data:', profileData);

    try {
      setSaving(true);
      console.log('Sending to API: PATCH /users/profile');
      var response = await api.patch('/users/profile', profileData);
      console.log('Save response:', response.data);
      Alert.alert('Success', 'Profile saved successfully');
    } catch (error) {
      console.log('Save error:', error.message);
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      Alert.alert(
        'Error',
        'Failed to save profile: ' + (error.response?.data?.error || error.message)
      );
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

  function getInitials() {
    if (!name) return '?';
    var parts = name.trim().split(' ');
    if (parts.length >= 2) return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    return parts[0][0].toUpperCase();
  }

  function handleLogout() { logout(); }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Profile Management" navigation={navigation}
          role="student" showLogout={true} onLogout={handleLogout} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
        <StudentMenuBar activeScreen="Profile" navigation={navigation} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Profile Management" navigation={navigation}
        role="student" showLogout={true} onLogout={handleLogout} />

      <ScrollView style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled">

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={styles.nameDisplay}>{name || 'Student'}</Text>
          <Text style={styles.emailDisplay}>{email}</Text>
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName}
          placeholder="Enter your name" placeholderTextColor={COLORS.gray} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={[styles.input, styles.inputDisabled]} value={email} editable={false} />

        <Text style={styles.label}>Degree / Major</Text>
        <TextInput style={styles.input} value={department} onChangeText={setDepartment}
          placeholder="e.g. BS Computer Science" placeholderTextColor={COLORS.gray} />

        <Text style={styles.label}>Semester</Text>
        <View style={styles.semRow}>
          {SEMESTERS.map(function (sem) {
            var isSelected = semester === sem;
            return (
              <TouchableOpacity key={sem}
                style={[styles.semBtn, isSelected && styles.semBtnActive]}
                onPress={function () { setSemester(sem); }}>
                <Text style={[styles.semBtnText, isSelected && styles.semBtnTextActive]}>{sem}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>CGPA</Text>
        <TextInput style={styles.input} value={cgpa} onChangeText={setCgpa}
          placeholder="e.g. 3.50" placeholderTextColor={COLORS.gray} keyboardType="decimal-pad" />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone}
          placeholder="e.g. 0300-1234567" placeholderTextColor={COLORS.gray} keyboardType="phone-pad" />

        <Text style={styles.label}>Skills</Text>
        <TextInput style={styles.input} value={skills} onChangeText={setSkills}
          placeholder="e.g. Python, Java, React" placeholderTextColor={COLORS.gray} />

        <Text style={styles.label}>Short Bio</Text>
        <TextInput style={[styles.input, styles.bioInput]} value={bio} onChangeText={setBio}
          placeholder="Tell us about yourself..." placeholderTextColor={COLORS.gray}
          multiline={true} numberOfLines={4} textAlignVertical="top" />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.white} /> :
            <Text style={styles.saveBtnText}>Save Profile</Text>}
        </TouchableOpacity>

        {/* Change Password Section */}
        <View style={styles.divider} />
        <Text style={styles.sectionHeader}>Change Password</Text>

        <Text style={styles.label}>Current Password</Text>
        <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword}
          secureTextEntry={true} placeholderTextColor={COLORS.gray} />

        <Text style={styles.label}>New Password</Text>
        <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword}
          secureTextEntry={true} placeholderTextColor={COLORS.gray} />

        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput style={styles.input} value={confirmNewPassword} onChangeText={setConfirmNewPassword}
          secureTextEntry={true} placeholderTextColor={COLORS.gray} />

        <TouchableOpacity style={styles.pwdBtn} onPress={handlePasswordChange} disabled={changingPassword}>
          {changingPassword ? <ActivityIndicator color={COLORS.white} /> :
            <Text style={styles.saveBtnText}>Update Password</Text>}
        </TouchableOpacity>
      </ScrollView>

      <StudentMenuBar activeScreen="Profile" navigation={navigation} />
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
  nameDisplay: { fontSize: 18, fontWeight: 'bold', color: COLORS.black, marginTop: 8 },
  emailDisplay: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  label: { fontSize: 13, color: COLORS.gray, marginBottom: 4, marginTop: 14 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    padding: 10, fontSize: 15, color: COLORS.black, backgroundColor: COLORS.white,
  },
  inputDisabled: { backgroundColor: COLORS.lightGray, color: COLORS.gray },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  semRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  semBtn: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white,
  },
  semBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  semBtnText: { fontSize: 12, color: COLORS.gray, fontWeight: '500' },
  semBtnTextActive: { color: COLORS.white },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    padding: 15, alignItems: 'center', marginTop: 20, marginBottom: 40,
  },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: COLORS.black, marginBottom: 5 },
  pwdBtn: {
    backgroundColor: '#9333ea', borderRadius: 8,
    padding: 15, alignItems: 'center', marginTop: 20, marginBottom: 40,
  },
});
