// This file defines the saved-opportunity API routes.
// Routes: POST /, DELETE /:opportunityId, GET /

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authenticate');
const savedController = require('./controller');

// POST /api/v1/saved
// Authenticated — save an opportunity
router.post(
  '/',
  authenticate,
  savedController.saveOpportunity
);

// DELETE /api/v1/saved/:opportunityId
// Authenticated — unsave an opportunity
router.delete(
  '/:opportunityId',
  authenticate,
  savedController.unsaveOpportunity
);

// GET /api/v1/saved
// Authenticated — get all saved opportunities with full details
router.get(
  '/',
  authenticate,
  savedController.getMySaved
);

module.exports = router;
