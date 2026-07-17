// This file handles all database operations related to user authentication.
// It saves and retrieves user profiles from Firestore.
// Students must use a valid UCP email — this is enforced before saving.

const { admin, db } = require('../../config/firebase');

// Check if an email matches the UCP student email format
// Valid format example: L1F22BSCS0650@ucp.edu.pk
function isValidUCPEmail(email) {
  const ucpPattern = /^L1[FS]\d{2}[A-Z]+\d{4}@ucp\.edu\.pk$/i;
  return ucpPattern.test(email);
}

// Save or update a user profile in Firestore and set their role in Firebase Auth
async function saveUserProfile(uid, profileData) {
  // If the user is a student, make sure their email is a valid UCP email
  if (profileData.role === 'student') {
    if (!isValidUCPEmail(profileData.email)) {
      throw new Error('Invalid UCP email for student');
    }
  }

  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();

  const now = new Date().toISOString();

  // Build the data to save
  const dataToSave = {
    uid: uid,
    name: profileData.name,
    email: profileData.email,
    role: profileData.role,
    isActive: true,
    updatedAt: now,
  };

  // Only add createdAt if this is a new user (document doesn't exist yet)
  if (!userDoc.exists) {
    dataToSave.createdAt = now;
  }

  // Save the user data to Firestore (merge to not overwrite existing fields)
  await userRef.set(dataToSave, { merge: true });

  // Set the user's role as a custom claim in Firebase Auth
  // This allows the role to be included in the JWT token
  await admin.auth().setCustomUserClaims(uid, { role: profileData.role });

  return dataToSave;
}

// Get a user profile from Firestore by their uid
async function getUserProfile(uid) {
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();

  // Return null if the user doesn't exist
  if (!userDoc.exists) {
    return null;
  }

  return userDoc.data();
}

module.exports = {
  saveUserProfile,
  getUserProfile,
};
