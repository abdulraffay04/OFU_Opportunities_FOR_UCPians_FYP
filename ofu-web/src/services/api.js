// This file creates an axios instance with authentication.
// It automatically attaches the Firebase token to every API request.

import axios from 'axios';
import { auth } from '../config/firebase';

// Create an axios instance with the backend API base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request interceptor — attach the Firebase Bearer token to every request
api.interceptors.request.use(async function (config) {
  var user = auth.currentUser;
  console.log("Current Firebase user:", user ? user.email : "NO USER");

  if (user) {
    var token = await user.getIdToken();
    console.log("Token first 20 chars:", token.substring(0, 20));
    config.headers.Authorization = "Bearer " + token;
  } else {
    console.log("NO FIREBASE USER - request will fail auth");
  }

  console.log("Request URL:", config.baseURL + config.url);
  console.log("Request method:", config.method);
  console.log("Request body:", config.data);
  return config;
});

// Response interceptor — log errors and redirect on 401
api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    console.log("API Error status:", error.response && error.response.status);
    console.log("API Error data:", error.response && error.response.data);
    console.log("API Error message:", error.message);

    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
