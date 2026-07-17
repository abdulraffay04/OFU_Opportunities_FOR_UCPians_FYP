// This file defines the admin API routes.
// All routes require authentication and admin role.

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/authorize');
const adminController = require('./controller');

// All admin routes require authentication and admin role
// We apply these middleware to every route in this router
router.use(authenticate);
router.use(requireRole('admin'));

// GET /api/v1/admin/pending
// Get all pending opportunities for review
router.get(
  '/pending',
  adminController.getPendingOpportunities
);

// PATCH /api/v1/admin/opportunities/:id/approve
// Approve a pending opportunity
router.patch(
  '/opportunities/:id/approve',
  adminController.approveOpportunity
);

// PATCH /api/v1/admin/opportunities/:id/reject
// Reject a pending opportunity (body should contain rejectReason)
router.patch(
  '/opportunities/:id/reject',
  adminController.rejectOpportunity
);

// GET /api/v1/admin/users
// Get all users (optional query param: role)
router.get(
  '/users',
  adminController.getAllUsers
);

// PATCH /api/v1/admin/users/:id/deactivate
// Deactivate a user account
router.patch(
  '/users/:id/deactivate',
  adminController.deactivateUser
);

// PATCH /api/v1/admin/users/:id/activate
// Activate a user account
router.patch(
  '/users/:id/activate',
  adminController.activateUser
);

// POST /api/v1/admin/opportunities
// Post an official opportunity (auto-approved)
router.post(
  '/opportunities',
  adminController.postOfficialOpportunity
);

// GET /api/v1/admin/analytics
// Get platform analytics data
router.get(
  '/analytics',
  adminController.getAnalytics
);

module.exports = router;
