// This file handles incoming admin requests and sends responses.
// It connects the routes to the admin service functions.

const adminService = require('./service');
const { success, error } = require('../../utils/responseHelper');

// Get all pending opportunities for admin review
async function getPendingOpportunities(req, res, next) {
  try {
    // Get all pending opportunities with poster details
    const opportunities = await adminService.getPendingOpportunities();

    return success(res, opportunities);
  } catch (err) {
    next(err);
  }
}

// Approve a pending opportunity
async function approveOpportunity(req, res, next) {
  try {
    // Get the opportunity ID from the URL parameters
    const opportunityId = req.params.id;

    // Get the admin's uid from the authenticate middleware
    const adminId = req.user.uid;

    // Approve the opportunity
    const result = await adminService.approveOpportunity(opportunityId, adminId);

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

// Reject a pending opportunity with a reason
async function rejectOpportunity(req, res, next) {
  try {
    // Get the opportunity ID from the URL parameters
    const opportunityId = req.params.id;

    // Get the admin's uid from the authenticate middleware
    const adminId = req.user.uid;

    // Get the reject reason from the request body
    const rejectReason = req.body.rejectReason;

    // Reject the opportunity
    const result = await adminService.rejectOpportunity(opportunityId, adminId, rejectReason);

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

// Get all users, optionally filtered by role
async function getAllUsers(req, res, next) {
  try {
    // Get the optional role filter from query parameters
    const roleFilter = req.query.role || null;

    // Get all users from Firestore
    const users = await adminService.getAllUsers(roleFilter);

    return success(res, users);
  } catch (err) {
    next(err);
  }
}

// Deactivate a user account
async function deactivateUser(req, res, next) {
  try {
    // Get the user ID from the URL parameters
    const userId = req.params.id;

    // Get the admin's uid from the authenticate middleware
    const adminId = req.user.uid;

    // Deactivate the user
    const result = await adminService.deactivateUser(userId, adminId);

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

// Post an official opportunity (auto-approved)
async function postOfficialOpportunity(req, res, next) {
  try {
    // Get the admin's uid from the authenticate middleware
    const adminId = req.user.uid;

    // Get the opportunity data from the request body
    const opportunityData = req.body;

    // Create the official opportunity
    const newOpportunity = await adminService.postOfficialOpportunity(adminId, opportunityData);

    return success(res, newOpportunity, 201);
  } catch (err) {
    next(err);
  }
}

// Get platform analytics data
async function getAnalytics(req, res, next) {
  try {
    // Get all the analytics counts
    const analytics = await adminService.getAnalytics();

    return success(res, analytics);
  } catch (err) {
    next(err);
  }
}

// Activate a user account
async function activateUser(req, res, next) {
  try {
    // Get the user ID from the URL parameters
    const userId = req.params.id;

    // Get the admin's uid from the authenticate middleware
    const adminId = req.user.uid;

    // Activate the user
    const result = await adminService.activateUser(userId, adminId);

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPendingOpportunities,
  approveOpportunity,
  rejectOpportunity,
  getAllUsers,
  deactivateUser,
  activateUser,
  postOfficialOpportunity,
  getAnalytics,
};
