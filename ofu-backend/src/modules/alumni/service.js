// This file handles all database operations for alumni profiles.
// It provides functions to create, update, and retrieve alumni profiles.

const { db } = require('../../config/firebase');

// Create a new alumni profile or update an existing one
async function createOrUpdateProfile(userId, profileData) {
  // Check if an alumni profile already exists for this user
  const snapshot = await db.collection('alumniProfiles')
    .where('userId', '==', userId)
    .limit(1)
    .get();

  const now = new Date().toISOString();

  // If name was provided, also update the users collection
  if (profileData.name) {
    try {
      // Try updating by document ID first
      var userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        await db.collection('users').doc(userId).update({ name: profileData.name });
      } else {
        // Fallback: query by uid field
        var userSnapshot = await db.collection('users')
          .where('uid', '==', userId)
          .limit(1)
          .get();
        if (!userSnapshot.empty) {
          await db.collection('users').doc(userSnapshot.docs[0].id).update({ name: profileData.name });
        }
      }
    } catch (err) {
      console.log('Error updating user name:', err.message);
    }
  }

  // If a profile already exists, update it
  if (!snapshot.empty) {
    const existingDoc = snapshot.docs[0];
    const existingDocId = existingDoc.id;

    // Build the update data with only the fields that were provided
    const dataToUpdate = {};

    if (profileData.name !== undefined) {
      dataToUpdate.name = profileData.name;
    }
    if (profileData.profilePicUrl !== undefined) {
      dataToUpdate.profilePicUrl = profileData.profilePicUrl;
    }
    if (profileData.company !== undefined) {
      dataToUpdate.company = profileData.company;
    }
    if (profileData.jobTitle !== undefined) {
      dataToUpdate.jobTitle = profileData.jobTitle;
    }
    if (profileData.industry !== undefined) {
      dataToUpdate.industry = profileData.industry;
    }
    if (profileData.linkedinUrl !== undefined) {
      dataToUpdate.linkedinUrl = profileData.linkedinUrl;
    }
    if (profileData.githubUrl !== undefined) {
      dataToUpdate.githubUrl = profileData.githubUrl;
    }
    if (profileData.location !== undefined) {
      dataToUpdate.location = profileData.location;
    }
    if (profileData.bio !== undefined) {
      dataToUpdate.bio = profileData.bio;
    }
    if (profileData.website !== undefined) {
      dataToUpdate.website = profileData.website;
    }
    if (profileData.phone !== undefined) {
      dataToUpdate.phone = profileData.phone;
    }
    if (profileData.email !== undefined) {
      dataToUpdate.email = profileData.email;
    }
    if (profileData.openToConnect !== undefined) {
      dataToUpdate.openToConnect = profileData.openToConnect;
    }

    // Always update the updatedAt timestamp
    dataToUpdate.updatedAt = now;

    // Update the document in Firestore
    await db.collection('alumniProfiles').doc(existingDocId).update(dataToUpdate);

    // Get and return the full updated document
    const updatedDoc = await db.collection('alumniProfiles').doc(existingDocId).get();
    const updatedData = updatedDoc.data();
    updatedData.id = updatedDoc.id;
    return updatedData;
  }

  // If no profile exists, create a new one
  const newProfile = {
    userId: userId,
    name: profileData.name || null,
    profilePicUrl: profileData.profilePicUrl || null,
    company: profileData.company || null,
    jobTitle: profileData.jobTitle || null,
    industry: profileData.industry || null,
    linkedinUrl: profileData.linkedinUrl || null,
    githubUrl: profileData.githubUrl || null,
    location: profileData.location || null,
    bio: profileData.bio || null,
    website: profileData.website || null,
    phone: profileData.phone || null,
    email: profileData.email || null,
    openToConnect: profileData.openToConnect !== undefined ? profileData.openToConnect : true,
    createdAt: now,
    updatedAt: now,
  };

  // Add the document to Firestore
  const docRef = await db.collection('alumniProfiles').add(newProfile);

  // Return the data with the generated ID
  newProfile.id = docRef.id;
  return newProfile;
}

// Get all alumni profiles that are open to connect
async function getAllAlumni() {
  const snapshot = await db.collection('alumniProfiles')
    .where('openToConnect', '==', true)
    .get();

  // Collect all alumni profiles into an array
  const alumniProfiles = [];
  snapshot.forEach(function (doc) {
    const data = doc.data();
    data.id = doc.id;
    alumniProfiles.push(data);
  });

  // For each profile, if name is missing, try to get it from users collection
  for (var i = 0; i < alumniProfiles.length; i++) {
    var profile = alumniProfiles[i];
    if (!profile.name && profile.userId) {
      try {
        // Try getting user by document ID
        var userDoc = await db.collection('users').doc(profile.userId).get();
        if (userDoc.exists && userDoc.data().name) {
          alumniProfiles[i].name = userDoc.data().name;
        } else {
          // Fallback: query by uid field
          var userSnapshot = await db.collection('users')
            .where('uid', '==', profile.userId)
            .limit(1)
            .get();
          if (!userSnapshot.empty && userSnapshot.docs[0].data().name) {
            alumniProfiles[i].name = userSnapshot.docs[0].data().name;
          }
        }
      } catch (err) {
        console.log('Error fetching user name for alumni:', profile.userId, err.message);
      }
    }
  }

  return alumniProfiles;
}

// Get a single alumni profile by its document ID
async function getAlumniById(id) {
  const docRef = db.collection('alumniProfiles').doc(id);
  const doc = await docRef.get();

  // Return null if the profile doesn't exist
  if (!doc.exists) {
    return null;
  }

  const data = doc.data();
  data.id = doc.id;
  return data;
}

// Get the logged-in user's own alumni profile
async function getMyProfile(userId) {
  try {
    const snapshot = await db.collection('alumniProfiles')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    // Return null if no profile found
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    data.id = doc.id;
    return data;
  } catch (error) {
    console.log('getMyProfile error:', error);
    return null;
  }
}

module.exports = {
  createOrUpdateProfile,
  getAllAlumni,
  getAlumniById,
  getMyProfile,
};
