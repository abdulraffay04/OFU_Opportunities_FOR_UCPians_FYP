// api.js
// Sets up the Axios HTTP client for making API requests to the backend.
// Automatically attaches the Firebase auth token to every request.

import axios from "axios"
import { Platform } from "react-native"
import { auth } from "../config/firebase"
import { getIdToken } from "firebase/auth"

// Use the API URL from .env file (EXPO_PUBLIC_API_URL)
// This avoids hardcoding the IP address in source code.
// Change the IP in .env if your network changes.

// Decide the correct backend URL based on the platform
function getBaseURL() {
  if (Platform.OS === "web") {
    return "http://localhost:5000/api/v1"
  } else {
    // Expo Go on phone — use the env variable
    return process.env.EXPO_PUBLIC_API_URL || "http://10.172.52.198:5000/api/v1"
  }
}

var BASE_URL = getBaseURL()

console.log("Platform:", Platform.OS)
console.log("API URL:", BASE_URL)

// Create the main API client with the correct base URL
var api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
})

console.log("=== API DEBUG INFO ===")
console.log("Platform:", Platform.OS)
console.log("Base URL being used:", api.defaults.baseURL)
console.log("=======================")

// Attach Firebase token to every request so the backend knows who is calling
api.interceptors.request.use(
  async function (config) {
    try {
      var user = auth.currentUser
      if (user) {
        var token = await getIdToken(user, true)
        config.headers.Authorization = "Bearer " + token
      }
    } catch (error) {
      console.log("Token error:", error.message)
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

// Log errors for debugging
api.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    console.log("API Error:",
      error.response?.status, error.message)
    return Promise.reject(error)
  }
)

export default api
