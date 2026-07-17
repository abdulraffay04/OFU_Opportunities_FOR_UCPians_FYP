// AuthContext.js
// This file manages the authentication state for the entire app.
// It provides login, signup, logout, user object, and role to all screens.

import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react"
import { Platform } from "react-native"
import axios from "axios"
import { auth } from "../config/firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
  getIdToken,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "firebase/auth"

// Create the context that all screens will read from
var AuthContext = createContext({})

// Get the backend base URL (same logic as api.js)
function getBaseURL() {
  if (Platform.OS === "web") {
    return "http://localhost:5000/api/v1"
  }
  return process.env.EXPO_PUBLIC_API_URL || "http://10.172.52.198:5000/api/v1"
}

// AuthProvider wraps the entire app and provides auth data to all screens
function AuthProvider({ children }) {
  // user: the current Firebase user object (null if logged out)
  var [user, setUser] = useState(null)

  // role: the user's role — student, alumni, employer, or admin
  var [role, setRole] = useState("")

  // loading: true while we check if user was previously logged in
  var [loading, setLoading] = useState(true)

  // Fetch user role from the backend API when Firebase claims don't have it.
  // This handles users who signed up on web but are logging in on mobile.
  async function fetchRoleFromAPI(firebaseUser) {
    try {
      var token = await getIdToken(firebaseUser, true)
      var baseURL = getBaseURL()

      console.log("Fetching role from API:", baseURL)

      var response = await axios.get(
        baseURL + "/auth/me",
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      )

      var userRole = response.data.data?.role || ""
      console.log("Role fetched from API:", userRole)
      return userRole

    } catch (error) {
      console.log("Failed to fetch role from API:",
        error.message)
      return ""
    }
  }

  // Listen to Firebase auth state changes when the app starts.
  // This runs once on mount and watches for login/logout events.
  useEffect(function () {
    var unsubscribe = onAuthStateChanged(
      auth,
      async function (firebaseUser) {
        try {
          if (firebaseUser) {
            console.log("User detected:", firebaseUser.email)

            // First try to get role from Firebase custom claims
            var userRole = ""

            try {
              var tokenResult = await getIdTokenResult(
                firebaseUser, true)
              userRole = tokenResult.claims.role || ""
              console.log("Role from claims:", userRole)
            } catch (claimsError) {
              console.log("Claims error:", claimsError.message)
            }

            // If no role in claims, get it from the backend API
            if (!userRole) {
              console.log("Getting role from API...")
              userRole = await fetchRoleFromAPI(firebaseUser)
            }

            console.log("Final role set to:", userRole)
            setUser(firebaseUser)
            setRole(userRole)

          } else {
            console.log("No user - logged out")
            setUser(null)
            setRole("")
          }
        } catch (error) {
          console.log("Auth state error:", error.message)
          setUser(null)
          setRole("")
        } finally {
          setLoading(false)
        }
      }
    )

    // Cleanup: stop listening when component unmounts
    return function () {
      unsubscribe()
    }
  }, [])

  // Login — sign in with email and password
  // Returns the user's role so the navigator can show the right screens
  async function login(email, password) {
    try {
      console.log("Logging in:", email)

      var userCredential = await signInWithEmailAndPassword(
        auth, email, password)

      var firebaseUser = userCredential.user

      // Get role from Firebase custom claims
      var userRole = ""
      try {
        var tokenResult = await getIdTokenResult(
          firebaseUser, true)
        userRole = tokenResult.claims.role || ""
        console.log("Login role from claims:", userRole)
      } catch (error) {
        console.log("Claims error on login:", error.message)
      }

      // If no role in claims, get it from the backend API
      if (!userRole) {
        userRole = await fetchRoleFromAPI(firebaseUser)
      }

      console.log("Login successful, role:", userRole)
      setUser(firebaseUser)
      setRole(userRole)
      return userRole

    } catch (error) {
      console.log("Login error:", error.message)
      throw error
    }
  }

  // Logout — sign out and clear all state
  async function logout() {
    try {
      await signOut(auth)
      setUser(null)
      setRole("")
      console.log("Logged out successfully")
    } catch (error) {
      console.log("Logout error:", error.message)
    }
  }

  // Signup — create a new account, then register profile on backend
  async function signup(email, password, name, userRole) {
    try {
      console.log("Signing up:", email, "as", userRole)

      // Step 1: Create Firebase account
      var userCredential = await
        createUserWithEmailAndPassword(auth, email, password)

      // Step 2: Get the auth token
      var firebaseUser = userCredential.user
      var token = await getIdToken(firebaseUser, true)
      var baseURL = getBaseURL()

      // Step 3: Tell the backend to save the profile and set the role
      await axios.post(
        baseURL + "/auth/register-profile",
        { name: name, email: email, role: userRole },
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          }
        }
      )

      console.log("Signup successful")
      return true

    } catch (error) {
      console.log("Signup error:", error.message)
      throw error
    }
  }

  // Change the user's password
  async function changePassword(currentPassword, newPassword) {
    if (!user) {
      throw new Error("You must be logged in")
    }
    var credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, newPassword)
    return true
  }

  // The value that all screens can access via useAuth()
  var value = {
    user: user,
    role: role,
    loading: loading,
    login: login,
    logout: logout,
    signup: signup,
    changePassword: changePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — any screen can call useAuth() to get auth data
function useAuth() {
  return useContext(AuthContext)
}

export { AuthContext, AuthProvider, useAuth }
