// This file defines the opportunity-related API routes.
// It maps HTTP methods and paths to controller functions.

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/authorize');
const opportunitiesController = require('./controller');
const { createOpportunityRules, handleValidationErrors } = require('./validator');

// GET /api/v1/opportunities
// Public — get all approved opportunities (with optional type and location filters)
router.get(
  '/',
  opportunitiesController.getAllApproved
);

// GET /api/v1/opportunities/my
// Authenticated — get opportunities posted by the logged-in user
// This route must be BEFORE /:id so Express does not treat "my" as an ID
router.get(
  '/my',
  authenticate,
  opportunitiesController.getMyOpportunities
);

// GET /api/v1/opportunities/pending
// Admin only — get all pending opportunities for review
router.get(
  '/pending',
  authenticate,
  requireRole('admin'),
  opportunitiesController.getPending
);

// GET /api/v1/opportunities/recommended
// Authenticated — get recommended opportunities for the logged-in student
// This route must be BEFORE /:id so Express does not treat "recommended" as an ID
router.get(
  '/recommended',
  authenticate,
  opportunitiesController.getRecommended
);

// GET /api/v1/opportunities/:id
// Public — get a single opportunity by its ID
router.get(
  '/:id',
  opportunitiesController.getById
);

// POST /api/v1/opportunities
// Authenticated — create a new opportunity (alumni, employer, and admin only)
router.post(
  '/',
  authenticate,
  requireRole('alumni', 'employer', 'admin'),
  createOpportunityRules,
  handleValidationErrors,
  opportunitiesController.createOpportunity
);

// PATCH /api/v1/opportunities/:id
// Authenticated — update an opportunity (only the poster can update)
router.patch(
  '/:id',
  authenticate,
  opportunitiesController.updateOpportunity
);

// DELETE /api/v1/opportunities/:id
// Authenticated — delete an opportunity (poster or admin can delete)
router.delete(
  '/:id',
  authenticate,
  opportunitiesController.deleteOpportunity
);

// PATCH /api/v1/opportunities/:id/status
// Admin only — approve or reject an opportunity
router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin'),
  opportunitiesController.updateStatus
);

module.exports = router;
