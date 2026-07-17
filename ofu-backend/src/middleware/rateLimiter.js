// This file sets up rate limiting to prevent abuse of the API.
// It limits how many requests a user can make in a given time window.

const rateLimit = require('express-rate-limit');

// General API rate limiter: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100,                  // Maximum 100 requests per window
  standardHeaders: true,     // Return rate limit info in the headers
  legacyHeaders: false,      // Disable the old X-RateLimit headers
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});

// Auth route rate limiter: 10 requests per 15 minutes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 10,                   // Maximum 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many auth attempts, please try again later.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
