// This file handles all database operations for saved opportunities.
// Users can save, unsave, and view their saved opportunities.

const { db } = require('../../config/firebase');

// Save an opportunity to the user's saved list
async function saveOpportunity(userId, opportunityId) {
  // Check if the user already saved this opportunity
  const existingSnapshot = await db.collection('savedOpportunities')
    .where('userId', '==', userId)
    .where('opportunityID', '==', opportunityId)
    .get();

  if (!existingSnapshot.empty) {
    return { error: 'Already saved', statusCode: 400 };
  }

  // Create the saved opportunity document
  const docData = {
    userId: userId,
    opportunityID: opportunityId,
    savedAt: new Date().toISOString(),
  };

  // Add the document to Firestore
  const docRef = await db.collection('savedOpportunities').add(docData);

  // Return the data with the generated ID
  docData.id = docRef.id;
  return docData;
}

// Remove an opportunity from the user's saved list
async function unsaveOpportunity(userId, opportunityId) {
  // Find the saved document for this user and opportunity
  const snapshot = await db.collection('savedOpportunities')
    .where('userId', '==', userId)
    .where('opportunityID', '==', opportunityId)
    .get();

  // Return error if not found
  if (snapshot.empty) {
    return { error: 'Saved opportunity not found', statusCode: 404 };
  }

  // Delete the first matching document
  const docToDelete = snapshot.docs[0];
  await db.collection('savedOpportunities').doc(docToDelete.id).delete();

  return { message: 'Opportunity unsaved successfully' };
}

// Get all saved opportunities with full opportunity details for a user
async function getMySaved(userId) {
  // Get all saved entries for this user
  const snapshot = await db.collection('savedOpportunities')
    .where('userId', '==', userId)
    .get();

  // For each saved entry, get the full opportunity details
  const savedOpportunities = [];

  for (let i = 0; i < snapshot.docs.length; i++) {
    const savedDoc = snapshot.docs[i];
    const savedData = savedDoc.data();
    savedData.id = savedDoc.id;

    // Get the full opportunity document
    const opportunityRef = db.collection('opportunities').doc(savedData.opportunityID);
    const opportunityDoc = await opportunityRef.get();

    // Attach the opportunity details if it still exists
    if (opportunityDoc.exists) {
      const opportunityData = opportunityDoc.data();
      opportunityData.id = opportunityDoc.id;
      savedData.opportunity = opportunityData;
    }

    savedOpportunities.push(savedData);
  }

  return savedOpportunities;
}

module.exports = {
  saveOpportunity,
  unsaveOpportunity,
  getMySaved,
};
