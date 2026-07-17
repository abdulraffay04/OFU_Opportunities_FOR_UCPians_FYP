// This file handles incoming application requests and sends responses.
// It connects the routes to the service functions.

const applicationsService = require('./service');
const { success, error } = require('../../utils/responseHelper');

// Submit a new application for an opportunity
async function submitApplication(req, res, next) {
  try {
    // Get the student's uid from the authenticate middleware
    const studentId = req.user.uid;

    // Get the application data from the request body
    const applicationData = req.body;

    // Try to submit the application
    const result = await applicationsService.submitApplication(studentId, applicationData);

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
}

// Get all applications submitted by the logged-in student
async function getMyApplications(req, res, next) {
  try {
    // Get the student's uid from the authenticate middleware
    const studentId = req.user.uid;

    // Get all of the student's applications from Firestore
    const applications = await applicationsService.getMyApplications(studentId);

    return success(res, applications);
  } catch (err) {
    next(err);
  }
}

// Get all applications received for the employer's opportunities
async function getApplicationsReceived(req, res, next) {
  try {
    // Get the employer's uid from the authenticate middleware
    const employerId = req.user.uid;

    // Get all applications for the employer's opportunities
    const applications = await applicationsService.getApplicationsReceived(employerId);

    return success(res, applications);
  } catch (err) {
    next(err);
  }
}

// Update an application's status (accept or reject)
async function updateApplicationStatus(req, res, next) {
  try {
    // Get the application ID from the URL parameters
    const applicationId = req.params.id;

    // Get the new status from the request body
    const status = req.body.status;

    // Get the actor's uid from the authenticate middleware
    const actorId = req.user.uid;

    // Try to update the application status
    const result = await applicationsService.updateApplicationStatus(applicationId, status, actorId);

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

// Withdraw an application (student cancels their application)
async function withdrawApplication(req, res, next) {
  try {
    // Get the application ID from the URL parameters
    const applicationId = req.params.id;

    // Get the student's uid from the authenticate middleware
    const studentId = req.user.uid;

    // Try to withdraw the application
    const result = await applicationsService.withdrawApplication(applicationId, studentId);

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

// Get all applications for admin-posted opportunities
async function getAllApplicationsForAdmin(req, res, next) {
  try {
    const adminId = req.user.uid;
    const applications = await applicationsService.getAllApplicationsForAdmin(adminId);
    return success(res, applications);
  } catch (err) {
    next(err);
  }
}

// Shortlist the top X candidates for an opportunity
async function shortlistCandidatesController(req, res, next) {
  try {
    // Get the opportunity ID from the URL parameters
    var opportunityID = req.params.opportunityID;

    // Get count and criteria from the request body
    var count = req.body.count;
    var criteria = req.body.criteria || 'both';

    // Make sure count is a valid number
    if (!count || count < 1) {
      return error(res, 'Please provide a valid number of candidates to shortlist', 400);
    }

    // Call the service function to do the shortlisting
    var result = await applicationsService.shortlistCandidates(
      opportunityID,
      req.user.uid,
      req.user.role,
      parseInt(count),
      criteria
    );

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitApplication,
  getMyApplications,
  getApplicationsReceived,
  updateApplicationStatus,
  withdrawApplication,
  getAllApplicationsForAdmin,
  shortlistCandidatesController,
};
