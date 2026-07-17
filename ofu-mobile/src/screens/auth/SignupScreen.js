// SignupScreen.js
// Create account screen with name, email, role, password fields.
// Students must use a valid UCP email address to sign up.

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

var COLORS = {
  primary: '#6366f1', white: '#ffffff', gray: '#6b7280',
  lightGray: '#f3f4f6', border: '#e5e7eb', black: '#000000',
};
var ROLES = ['student', 'alumni', 'employer'];

// Check if an email matches the UCP student email format
// Valid format example: L1F22BSCS0650@ucp.edu.pk
function isValidUCPEmail(email) {
  var ucpPattern = /^L1[FS]\d{2}[A-Z]+\d{4}@ucp\.edu\.pk$/i;
  return ucpPattern.test(email);
}

export default function SignupScreen() {
  var [name, setName] = useState('');
  var [email, setEmail] = useState('');
  var [role, setRole] = useState('student');
  var [password, setPassword] = useState('');
  var [confirmPassword, setConfirmPassword] = useState('');
  var [isLoading, setIsLoading] = useState(false);
  var { signup } = useAuth();
  var navigation = useNavigation();

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // If the user is a student, make sure they are using a valid UCP email
    if (role === 'student') {
      if (!isValidUCPEmail(email.trim())) {
        Alert.alert(
          'Invalid Email',
          'Students must use their UCP registration email.\n\nFormat: L1F22BSCS0650@ucp.edu.pk\n\nCheck your UCP student portal for your email.'
        );
        return;
      }
    }
    setIsLoading(true);

    try {
      await signup(email.trim(), password, name.trim(), role);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: function () { navigation.navigate('Login'); } },
      ]);
    } catch (error) {
      Alert.alert('Signup Failed', error.message || 'An error occurred during signup');
    }

    setIsLoading(false);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>O</Text>
          </View>
          <Text style={styles.appName}>OFU</Text>
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity style={styles.tab}
            onPress={function () { navigation.navigate('Login'); }}>
            <Text style={styles.tabTextInactive}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, styles.tabActive]}>
            <Text style={styles.tabTextActive}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="Enter your full name"
            placeholderTextColor={COLORS.gray} value={name} onChangeText={setName}
            autoCapitalize="words" />

          <Text style={styles.label}>Email address</Text>
          <TextInput style={styles.input} placeholder="Enter your email"
            placeholderTextColor={COLORS.gray} value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" />
          {/* Show a hint for students about the UCP email format */}
          {role === 'student' && (
            <Text style={styles.ucpHint}>
              Use your UCP email: e.g. L1F22BSCS0650@ucp.edu.pk
            </Text>
          )}

          <Text style={styles.label}>I am a:</Text>
          <View style={styles.roleRow}>
            {ROLES.map(function (item) {
              var isSelected = role === item;
              return (
                <TouchableOpacity key={item}
                  style={[styles.roleBtn, isSelected ? styles.roleBtnActive : styles.roleBtnInactive]}
                  onPress={function () { setRole(item); }}>
                  <Text style={[styles.roleBtnText, isSelected ? styles.roleTextActive : styles.roleTextInactive]}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Enter your password"
            placeholderTextColor={COLORS.gray} value={password} onChangeText={setPassword}
            secureTextEntry={true} />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput style={styles.input} placeholder="Confirm your password"
            placeholderTextColor={COLORS.gray} value={confirmPassword} onChangeText={setConfirmPassword}
            secureTextEntry={true} />

          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Already have an account? </Text>
          <TouchableOpacity onPress={function () { navigation.navigate('Login'); }}>
            <Text style={styles.bottomLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { 
    flexGrow: 1, 
    padding: 32, 
    paddingTop: 80, 
    maxWidth: 450, 
    alignSelf: 'center', 
    width: '100%' 
  },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 60, height: 60, borderRadius: 16, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 
  },
  logoLetter: { color: COLORS.white, fontSize: 28, fontWeight: '800' },
  appName: { fontSize: 22, fontWeight: '700', color: COLORS.black, marginBottom: 8 },
  heading: { fontSize: 30, fontWeight: '800', color: COLORS.black, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.gray, marginBottom: 20 },
  
  tabRow: { flexDirection: 'row', marginBottom: 32, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingBottom: 16, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
  tabTextActive: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  tabTextInactive: { fontSize: 16, fontWeight: '500', color: COLORS.gray },
  
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.black, marginBottom: 8, marginTop: 20 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    padding: 16, fontSize: 16, backgroundColor: COLORS.white,
    color: COLORS.black,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
  },
  ucpHint: { fontSize: 12, color: COLORS.primary, marginTop: 6, fontStyle: 'italic' },
  
  roleRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  roleBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  roleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleBtnInactive: { backgroundColor: COLORS.white, borderColor: COLORS.border },
  roleBtnText: { fontSize: 14, fontWeight: '600' },
  roleTextActive: { color: COLORS.white },
  roleTextInactive: { color: COLORS.gray },
  
  button: { 
    backgroundColor: COLORS.primary, borderRadius: 10, padding: 16, 
    alignItems: 'center', marginTop: 32,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6
  },
  buttonText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 40 },
  bottomText: { fontSize: 15, color: COLORS.gray },
  bottomLink: { fontSize: 15, color: COLORS.primary, fontWeight: '700' },
});