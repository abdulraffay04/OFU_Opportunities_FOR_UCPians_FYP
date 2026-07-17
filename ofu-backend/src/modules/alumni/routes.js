// This file defines the alumni profile API routes.
// Routes: GET /profile, GET /, GET /:id, POST /profile, PATCH /profile

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authenticate');
const alumniController = require('./controller');

// GET /api/v1/alumni/profile
// Authenticated — get the logged-in user's own alumni profile
// This route MUST be before /:id so Express does not treat "profile" as an ID
router.get(
  '/profile',
  authenticate,
  alumniController.getMyProfile
);

// GET /api/v1/alumni
// Public — get all alumni profiles that are open to connect
router.get(
  '/',
  alumniController.getAllAlumni
);

// GET /api/v1/alumni/:id
// Public — get a single alumni profile by ID
router.get(
  '/:id',
  alumniController.getAlumniById
);

// POST /api/v1/alumni/profile
// Authenticated — create an alumni profile
router.post(
  '/profile',
  authenticate,
  alumniController.createOrUpdateProfile
);

// PATCH /api/v1/alumni/profile
// Authenticated — update an alumni profile
router.patch(
  '/profile',
  authenticate,
  alumniController.createOrUpdateProfile
);

module.exports = router;
