// This file handles incoming saved-opportunity requests and sends responses.
// It connects the routes to the service functions.

const savedService = require('./service');
const { success, error } = require('../../utils/responseHelper');

// Save an opportunity to the user's saved list
async function saveOpportunity(req, res, next) {
  try {
    // Get the user's uid from the authenticate middleware
    const userId = req.user.uid;

    // Get the opportunity ID from the request body
    const opportunityId = req.body.opportunityID;

    // Try to save the opportunity
    const result = await savedService.saveOpportunity(userId, opportunityId);

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
}

// Remove an opportunity from the user's saved list
async function unsaveOpportunity(req, res, next) {
  try {
    // Get the user's uid from the authenticate middleware
    const userId = req.user.uid;

    // Get the opportunity ID from the URL parameters
    const opportunityId = req.params.opportunityId;

    // Try to unsave the opportunity
    const result = await savedService.unsaveOpportunity(userId, opportunityId);

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

// Get all saved opportunities for the logged-in user
async function getMySaved(req, res, next) {
  try {
    // Get the user's uid from the authenticate middleware
    const userId = req.user.uid;

    // Get all saved opportunities with full details
    const savedOpportunities = await savedService.getMySaved(userId);

    return success(res, savedOpportunities);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  saveOpportunity,
  unsaveOpportunity,
  getMySaved,
};
