// This file handles incoming alumni profile requests and sends responses.
// It connects the routes to the service functions.

const alumniService = require('./service');
const { success, error } = require('../../utils/responseHelper');

// Create or update the logged-in user's alumni profile
async function createOrUpdateProfile(req, res, next) {
  try {
    // Get the user's uid from the authenticate middleware
    const userId = req.user.uid;

    // Get the profile data from the request body
    const profileData = req.body;

    // Create or update the profile in Firestore
    const savedProfile = await alumniService.createOrUpdateProfile(userId, profileData);

    return success(res, savedProfile, 201);
  } catch (err) {
    next(err);
  }
}

// Get all alumni profiles that are open to connect (public route)
async function getAllAlumni(req, res, next) {
  try {
    // Get all alumni profiles from Firestore
    const alumniProfiles = await alumniService.getAllAlumni();

    return success(res, alumniProfiles);
  } catch (err) {
    next(err);
  }
}

// Get a single alumni profile by its ID (public route)
async function getAlumniById(req, res, next) {
  try {
    // Get the alumni profile ID from the URL parameters
    const alumniId = req.params.id;

    // Look up the alumni profile in Firestore
    const profile = await alumniService.getAlumniById(alumniId);

    // Return 404 if not found
    if (!profile) {
      return error(res, 'Alumni profile not found', 404);
    }

    return success(res, profile);
  } catch (err) {
    next(err);
  }
}

// Get the logged-in user's own alumni profile
async function getMyProfile(req, res, next) {
  try {
    const userId = req.user.uid;
    const profile = await alumniService.getMyProfile(userId);

    if (!profile) {
      return error(res, 'Alumni profile not found', 404);
    }

    return success(res, profile);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrUpdateProfile,
  getAllAlumni,
  getAlumniById,
  getMyProfile,
};
