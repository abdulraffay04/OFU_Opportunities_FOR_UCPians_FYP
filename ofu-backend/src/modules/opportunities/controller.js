// This file handles incoming opportunity requests and sends responses.
// It connects the routes to the service functions.

const opportunitiesService = require('./service');
const { success, error } = require('../../utils/responseHelper');

// Create a new opportunity
async function createOpportunity(req, res, next) {
  try {
    // Get the user info from the authenticate middleware
    const uid = req.user.uid;
    const role = req.user.role;

    // Get the opportunity data from the request body
    const opportunityData = req.body;

    // Create the opportunity in Firestore
    const newOpportunity = await opportunitiesService.createOpportunity(uid, role, opportunityData);

    return success(res, newOpportunity, 201);
  } catch (err) {
    next(err);
  }
}

// Get all approved opportunities (public route)
async function getAllApproved(req, res, next) {
  try {
    // Get optional filters from query parameters
    const filters = {
      type: req.query.type || null,
      location: req.query.location || null,
    };

    // Get approved opportunities from Firestore
    const opportunities = await opportunitiesService.getAllApproved(filters);

    return success(res, opportunities);
  } catch (err) {
    next(err);
  }
}

// Get a single opportunity by its ID (public route)
async function getById(req, res, next) {
  try {
    // Get the opportunity ID from the URL parameters
    const opportunityID = req.params.id;

    // Look up the opportunity in Firestore
    const opportunity = await opportunitiesService.getById(opportunityID);

    // Return 404 if not found
    if (!opportunity) {
      return error(res, 'Opportunity not found', 404);
    }

    return success(res, opportunity);
  } catch (err) {
    next(err);
  }
}

// Update an opportunity (only the poster can update)
async function updateOpportunity(req, res, next) {
  try {
    // Get the opportunity ID from the URL parameters
    const opportunityID = req.params.id;
    const uid = req.user.uid;
    const updateData = req.body;

    // Try to update the opportunity
    const result = await opportunitiesService.updateOpportunity(opportunityID, uid, updateData);

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

// Delete an opportunity (poster or admin can delete)
async function deleteOpportunity(req, res, next) {
  try {
    // Get the opportunity ID from the URL parameters
    const opportunityID = req.params.id;
    const uid = req.user.uid;
    const role = req.user.role;

    // Try to delete the opportunity
    const result = await opportunitiesService.deleteOpportunity(opportunityID, uid, role);

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

// Get all pending opportunities (admin only)
async function getPending(req, res, next) {
  try {
    // Get all pending opportunities from Firestore
    const opportunities = await opportunitiesService.getPending();

    return success(res, opportunities);
  } catch (err) {
    next(err);
  }
}

// Update opportunity status — approve or reject (admin only)
async function updateStatus(req, res, next) {
  try {
    // Get the opportunity ID from the URL parameters
    const opportunityID = req.params.id;

    // Get the new status and optional reject reason from the request body
    const status = req.body.status;
    const rejectReason = req.body.rejectReason || null;

    // Get the admin's ID from the authenticate middleware
    const adminId = req.user.uid;

    // Try to update the status
    const result = await opportunitiesService.updateStatus(opportunityID, status, adminId, rejectReason);

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

// Get opportunities posted by the logged-in user
async function getMyOpportunities(req, res, next) {
  try {
    // Get the user's uid from the authenticate middleware
    const uid = req.user.uid;

    // Get the user's opportunities from Firestore
    const opportunities = await opportunitiesService.getMyOpportunities(uid);

    return success(res, opportunities);
  } catch (err) {
    next(err);
  }
}

// Get recommended opportunities for the logged-in student
async function getRecommended(req, res, next) {
  try {
    // Get the user's uid from the authenticate middleware
    const userId = req.user.uid;

    // Get recommended opportunities based on the student's profile
    const recommended = await opportunitiesService.getRecommendedForStudent(userId);

    return success(res, recommended);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOpportunity,
  getAllApproved,
  getById,
  updateOpportunity,
  deleteOpportunity,
  getPending,
  updateStatus,
  getMyOpportunities,
  getRecommended,
};
