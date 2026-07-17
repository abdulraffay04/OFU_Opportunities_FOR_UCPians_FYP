// This file handles all database operations related to user management.
// It provides functions to update profiles, list users, and deactivate accounts.

const { admin, db } = require('../../config/firebase');

// List of fields that users are allowed to update on their own profile
const ALLOWED_UPDATE_FIELDS = ['name', 'bio', 'department', 'skills', 'profilePicUrl', 'phone', 'semester', 'cgpa'];

// Update a user's profile with only the allowed fields
async function updateProfile(uid, profileData) {
  console.log('Updating profile for uid:', uid);
  console.log('Profile data received:', profileData);

  const userRef = db.collection('users').doc(uid);

  // Only keep the fields that are allowed to be updated
  const dataToUpdate = {};
  for (let i = 0; i < ALLOWED_UPDATE_FIELDS.length; i++) {
    const field = ALLOWED_UPDATE_FIELDS[i];
    if (profileData[field] !== undefined) {
      dataToUpdate[field] = profileData[field];
    }
  }

  // Always update the updatedAt timestamp
  dataToUpdate.updatedAt = new Date().toISOString();

  console.log('Saving to Firestore:', dataToUpdate);

  await userRef.update(dataToUpdate);

  // Get the full updated document to return
  const updatedDoc = await userRef.get();
  const savedData = updatedDoc.data();
  console.log('Saved successfully. semester:', savedData.semester, 'cgpa:', savedData.cgpa);
  return savedData;
}

// Get all users, optionally filtered by role
async function getAllUsers(roleFilter) {
  let query = db.collection('users');

  // Apply role filter if provided
  if (roleFilter) {
    query = query.where('role', '==', roleFilter);
  }

  const snapshot = await query.get();

  // Collect all user documents into an array
  const users = [];
  snapshot.forEach(function (doc) {
    users.push(doc.data());
  });

  return users;
}

// Deactivate a user account in both Firestore and Firebase Auth
async function deactivateUser(uid) {
  const userRef = db.collection('users').doc(uid);

  // Set isActive to false in Firestore
  await userRef.update({
    isActive: false,
    updatedAt: new Date().toISOString(),
  });

  // Disable the user's Firebase Auth account so they can't log in
  await admin.auth().updateUser(uid, { disabled: true });

  return { message: 'User account has been deactivated' };
}

module.exports = {
  updateProfile,
  getAllUsers,
  deactivateUser,
};
