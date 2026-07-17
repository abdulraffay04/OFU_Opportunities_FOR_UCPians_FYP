// This file handles all database operations for opportunities.
// It provides functions to create, read, update, delete, and manage opportunity status.

const { db } = require('../../config/firebase');
const { OPPORTUNITY_STATUS } = require('../../config/constants');
const { detectFieldKeywords } = require('../../config/fieldKeywords');

// Create a new opportunity in Firestore
async function createOpportunity(uid, role, opportunityData) {
  const now = new Date().toISOString();

  // Set the status based on the user's role
  // Admins get auto-approved, others need admin review
  let status = OPPORTUNITY_STATUS.PENDING;
  if (role === 'admin') {
    status = OPPORTUNITY_STATUS.APPROVED;
  }

  console.log('Creating opportunity with role:', role, 'status:', status, 'title:', opportunityData.title);

  // Build the document data
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
    postedBy: uid,
    status: status,
    rejectReason: null,
    createdAt: now,
    updatedAt: now,
  };

  // Add the document to Firestore (auto-generates an ID)
  const docRef = await db.collection('opportunities').add(docData);

  // Return the data with the generated ID
  docData.id = docRef.id;
  return docData;
}

// Get all approved opportunities with optional filters
async function getAllApproved(filters) {
  try {
    // Start with a query for only approved opportunities
    let query = db.collection('opportunities')
      .where('status', '==', OPPORTUNITY_STATUS.APPROVED);

    // Apply type filter if provided
    if (filters.type) {
      query = query.where('type', '==', filters.type);
    }

    // Apply location filter if provided
    if (filters.location) {
      query = query.where('location', '==', filters.location);
    }

    // Order by newest first
    query = query.orderBy('createdAt', 'desc');

    // Execute the query
    const snapshot = await query.get();

    // Collect all documents into an array
    const opportunities = [];
    snapshot.forEach(function (doc) {
      const data = doc.data();
      data.id = doc.id;
      opportunities.push(data);
    });

    return opportunities;
  } catch (error) {
    console.log('getAllApproved error (likely missing Firestore index):', error.message);

    // Fallback: query without orderBy if composite index is missing
    try {
      let fallbackQuery = db.collection('opportunities')
        .where('status', '==', OPPORTUNITY_STATUS.APPROVED);

      if (filters.type) {
        fallbackQuery = fallbackQuery.where('type', '==', filters.type);
      }
      if (filters.location) {
        fallbackQuery = fallbackQuery.where('location', '==', filters.location);
      }

      const fallbackSnapshot = await fallbackQuery.get();

      const opportunities = [];
      fallbackSnapshot.forEach(function (doc) {
        const data = doc.data();
        data.id = doc.id;
        opportunities.push(data);
      });

      // Sort in memory instead
      opportunities.sort(function (a, b) {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });

      return opportunities;
    } catch (fallbackError) {
      console.log('getAllApproved fallback error:', fallbackError.message);
      return [];
    }
  }
}

// Get a single opportunity by its ID
async function getById(id) {
  const docRef = db.collection('opportunities').doc(id);
  const doc = await docRef.get();

  // Return null if the opportunity doesn't exist
  if (!doc.exists) {
    return null;
  }

  const data = doc.data();
  data.id = doc.id;
  return data;
}

// Update an opportunity (only the user who posted it can update)
async function updateOpportunity(id, uid, updateData) {
  // First get the opportunity to check ownership
  const opportunity = await getById(id);

  if (!opportunity) {
    return { error: 'Opportunity not found', statusCode: 404 };
  }

  // Check if the user is the one who posted this opportunity
  if (opportunity.postedBy !== uid) {
    return { error: 'Not authorized to update this opportunity', statusCode: 403 };
  }

  // Only allow updating these specific fields
  const allowedFields = ['title', 'description', 'location', 'salary', 'deadline', 'industry', 'requiredSkills'];
  const dataToUpdate = {};

  for (let i = 0; i < allowedFields.length; i++) {
    const field = allowedFields[i];
    if (updateData[field] !== undefined) {
      dataToUpdate[field] = updateData[field];
    }
  }

  // Always update the updatedAt timestamp
  dataToUpdate.updatedAt = new Date().toISOString();

  // Update the document in Firestore
  const docRef = db.collection('opportunities').doc(id);
  await docRef.update(dataToUpdate);

  // Get and return the full updated document
  const updatedDoc = await docRef.get();
  const updatedData = updatedDoc.data();
  updatedData.id = updatedDoc.id;
  return updatedData;
}

// Delete an opportunity (only the poster or an admin can delete)
async function deleteOpportunity(id, uid, role) {
  // First get the opportunity to check ownership
  const opportunity = await getById(id);

  if (!opportunity) {
    return { error: 'Opportunity not found', statusCode: 404 };
  }

  // Check if the user is the owner or an admin
  const isOwner = opportunity.postedBy === uid;
  const isAdmin = role === 'admin';

  if (!isOwner && !isAdmin) {
    return { error: 'Not authorized to delete this opportunity', statusCode: 403 };
  }

  // Delete the document from Firestore
  const docRef = db.collection('opportunities').doc(id);
  await docRef.delete();

  return { message: 'Opportunity deleted successfully' };
}

// Get all pending opportunities (for admin review)
async function getPending() {
  try {
    const query = db.collection('opportunities')
      .where('status', '==', OPPORTUNITY_STATUS.PENDING)
      .orderBy('createdAt', 'desc');

    const snapshot = await query.get();

    // Collect all pending opportunities into an array
    const opportunities = [];
    snapshot.forEach(function (doc) {
      const data = doc.data();
      data.id = doc.id;
      opportunities.push(data);
    });

    return opportunities;
  } catch (error) {
    console.log('getPending error (likely missing Firestore index):', error.message);

    // Fallback: query without orderBy
    try {
      const fallbackQuery = db.collection('opportunities')
        .where('status', '==', OPPORTUNITY_STATUS.PENDING);

      const fallbackSnapshot = await fallbackQuery.get();

      const opportunities = [];
      fallbackSnapshot.forEach(function (doc) {
        const data = doc.data();
        data.id = doc.id;
        opportunities.push(data);
      });

      opportunities.sort(function (a, b) {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });

      return opportunities;
    } catch (fallbackError) {
      console.log('getPending fallback error:', fallbackError.message);
      return [];
    }
  }
}

// Update the status of an opportunity (admin approve or reject)
async function updateStatus(id, status, adminId, rejectReason) {
  const docRef = db.collection('opportunities').doc(id);
  const doc = await docRef.get();

  // Check if the opportunity exists
  if (!doc.exists) {
    return { error: 'Opportunity not found', statusCode: 404 };
  }

  // Build the update data
  const dataToUpdate = {
    status: status,
    updatedAt: new Date().toISOString(),
  };

  // If the opportunity is being rejected, save the reason
  if (status === OPPORTUNITY_STATUS.REJECTED && rejectReason) {
    dataToUpdate.rejectReason = rejectReason;
  }

  // Update the opportunity document
  await docRef.update(dataToUpdate);

  // Log this admin action in the adminLogs collection
  const logData = {
    adminId: adminId,
    action: status === OPPORTUNITY_STATUS.APPROVED ? 'approved' : 'rejected',
    targetId: id,
    targetType: 'opportunity',
    note: rejectReason || null,
    doneAt: new Date().toISOString(),
  };
  await db.collection('adminLogs').add(logData);

  // Get and return the updated opportunity
  const updatedDoc = await docRef.get();
  const updatedData = updatedDoc.data();
  updatedData.id = updatedDoc.id;
  return updatedData;
}

// Get all opportunities posted by a specific user
async function getMyOpportunities(uid) {
  try {
    const query = db.collection('opportunities')
      .where('postedBy', '==', uid)
      .orderBy('createdAt', 'desc');

    const snapshot = await query.get();

    // Collect all of the user's opportunities into an array
    const opportunities = [];
    for (let i = 0; i < snapshot.docs.length; i++) {
      const doc = snapshot.docs[i];
      const data = doc.data();
      data.id = doc.id;

      // Count the number of applications for this opportunity
      const appsSnapshot = await db.collection('applications')
        .where('opportunityID', '==', data.id)
        .get();
      
      const applicantCount = appsSnapshot.size;
      data.applicantCount = applicantCount;
      console.log("Opportunity:", data.title, "- Applicants:", applicantCount);

      opportunities.push(data);
    }

    return opportunities;
  } catch (error) {
    console.log('getMyOpportunities error:', error);

    // If orderBy fails (missing Firestore index), try without ordering
    try {
      const fallbackQuery = db.collection('opportunities')
        .where('postedBy', '==', uid);

      const fallbackSnapshot = await fallbackQuery.get();

      const opportunities = [];
      for (let i = 0; i < fallbackSnapshot.docs.length; i++) {
        const doc = fallbackSnapshot.docs[i];
        const data = doc.data();
        data.id = doc.id;

        // Count the number of applications for this opportunity
        const appsSnapshot = await db.collection('applications')
          .where('opportunityID', '==', data.id)
          .get();
        
        const applicantCount = appsSnapshot.size;
        data.applicantCount = applicantCount;
        console.log("Opportunity:", data.title, "- Applicants:", applicantCount);

        opportunities.push(data);
      }

      return opportunities;
    } catch (fallbackError) {
      console.log('getMyOpportunities fallback error:', fallbackError);
      return [];
    }
  }
}

// Calculate how relevant an opportunity is for a specific student
// Returns an object with totalScore, fieldScore, and skillScore (all 0-100)
function calculateRelevanceScore(opportunity, student) {
  // --- FIELD SCORE ---
  // Get the keywords that match the student's degree/department
  var fieldKeywords = detectFieldKeywords(student.department || '');
  var fieldScore = 0;

  if (fieldKeywords.length > 0) {
    // Build a single lowercase text string from the opportunity details
    var oppText = (
      (opportunity.title || '') + ' ' +
      (opportunity.description || '') + ' ' +
      (opportunity.industry || '') + ' ' +
      (opportunity.type || '')
    ).toLowerCase();

    // Count how many field keywords appear in the opportunity text
    var fieldMatchCount = 0;
    for (var i = 0; i < fieldKeywords.length; i++) {
      if (oppText.includes(fieldKeywords[i])) {
        fieldMatchCount = fieldMatchCount + 1;
      }
    }

    // Calculate field score as a percentage, capped at 100
    fieldScore = Math.min(100, (fieldMatchCount / fieldKeywords.length) * 100);
  }

  // --- SKILL SCORE ---
  var skillScore = 0;

  // Split student skills by comma, trim and lowercase each
  var studentSkills = [];
  if (student.skills && student.skills.trim() !== '') {
    var rawStudentSkills = student.skills.split(',');
    for (var s = 0; s < rawStudentSkills.length; s++) {
      studentSkills.push(rawStudentSkills[s].trim().toLowerCase());
    }
  }

  // Split opportunity required skills by comma, trim and lowercase each
  var requiredSkills = [];
  if (opportunity.requiredSkills && opportunity.requiredSkills.trim() !== '') {
    var rawReqSkills = opportunity.requiredSkills.split(',');
    for (var r = 0; r < rawReqSkills.length; r++) {
      requiredSkills.push(rawReqSkills[r].trim().toLowerCase());
    }
  }

  // Count how many required skills match the student's skills
  if (requiredSkills.length > 0 && studentSkills.length > 0) {
    var skillMatchCount = 0;
    for (var k = 0; k < requiredSkills.length; k++) {
      for (var m = 0; m < studentSkills.length; m++) {
        if (requiredSkills[k] === studentSkills[m]) {
          skillMatchCount = skillMatchCount + 1;
          break;
        }
      }
    }
    skillScore = (skillMatchCount / requiredSkills.length) * 100;
  }

  // --- TOTAL SCORE ---
  // Weight field match at 60% and skill match at 40%
  // Field match is weighted more because not all opportunities have requiredSkills
  var totalScore = Math.round((fieldScore * 0.6) + (skillScore * 0.4));

  return {
    totalScore: totalScore,
    fieldScore: Math.round(fieldScore),
    skillScore: Math.round(skillScore),
  };
}

// Get the top 6 recommended opportunities for a student
// Based on their degree/department and skills
async function getRecommendedForStudent(userId) {
  try {
    // Fetch the student's profile from the users collection
    var userDoc = await db.collection('users').doc(userId).get();

    // If user not found or has no profile, return empty array
    if (!userDoc.exists) {
      return [];
    }

    var student = userDoc.data();

    // If student has no department and no skills, we can't recommend anything
    if (!student.department && !student.skills) {
      return [];
    }

    // Fetch all approved opportunities
    var allOpportunities = await getAllApproved({});

    // Score each opportunity for this student
    var scored = [];
    for (var i = 0; i < allOpportunities.length; i++) {
      var opp = allOpportunities[i];
      var scores = calculateRelevanceScore(opp, student);

      // Only include opportunities that have some relevance
      if (scores.totalScore > 0) {
        // Attach the relevance score to the opportunity object
        opp.relevanceScore = scores.totalScore;
        opp.fieldScore = scores.fieldScore;
        opp.skillScore = scores.skillScore;
        scored.push(opp);
      }
    }

    // Sort by total score, highest first
    scored.sort(function (a, b) {
      return b.relevanceScore - a.relevanceScore;
    });

    // Return the top 6 results
    return scored.slice(0, 6);
  } catch (error) {
    console.log('getRecommendedForStudent error:', error.message);
    return [];
  }
}

module.exports = {
  createOpportunity,
  getAllApproved,
  getById,
  updateOpportunity,
  deleteOpportunity,
  getPending,
  updateStatus,
  getMyOpportunities,
  calculateRelevanceScore,
  getRecommendedForStudent,
};
