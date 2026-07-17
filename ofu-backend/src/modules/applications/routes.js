// This file defines the application-related API routes.
// It maps HTTP methods and paths to controller functions.

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/authorize');
const applicationsController = require('./controller');

// POST /api/v1/applications
// Authenticated — submit a new application
router.post(
  '/',
  authenticate,
  applicationsController.submitApplication
);

// GET /api/v1/applications/my
// Authenticated — get all applications submitted by the logged-in user
router.get(
  '/my',
  authenticate,
  applicationsController.getMyApplications
);

// GET /api/v1/applications/received
// Authenticated — get all applications received (alumni and employer only)
router.get(
  '/received',
  authenticate,
  requireRole('alumni', 'employer'),
  applicationsController.getApplicationsReceived
);

// GET /api/v1/applications/admin/all
// Authenticated — get all applications for admin-posted opportunities
router.get(
  '/admin/all',
  authenticate,
  requireRole('admin'),
  applicationsController.getAllApplicationsForAdmin
);

// POST /api/v1/applications/:opportunityID/shortlist
// Authenticated — shortlist the top X candidates for an opportunity
router.post(
  '/:opportunityID/shortlist',
  authenticate,
  requireRole('alumni', 'employer', 'admin'),
  applicationsController.shortlistCandidatesController
);

// PATCH /api/v1/applications/:id/status
// Authenticated — update application status (alumni, employer, and admin)
router.patch(
  '/:id/status',
  authenticate,
  requireRole('alumni', 'employer', 'admin'),
  applicationsController.updateApplicationStatus
);

// PATCH /api/v1/applications/:id/withdraw
// Authenticated — withdraw an application
router.patch(
  '/:id/withdraw',
  authenticate,
  applicationsController.withdrawApplication
);

module.exports = router;
