// This file handles incoming auth requests and sends responses.
// It connects the routes to the service functions.

const authService = require('./service');
const { success, error } = require('../../utils/responseHelper');

// Save or update the user's profile after they register with Firebase Auth
async function registerProfile(req, res, next) {
  try {
    // Get the user's uid from the authenticate middleware
    const uid = req.user.uid;

    // Get the profile fields from the request body
    const name = req.body.name;
    const email = req.body.email;
    const role = req.body.role;

    // Build the profile data object
    const profileData = {
      name: name,
      email: email,
      role: role,
    };

    // Save the profile to Firestore
    const savedProfile = await authService.saveUserProfile(uid, profileData);

    return success(res, savedProfile, 201);
  } catch (err) {
    next(err);
  }
}

// Get the currently logged-in user's profile
async function getMe(req, res, next) {
  try {
    // Get the user's uid from the authenticate middleware
    const uid = req.user.uid;

    // Look up the user's profile in Firestore
    const profile = await authService.getUserProfile(uid);

    // Return 404 if the profile doesn't exist
    if (!profile) {
      return error(res, 'User profile not found', 404);
    }

    return success(res, profile);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerProfile,
  getMe,
};
