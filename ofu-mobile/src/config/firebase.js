// firebase.js
// This file sets up Firebase for the mobile app.
// It reads config from environment variables and
// exports the auth instance for use throughout the app.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Read Firebase config from Expo environment variables
var firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize the Firebase app
var app = initializeApp(firebaseConfig);

// Create the auth instance
var auth = getAuth(app);

export { auth };
export default app;
