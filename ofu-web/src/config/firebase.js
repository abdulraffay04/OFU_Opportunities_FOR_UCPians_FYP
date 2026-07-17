// This file initializes the Firebase client SDK for the frontend.
// It exports the auth instance used for login, signup, and session management.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Debug log to check if the API key is being loaded
console.log("Firebase API Key:", process.env.REACT_APP_FIREBASE_API_KEY);

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get the Firebase Auth instance
const auth = getAuth(app);

export { auth };
export default app;
