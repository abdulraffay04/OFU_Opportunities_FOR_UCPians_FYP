// This file provides authentication state and functions to the entire app.
// It listens to Firebase auth changes and stores user, role, and loading state.

import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';

// Create the auth context
const AuthContext = createContext();

// AuthProvider component that wraps the entire app
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes when the app loads
  useEffect(function () {
    const unsubscribe = onAuthStateChanged(auth, async function (firebaseUser) {
      if (firebaseUser) {
        // User is logged in — get their role from custom claims
        const tokenResult = await firebaseUser.getIdTokenResult();
        setUser(firebaseUser);
        setRole(tokenResult.claims.role || null);
      } else {
        // User is logged out
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return unsubscribe;
  }, []);

  // Log in with email and password
  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);

    // Get the role from custom claims after login
    const tokenResult = await result.user.getIdTokenResult();
    setRole(tokenResult.claims.role || null);

    return result;
  }

  // Sign up with email, password, name, and role
  // Creates Firebase account first, then saves profile to backend
  async function signup(email, password, name, selectedRole) {
    // Step 1: Create the Firebase Auth account
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Step 2: Save the user profile to the backend
    await api.post('/auth/register-profile', {
      name: name,
      email: email,
      role: selectedRole,
    });

    // Step 3: Force token refresh to get the updated custom claims
    const tokenResult = await result.user.getIdTokenResult(true);
    setRole(tokenResult.claims.role || selectedRole);

    return result;
  }

  // Log out the current user
  async function logout() {
    await signOut(auth);
    setUser(null);
    setRole(null);
  }

  // Change the user's password
  async function changePassword(currentPassword, newPassword) {
    if (!user) {
      throw new Error('You must be logged in');
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return true;
  }

  // The value that will be available to all components
  const value = {
    user: user,
    role: role,
    loading: loading,
    login: login,
    signup: signup,
    logout: logout,
    changePassword: changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access to auth context
function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext, AuthProvider, useAuth };
