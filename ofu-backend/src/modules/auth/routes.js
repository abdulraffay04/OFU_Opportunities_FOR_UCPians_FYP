// This file defines the auth-related API routes.
// Routes: POST /register-profile and GET /me

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authenticate');
const authController = require('./controller');
const { registerProfileRules, handleValidationErrors } = require('./validator');

// POST /api/v1/auth/register-profile
// Requires: valid Firebase token + valid body fields
router.post(
  '/register-profile',
  authenticate,
  registerProfileRules,
  handleValidationErrors,
  authController.registerProfile
);

// GET /api/v1/auth/me
// Requires: valid Firebase token
router.get(
  '/me',
  authenticate,
  authController.getMe
);

module.exports = router;
