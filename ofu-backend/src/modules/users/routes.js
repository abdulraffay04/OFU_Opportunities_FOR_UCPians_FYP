// This file defines the user management API routes.
// Routes: PATCH /profile, GET /, PATCH /:id/deactivate

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/authorize');
const usersController = require('./controller');

// PATCH /api/v1/users/profile
// Any logged-in user can update their own profile
router.patch(
  '/profile',
  authenticate,
  usersController.updateProfile
);

// GET /api/v1/users
// Only admins can view all users
router.get(
  '/',
  authenticate,
  requireRole('admin'),
  usersController.getAllUsers
);

// PATCH /api/v1/users/:id/deactivate
// Only admins can deactivate user accounts
router.patch(
  '/:id/deactivate',
  authenticate,
  requireRole('admin'),
  usersController.deactivateUser
);

module.exports = router;
