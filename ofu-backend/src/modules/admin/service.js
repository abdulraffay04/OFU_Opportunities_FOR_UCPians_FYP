// This file handles all admin-related database operations.
// It provides functions for managing opportunities, users, and viewing analytics.

const { admin, db } = require('../../config/firebase');
const { OPPORTUNITY_STATUS, OPPORTUNITY_TYPES } = require('../../config/constants');
const notificationsService = require('../notifications/service');

// Get all pending opportunities with poster details included
async function getPendingOpportunities() {
  try {
    console.log('Fetching pending opportunities...');

    // Try query with ordering first
    var snapshot;
    try {
      snapshot = await db.collection('opportunities')
        .where('status', '==', OPPORTUNITY_STATUS.PENDING)
        .orderBy('createdAt', 'desc')
        .get();
    } catch (indexError) {
      // If composite index is missing, fall back to query without ordering
      console.log('Pending query index error, falling back without orderBy:', indexError.message);
      snapshot = await db.collection('opportunities')
        .where('status', '==', OPPORTUNITY_STATUS.PENDING)
        .get();
    }

    console.log('Pending count:', snapshot.size);

    // For each opportunity, get the poster's name and email
    var opportunities = [];

    for (var i = 0; i < snapshot.docs.length; i++) {
      var doc = snapshot.docs[i];
      var data = doc.data();
      data.id = doc.id;

      console.log('Pending doc:', doc.id, data.status, data.title, 'postedBy:', data.postedBy);

      // Get the poster's details from the users collection
      var posterName = 'Unknown';
      var posterEmail = '';

      try {
        // Try by document ID first
        var userDoc = await db.collection('users').doc(data.postedBy).get();
        if (userDoc.exists) {
          posterName = userDoc.data().name || userDoc.data().email || 'Unknown';
          posterEmail = userDoc.data().email || '';
        } else {
          // Fallback: query by uid field
          var userSnapshot = await db.collection('users')
            .where('uid', '==', data.postedBy)
            .limit(1)
            .get();
          if (!userSnapshot.empty) {
            posterName = userSnapshot.docs[0].data().name || userSnapshot.docs[0].data().email || 'Unknown';
            posterEmail = userSnapshot.docs[0].data().email || '';
          }
        }
      } catch (posterError) {
        console.log('Could not get poster details:', posterError.message);
      }

      data.posterName = posterName;
      data.posterEmail = posterEmail;
      opportunities.push(data);
    }

    console.log('Returning pending opportunities:', opportunities.length);
    return opportunities;
  } catch (error) {
    console.log('getPendingOpportunities error:', error);
    throw error;
  }
}

// Approve an opportunity, log the action, and notify the poster
async function approveOpportunity(opportunityId, adminId) {
  // Get the opportunity document
  const docRef = db.collection('opportunities').doc(opportunityId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return { error: 'Opportunity not found', statusCode: 404 };
  }

  // Update the status to approved
  await docRef.update({
    status: OPPORTUNITY_STATUS.APPROVED,
    updatedAt: new Date().toISOString(),
  });

  // Log this admin action
  const logData = {
    adminId: adminId,
    action: 'approve',
    targetId: opportunityId,
    targetType: 'opportunity',
    doneAt: new Date().toISOString(),
  };
  await db.collection('adminLogs').add(logData);

  // Send a notification to the poster
  const opportunityData = doc.data();
  await notificationsService.sendToUser(opportunityData.postedBy, {
    title: 'Opportunity Approved',
    body: 'Your opportunity "' + opportunityData.title + '" has been approved.',
    data: { opportunityId: opportunityId },
  });

  // Notify all students about the newly approved opportunity
  // Wrapped in try/catch so failure here never stops the approve response
  try {
    const oppWithId = Object.assign({}, opportunityData, { id: opportunityId });
    await notificationsService.notifyAllStudentsAboutNewOpportunity(oppWithId);
  } catch (notifyError) {
    console.error('Failed to notify students (approve):', notifyError.message);
  }

  // Get and return the updated opportunity
  const updatedDoc = await docRef.get();
  const updatedData = updatedDoc.data();
  updatedData.id = updatedDoc.id;
  return updatedData;
}

// Reject an opportunity, log the action, and notify the poster
async function rejectOpportunity(opportunityId, adminId, rejectReason) {
  // Get the opportunity document
  const docRef = db.collection('opportunities').doc(opportunityId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return { error: 'Opportunity not found', statusCode: 404 };
  }

  // Update the status to rejected and set the reject reason
  await docRef.update({
    status: OPPORTUNITY_STATUS.REJECTED,
    rejectReason: rejectReason,
    updatedAt: new Date().toISOString(),
  });

  // Log this admin action
  const logData = {
    adminId: adminId,
    action: 'reject',
    targetId: opportunityId,
    targetType: 'opportunity',
    note: rejectReason,
    doneAt: new Date().toISOString(),
  };
  await db.collection('adminLogs').add(logData);

  // Send a notification to the poster
  const opportunityData = doc.data();
  await notificationsService.sendToUser(opportunityData.postedBy, {
    title: 'Opportunity Rejected',
    body: 'Your opportunity "' + opportunityData.title + '" has been rejected. Reason: ' + rejectReason,
    data: { opportunityId: opportunityId },
  });

  // Get and return the updated opportunity
  const updatedDoc = await docRef.get();
  const updatedData = updatedDoc.data();
  updatedData.id = updatedDoc.id;
  return updatedData;
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
    const data = doc.data();
    data.id = doc.id;
    users.push(data);
  });

  return users;
}

// Deactivate a user account in both Firestore and Firebase Auth
async function deactivateUser(userId, adminId) {
  // Get the user document to make sure they exist
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return { error: 'User not found', statusCode: 404 };
  }

  // Set isActive to false in Firestore
  await userRef.update({
    isActive: false,
    updatedAt: new Date().toISOString(),
  });

  // Disable the user's Firebase Auth account so they can't log in
  await admin.auth().updateUser(userId, { disabled: true });

  // Log this admin action
  const logData = {
    adminId: adminId,
    action: 'deactivate',
    targetId: userId,
    targetType: 'user',
    doneAt: new Date().toISOString(),
  };
  await db.collection('adminLogs').add(logData);

  return { message: 'User account has been deactivated' };
}

// Post an official opportunity that is auto-approved
async function postOfficialOpportunity(adminId, opportunityData) {
  const now = new Date().toISOString();

  // Build the opportunity document — auto-approved since admin is posting
  const docData = {
    title: opportunityData.title,
    type: opportunityData.type,
    description: opportunityData.description,
    industry: opportunityData.industry || null,
    salary: opportunityData.salary || null,
    location: opportunityData.location,
    deadline: opportunityData.deadline,
    attachedUrl: opportunityData.attachedUrl || null,
    requiredSkills: opportunityData.requiredSkills || '',
    postedBy: adminId,
    status: OPPORTUNITY_STATUS.APPROVED,
    rejectReason: null,
    createdAt: now,
    updatedAt: now,
  };

  // Add the document to Firestore
  const docRef = await db.collection('opportunities').add(docData);

  // Return the data with the generated ID
  docData.id = docRef.id;

  // Notify all students about this new official opportunity
  // Wrapped in try/catch so failure here never stops the post response
  try {
    await notificationsService.notifyAllStudentsAboutNewOpportunity(docData);
  } catch (notifyError) {
    console.error('Failed to notify students (official post):', notifyError.message);
  }

  return docData;
}

// Get platform analytics — counts of users, opportunities, and applications
async function getAnalytics() {
  // Count users by role
  const studentsSnapshot = await db.collection('users')
    .where('role', '==', 'student').count().get();
  const alumniSnapshot = await db.collection('users')
    .where('role', '==', 'alumni').count().get();
  const employersSnapshot = await db.collection('users')
    .where('role', '==', 'employer').count().get();

  // Count total opportunities
  const totalOpportunitiesSnapshot = await db.collection('opportunities')
    .count().get();

  // Count opportunities by status
  const pendingSnapshot = await db.collection('opportunities')
    .where('status', '==', OPPORTUNITY_STATUS.PENDING).count().get();
  const approvedSnapshot = await db.collection('opportunities')
    .where('status', '==', OPPORTUNITY_STATUS.APPROVED).count().get();

  // Count opportunities by type
  const opportunitiesByType = {};

  for (let i = 0; i < OPPORTUNITY_TYPES.length; i++) {
    const type = OPPORTUNITY_TYPES[i];
    const typeSnapshot = await db.collection('opportunities')
      .where('type', '==', type).count().get();
    opportunitiesByType[type] = typeSnapshot.data().count;
  }

  // Count total applications
  const applicationsSnapshot = await db.collection('applications')
    .count().get();

  // Return all the analytics data in one object
  return {
    totalStudents: studentsSnapshot.data().count,
    totalAlumni: alumniSnapshot.data().count,
    totalEmployers: employersSnapshot.data().count,
    totalOpportunities: totalOpportunitiesSnapshot.data().count,
    pendingOpportunities: pendingSnapshot.data().count,
    approvedOpportunities: approvedSnapshot.data().count,
    totalApplications: applicationsSnapshot.data().count,
    opportunitiesByType: opportunitiesByType,
  };
}

// Reactivate a user account in both Firestore and Firebase Auth
async function activateUser(userId, adminId) {
  try {
    // Get the user document from Firestore to ensure they exist
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { error: 'User not found', statusCode: 404 };
    }

    // Set isActive to true in Firestore to unblock the user
    await userRef.update({
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    // Re-enable the user's Firebase Auth account so they can log in again
    await admin.auth().updateUser(userId, { disabled: false });

    // Log this admin action
    const logData = {
      adminId: adminId,
      action: 'activate',
      targetId: userId,
      targetType: 'user',
      doneAt: new Date().toISOString(),
    };
    await db.collection('adminLogs').add(logData);

    return { message: 'User unblocked successfully' };
  } catch (error) {
    console.log('Error activating user:', error);
    throw error;
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
