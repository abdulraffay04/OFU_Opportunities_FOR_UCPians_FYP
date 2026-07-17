// This file handles all database operations for applications.
// It provides functions to submit, view, update status, and withdraw applications.

const { db } = require('../../config/firebase');
const { APPLICATION_STATUS, OPPORTUNITY_STATUS } = require('../../config/constants');

// Submit a new application for an opportunity
async function submitApplication(studentId, applicationData) {
  // Step 1: Check that the opportunity exists
  const opportunityRef = db.collection('opportunities').doc(applicationData.opportunityID);
  const opportunityDoc = await opportunityRef.get();

  if (!opportunityDoc.exists) {
    return { error: 'Opportunity not found', statusCode: 404 };
  }

  const opportunity = opportunityDoc.data();

  // Step 2: Check that the opportunity is approved (accepting applications)
  if (opportunity.status !== OPPORTUNITY_STATUS.APPROVED) {
    return { error: 'This opportunity is not available for applications', statusCode: 400 };
  }

  // Step 3: Check that the deadline has not passed
  const deadline = new Date(opportunity.deadline);
  const now = new Date();

  if (deadline < now) {
    return { error: 'The deadline for this opportunity has passed', statusCode: 400 };
  }

  // Step 4: Check if the student has already applied for this opportunity
  const existingApplication = await db.collection('applications')
    .where('studentID', '==', studentId)
    .where('opportunityID', '==', applicationData.opportunityID)
    .get();

  if (!existingApplication.empty) {
    return { error: 'You have already applied for this opportunity', statusCode: 400 };
  }

  // All checks passed — create the application document
  const currentTime = new Date().toISOString();

  const docData = {
    studentID: studentId,
    opportunityID: applicationData.opportunityID,
    status: APPLICATION_STATUS.SUBMITTED,
    headline: applicationData.headline || null,
    summary: applicationData.summary || null,
    coverLetter: applicationData.coverLetter || null,
    resumeUrl: applicationData.resumeUrl || null,
    appliedAt: currentTime,
    updatedAt: currentTime,
  };

  console.log('Saving application with resumeUrl:', docData.resumeUrl);
  console.log('New application saved for opportunity:', docData.opportunityID);

  // Add the document to Firestore (auto-generates an ID)
  const docRef = await db.collection('applications').add(docData);

  // Return the data with the generated ID
  docData.id = docRef.id;
  return docData;
}

// Get all applications submitted by a specific student
async function getMyApplications(studentId) {
  const snapshot = await db.collection('applications')
    .where('studentID', '==', studentId)
    .orderBy('appliedAt', 'desc')
    .get();

  // Collect all application documents into an array
  const applications = [];
  snapshot.forEach(function (doc) {
    const data = doc.data();
    data.id = doc.id;
    applications.push(data);
  });

  return applications;
}

// Get all applications received for opportunities posted by an employer
async function getApplicationsReceived(employerId) {
  try {
    // Step 1: Get all opportunities posted by this employer
    const opportunitiesSnapshot = await db.collection('opportunities')
      .where('postedBy', '==', employerId)
      .get();

    // Build a map of opportunity ID → opportunity data
    const opportunityMap = {};
    opportunitiesSnapshot.forEach(function (doc) {
      var data = doc.data();
      data.id = doc.id;
      opportunityMap[doc.id] = data;
    });

    var opportunityIDs = Object.keys(opportunityMap);

    // If the employer has no opportunities, return empty array
    if (opportunityIDs.length === 0) {
      return [];
    }

    // Step 2: Get applications for each opportunity
    var allApplications = [];

    for (var i = 0; i < opportunityIDs.length; i++) {
      var opportunityID = opportunityIDs[i];

      var applicationsSnapshot = await db.collection('applications')
        .where('opportunityID', '==', opportunityID)
        .get();

      applicationsSnapshot.forEach(function (doc) {
        var data = doc.data();
        data.id = doc.id;
        // Attach the opportunity title
        data.opportunityTitle = opportunityMap[opportunityID].title || 'Untitled';
        console.log('Application', doc.id, 'resumeUrl from Firestore:', data.resumeUrl || 'NONE');
        allApplications.push(data);
      });
    }

    // Step 3: For each application, get the student profile from "users" collection
    for (var j = 0; j < allApplications.length; j++) {
      var app = allApplications[j];
      var studentId = app.studentID;

      // Get the student user document
      var student = null;
      try {
        // Try querying by uid field first
        var userSnapshot = await db.collection('users')
          .where('uid', '==', studentId)
          .limit(1)
          .get();

        if (!userSnapshot.empty) {
          student = userSnapshot.docs[0].data();
        } else {
          // Fallback: try getting document by ID directly
          var directDoc = await db.collection('users').doc(studentId).get();
          if (directDoc.exists) {
            student = directDoc.data();
          }
        }

        console.log('Student full data for', studentId, ':', student ? JSON.stringify(Object.keys(student)) : 'NOT FOUND');
        if (student) {
          console.log('Student fields:', { name: student.name, semester: student.semester, cgpa: student.cgpa, department: student.department });
        }
      } catch (err) {
        console.log('Error fetching student profile for', studentId, err.message);
      }

      // Attach student info — check alternate field name casing
      allApplications[j].student = {
        name: student ? (student.name || student.displayName || student.email || 'Student') : 'Student',
        email: student ? (student.email || '') : '',
        skills: student ? (student.skills || '') : '',
        department: student ? (student.department || student.degree || student.major || '') : '',
        cgpa: student ? (student.cgpa || student.CGPA || student.gpa || '') : '',
        phone: student ? (student.phone || student.phoneNumber || '') : '',
        bio: student ? (student.bio || '') : '',
        semester: student ? (student.semester || student.Semester || '') : '',
        profilePicUrl: student ? (student.profilePicUrl || null) : null,
      };
    }

    return allApplications;
  } catch (error) {
    console.log('getApplicationsReceived error:', error);
    return [];
  }
}

// Update the status of an application (employer accepts or rejects)
async function updateApplicationStatus(applicationId, status, actorId) {
  // Get the application document
  const applicationRef = db.collection('applications').doc(applicationId);
  const applicationDoc = await applicationRef.get();

  if (!applicationDoc.exists) {
    return { error: 'Application not found', statusCode: 404 };
  }

  const application = applicationDoc.data();

  // Get the opportunity to check who posted it
  const opportunityRef = db.collection('opportunities').doc(application.opportunityID);
  const opportunityDoc = await opportunityRef.get();

  if (!opportunityDoc.exists) {
    return { error: 'Related opportunity not found', statusCode: 404 };
  }

  const opportunity = opportunityDoc.data();

  // Check that the actor is the one who posted the opportunity OR is an admin
  if (opportunity.postedBy !== actorId) {
    // Check if actor is admin by querying users collection
    var isAdmin = false;
    try {
      var userSnap = await db.collection('users').where('uid', '==', actorId).limit(1).get();
      if (!userSnap.empty && userSnap.docs[0].data().role === 'admin') {
        isAdmin = true;
      }
    } catch (e) { /* ignore */ }

    if (!isAdmin) {
      return { error: 'Not authorized to update this application status', statusCode: 403 };
    }
  }

  // Update the application status
  await applicationRef.update({
    status: status,
    updatedAt: new Date().toISOString(),
  });

  // Get and return the updated application
  const updatedDoc = await applicationRef.get();
  const updatedData = updatedDoc.data();
  updatedData.id = updatedDoc.id;
  return updatedData;
}

// Withdraw an application (student withdraws their own application)
async function withdrawApplication(applicationId, studentId) {
  // Get the application document
  const applicationRef = db.collection('applications').doc(applicationId);
  const applicationDoc = await applicationRef.get();

  if (!applicationDoc.exists) {
    return { error: 'Application not found', statusCode: 404 };
  }

  const application = applicationDoc.data();

  // Check that the student is the one who submitted this application
  if (application.studentID !== studentId) {
    return { error: 'Not authorized to withdraw this application', statusCode: 403 };
  }

  // Set the status to withdrawn
  await applicationRef.update({
    status: APPLICATION_STATUS.WITHDRAWN,
    updatedAt: new Date().toISOString(),
  });

  // Get and return the updated application
  const updatedDoc = await applicationRef.get();
  const updatedData = updatedDoc.data();
  updatedData.id = updatedDoc.id;
  return updatedData;
}

// Get ALL applications for admin — across all admin-posted opportunities
async function getAllApplicationsForAdmin(adminId) {
  try {
    // Get all opportunities posted by this admin
    var opportunitiesSnapshot = await db.collection('opportunities')
      .where('postedBy', '==', adminId)
      .get();

    // Build a map of opportunity ID → opportunity data
    var opportunityMap = {};
    opportunitiesSnapshot.forEach(function (doc) {
      var data = doc.data();
      data.id = doc.id;
      opportunityMap[doc.id] = data;
    });

    var opportunityIDs = Object.keys(opportunityMap);

    if (opportunityIDs.length === 0) {
      return [];
    }

    // Get applications for each opportunity
    var allApplications = [];

    for (var i = 0; i < opportunityIDs.length; i++) {
      var opportunityID = opportunityIDs[i];

      var applicationsSnapshot = await db.collection('applications')
        .where('opportunityID', '==', opportunityID)
        .get();

      applicationsSnapshot.forEach(function (doc) {
        var data = doc.data();
        data.id = doc.id;
        data.opportunityTitle = opportunityMap[opportunityID].title || 'Untitled';
        allApplications.push(data);
      });
    }

    // For each application, get the student profile
    for (var j = 0; j < allApplications.length; j++) {
      var app = allApplications[j];
      var studentId = app.studentID;

      var student = null;
      try {
        var userSnapshot = await db.collection('users')
          .where('uid', '==', studentId)
          .limit(1)
          .get();

        if (!userSnapshot.empty) {
          student = userSnapshot.docs[0].data();
        } else {
          var directDoc = await db.collection('users').doc(studentId).get();
          if (directDoc.exists) {
            student = directDoc.data();
          }
        }
      } catch (err) {
        console.log('Error fetching student for admin view:', studentId, err.message);
      }

      allApplications[j].student = {
        name: student ? (student.name || student.displayName || student.email || 'Student') : 'Student',
        email: student ? (student.email || '') : '',
        skills: student ? (student.skills || '') : '',
        department: student ? (student.department || '') : '',
        cgpa: student ? (student.cgpa || '') : '',
        phone: student ? (student.phone || '') : '',
        bio: student ? (student.bio || '') : '',
        semester: student ? (student.semester || '') : '',
        profilePicUrl: student ? (student.profilePicUrl || null) : null,
      };
    }

    return allApplications;
  } catch (error) {
    console.log('getAllApplicationsForAdmin error:', error);
    return [];
  }
}

// ========================================================
// SHORTLIST CANDIDATES FEATURE
// ========================================================

// Calculate how well a student's skills match the required skills
// Returns a score from 0 to 100
function calculateSkillScore(studentSkills, requiredSkills) {
  // If there are no required skills, we can't calculate a match
  if (!requiredSkills || requiredSkills.trim() === '') {
    return 0;
  }

  // If the student has no skills listed, score is 0
  if (!studentSkills || studentSkills.trim() === '') {
    return 0;
  }

  // Split both strings by comma, trim whitespace, and convert to lowercase
  var requiredList = requiredSkills.split(',').map(function (s) {
    return s.trim().toLowerCase();
  }).filter(function (s) {
    return s.length > 0;
  });

  var studentList = studentSkills.split(',').map(function (s) {
    return s.trim().toLowerCase();
  }).filter(function (s) {
    return s.length > 0;
  });

  // If no valid required skills after cleaning, return 0
  if (requiredList.length === 0) {
    return 0;
  }

  // Count how many required skills the student has
  var matchCount = 0;
  for (var i = 0; i < requiredList.length; i++) {
    for (var j = 0; j < studentList.length; j++) {
      if (studentList[j].includes(requiredList[i]) || requiredList[i].includes(studentList[j])) {
        matchCount++;
        break;
      }
    }
  }

  // Return score as a percentage (0 to 100)
  return (matchCount / requiredList.length) * 100;
}

// Calculate a score from the student's CGPA
// Assumes a 4.0 GPA scale, returns 0 to 100
function calculateCgpaScore(cgpa) {
  // Try to convert cgpa to a number
  var cgpaNumber = parseFloat(cgpa);

  // If cgpa is missing or not a valid number, return 0
  if (isNaN(cgpaNumber)) {
    return 0;
  }

  // Convert 4.0 scale to 0-100 percentage
  return (cgpaNumber / 4.0) * 100;
}

// Shortlist the top X candidates for an opportunity
// Scores each applicant based on skills, CGPA, or both
async function shortlistCandidates(opportunityID, actorId, actorRole, count, criteria) {
  // Step 1: Get the opportunity document from Firestore
  var opportunityRef = db.collection('opportunities').doc(opportunityID);
  var opportunityDoc = await opportunityRef.get();

  if (!opportunityDoc.exists) {
    return { error: 'Opportunity not found', statusCode: 404 };
  }

  var opportunity = opportunityDoc.data();

  // Step 2: Check authorization
  // Admins can shortlist for any opportunity
  // Others can only shortlist for their own posted opportunities
  if (actorRole !== 'admin') {
    if (opportunity.postedBy !== actorId) {
      return { error: 'Not authorized to shortlist for this opportunity', statusCode: 403 };
    }
  }

  // Step 3: Get all applications for this opportunity
  var applicationsSnapshot = await db.collection('applications')
    .where('opportunityID', '==', opportunityID)
    .get();

  if (applicationsSnapshot.empty) {
    return { error: 'No applications found for this opportunity', statusCode: 404 };
  }

  // Step 4: For each application, get the student profile and calculate scores
  var scoredApplications = [];

  for (var i = 0; i < applicationsSnapshot.docs.length; i++) {
    var appDoc = applicationsSnapshot.docs[i];
    var appData = appDoc.data();
    appData.id = appDoc.id;

    // Get the student profile from the users collection
    var student = null;
    try {
      var userSnapshot = await db.collection('users')
        .where('uid', '==', appData.studentID)
        .limit(1)
        .get();

      if (!userSnapshot.empty) {
        student = userSnapshot.docs[0].data();
      } else {
        // Fallback: try getting document by ID directly
        var directDoc = await db.collection('users').doc(appData.studentID).get();
        if (directDoc.exists) {
          student = directDoc.data();
        }
      }
    } catch (err) {
      console.log('Error fetching student for shortlisting:', appData.studentID, err.message);
    }

    // Get the student's skills and CGPA
    var studentSkills = student ? (student.skills || '') : '';
    var studentCgpa = student ? (student.cgpa || '') : '';
    var studentName = student ? (student.name || student.email || 'Student') : 'Student';

    // Calculate skill match score
    var skillScore = calculateSkillScore(studentSkills, opportunity.requiredSkills || '');

    // Calculate CGPA score
    var cgpaScore = calculateCgpaScore(studentCgpa);

    // Calculate the final score based on criteria
    var finalScore = 0;

    if (criteria === 'skills') {
      finalScore = skillScore;
    } else if (criteria === 'cgpa') {
      finalScore = cgpaScore;
    } else {
      // Default: "both" — weighted 60% skills + 40% CGPA
      finalScore = (skillScore * 0.6) + (cgpaScore * 0.4);
    }

    // Round scores to one decimal place for cleanliness
    skillScore = Math.round(skillScore * 10) / 10;
    cgpaScore = Math.round(cgpaScore * 10) / 10;
    finalScore = Math.round(finalScore * 10) / 10;

    // Save all the info we need
    scoredApplications.push({
      id: appData.id,
      studentName: studentName,
      skillScore: skillScore,
      cgpaScore: cgpaScore,
      finalScore: finalScore,
      status: appData.status,
    });
  }

  // Step 5: Sort by finalScore in descending order (highest score first)
  scoredApplications.sort(function (a, b) {
    return b.finalScore - a.finalScore;
  });

  // Step 6: Take the top "count" applications
  var topCandidates = scoredApplications.slice(0, count);

  // Step 7: Update each top candidate's status to "shortlisted" in Firestore
  for (var j = 0; j < topCandidates.length; j++) {
    var candidate = topCandidates[j];

    await db.collection('applications').doc(candidate.id).update({
      status: APPLICATION_STATUS.SHORTLISTED,
      updatedAt: new Date().toISOString(),
    });

    // Update the status in our result array too
    topCandidates[j].status = 'shortlisted';
  }

  // Step 8: Return the shortlisted candidates
  return topCandidates;
}

module.exports = {
  submitApplication,
  getMyApplications,
  getApplicationsReceived,
  updateApplicationStatus,
  withdrawApplication,
  getAllApplicationsForAdmin,
  shortlistCandidates,
};
