// AppNavigator.js
// This file controls which screens the user sees based on their login state and role.
// It creates separate screen stacks for each role.

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Colors used for headers
var COLORS = {
  student: '#6366f1',
  employer: '#22c55e',
  admin: '#ef4444',
  white: '#ffffff',
};

// Auth screens (login and signup)
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Student screens
import BrowseScreen from '../screens/student/BrowseScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import SavedScreen from '../screens/student/SavedScreen';
import AlumniScreen from '../screens/student/AlumniScreen';
import ResumeScreen from '../screens/student/ResumeScreen';
import ChatbotScreen from '../screens/student/ChatbotScreen';
import ApplyScreen from '../screens/student/ApplyScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';

// Employer/Alumni screens
import PostOpportunityScreen from '../screens/employer/PostOpportunityScreen';
import ApplicationsScreen from '../screens/employer/ApplicationsScreen';
import MyPostsScreen from '../screens/employer/MyPostsScreen';
import EmployerProfileScreen from '../screens/employer/EmployerProfileScreen';

// Admin screens
import PendingScreen from '../screens/admin/PendingScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import AdminApplicationsScreen from '../screens/admin/AdminApplicationsScreen';

// Create stack navigator instances
var AuthStackNav = createStackNavigator();
var StudentStackNav = createStackNavigator();
var EmployerStackNav = createStackNavigator();
var AdminStackNav = createStackNavigator();

// ==============================
// AUTH STACK — Login & Signup
// Shown when user is NOT logged in
// ==============================
function AuthStack() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Signup" component={SignupScreen} />
    </AuthStackNav.Navigator>
  );
}

// ==============================
// STUDENT STACK
// Shown when role is "student"
// ==============================
function StudentStack() {
  return (
    <StudentStackNav.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <StudentStackNav.Screen name="Browse" component={BrowseScreen} />
      <StudentStackNav.Screen name="Profile" component={ProfileScreen} />
      <StudentStackNav.Screen name="Saved" component={SavedScreen} />
      <StudentStackNav.Screen name="Alumni" component={AlumniScreen} />
      <StudentStackNav.Screen name="Resume" component={ResumeScreen} />
      <StudentStackNav.Screen name="Chatbot" component={ChatbotScreen} />
      <StudentStackNav.Screen name="Apply" component={ApplyScreen} />
      <StudentStackNav.Screen name="Notifications" component={NotificationsScreen} />
    </StudentStackNav.Navigator>
  );
}

// ==============================
// EMPLOYER STACK
// Shown when role is "alumni" or "employer"
// ==============================
function EmployerStack() {
  return (
    <EmployerStackNav.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <EmployerStackNav.Screen name="PostOpportunity" component={PostOpportunityScreen} />
      <EmployerStackNav.Screen name="Applications" component={ApplicationsScreen} />
      <EmployerStackNav.Screen name="MyPosts" component={MyPostsScreen} />
      <EmployerStackNav.Screen name="EmployerProfile" component={EmployerProfileScreen} />
    </EmployerStackNav.Navigator>
  );
}

// ==============================
// ADMIN STACK
// Shown when role is "admin"
// ==============================
function AdminStack() {
  return (
    <AdminStackNav.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AdminStackNav.Screen name="Pending" component={PendingScreen} />
      <AdminStackNav.Screen name="UserManagement" component={UserManagementScreen} />
      <AdminStackNav.Screen name="Analytics" component={AnalyticsScreen} />
      <AdminStackNav.Screen name="AdminApplications" component={AdminApplicationsScreen} />
    </AdminStackNav.Navigator>
  );
}

// ==============================
// MAIN NAVIGATOR
// Decides which stack to render
// ==============================
export default function AppNavigator() {
  var { user, role, loading } = useAuth();

  // Still checking auth state — show a loading spinner
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.student} />
      </View>
    );
  }

  // Not logged in — show auth screens
  if (!user) {
    return <AuthStack />;
  }

  // Logged in — show screens based on role
  if (role === 'student') {
    return <StudentStack />;
  }

  if (role === 'alumni' || role === 'employer') {
    return <EmployerStack />;
  }

  if (role === 'admin') {
    return <AdminStack />;
  }

  // Fallback — if role is unknown show student screens
  return <StudentStack />;
}

var styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
