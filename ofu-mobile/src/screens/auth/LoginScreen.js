// LoginScreen.js
// Login screen — email and password form with Firebase auth.
// After login, students are validated to ensure they used a UCP email.

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

export default function LoginScreen() {
  var [email, setEmail] = useState('');
  var [password, setPassword] = useState('');
  var [isLoading, setIsLoading] = useState(false);
  var { login, logout } = useAuth();
  var navigation = useNavigation();

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setIsLoading(true);

    try {
      var role = await login(email.trim(), password);

      // If the user is a student, make sure their email ends with @ucp.edu.pk
      if (role === 'student') {
        var emailLower = email.trim().toLowerCase();
        var isUCPEmail = emailLower.endsWith('@ucp.edu.pk');

        if (!isUCPEmail) {
          Alert.alert(
            'Access Denied',
            'Student accounts must use UCP email address.'
          );
          await logout();
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }

    setIsLoading(false);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>O</Text>
          </View>
          <Text style={styles.appName}>OFU</Text>
          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.subtitle}>Please sign in to your account</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, styles.tabActive]}>
            <Text style={styles.tabTextActive}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}
            onPress={function () { navigation.navigate('Signup'); }}>
            <Text style={styles.tabTextInactive}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.gray}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.gray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Don't have an account? </Text>
          <TouchableOpacity onPress={function () { navigation.navigate('Signup'); }}>
            <Text style={styles.bottomLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { 
    flexGrow: 1, 
    padding: 32, // Increased padding for desktop-like spaciousness
    paddingTop: 80, 
    maxWidth: 450, // Constrain width on larger screens like a web app
    alignSelf: 'center', 
    width: '100%' 
  },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 60, height: 60, borderRadius: 16, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    // Add shadow to match web cards
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 
  },
  logoLetter: { color: COLORS.white, fontSize: 28, fontWeight: '800' },
  appName: { fontSize: 22, fontWeight: '700', color: COLORS.black, marginBottom: 8 },
  heading: { fontSize: 30, fontWeight: '800', color: COLORS.black, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.gray, marginBottom: 20 },
  
  // Tabs: Make them look like a clean web navigation bar
  tabRow: { flexDirection: 'row', marginBottom: 32, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingBottom: 16, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
  tabTextActive: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  tabTextInactive: { fontSize: 16, fontWeight: '500', color: COLORS.gray },
  
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.black, marginBottom: 8, marginTop: 20 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    padding: 16, fontSize: 16, backgroundColor: COLORS.white, // Web inputs are usually white, not light gray
    color: COLORS.black,
    // Add web-like focus shadow
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
  },
  button: { 
    backgroundColor: COLORS.primary, borderRadius: 10, padding: 16, 
    alignItems: 'center', marginTop: 32,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6
  },
  buttonText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  bottomText: { fontSize: 15, color: COLORS.gray },
  bottomLink: { fontSize: 15, color: COLORS.primary, fontWeight: '700' },
});