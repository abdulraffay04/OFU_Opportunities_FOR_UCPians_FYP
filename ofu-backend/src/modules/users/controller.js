// This file handles incoming user-related requests and sends responses.
// It connects the routes to the user service functions.

const usersService = require('./service');
const { success, error } = require('../../utils/responseHelper');

// Update the currently logged-in user's profile
async function updateProfile(req, res, next) {
  try {
    // Get the user's uid from the authenticate middleware
    const uid = req.user.uid;

    // Get the profile data from the request body
    const profileData = req.body;
    console.log('Update profile called for uid:', uid);
    console.log('Controller received profile data:', profileData);

    // Update the profile in Firestore
    const updatedProfile = await usersService.updateProfile(uid, profileData);
    console.log('Profile updated successfully');

    return success(res, updatedProfile);
  } catch (err) {
    console.log('Update profile error:', err.message);
    next(err);
  }
}

// Get all users (admin only), optionally filtered by role
async function getAllUsers(req, res, next) {
  try {
    // Get the optional role filter from query parameters
    const roleFilter = req.query.role || null;

    // Get all users from Firestore
    const users = await usersService.getAllUsers(roleFilter);

    return success(res, users);
  } catch (err) {
    next(err);
  }
}

// Deactivate a user account (admin only)
async function deactivateUser(req, res, next) {
  try {
    // Get the user ID from the URL parameters
    const userId = req.params.id;

    // Deactivate the user in Firestore and Firebase Auth
    const result = await usersService.deactivateUser(userId);

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  updateProfile,
  getAllUsers,
  deactivateUser,
};
