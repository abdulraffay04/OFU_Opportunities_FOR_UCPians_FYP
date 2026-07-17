// This file stores all the constant values used across the application.
// These include user roles, opportunity types, and status values.

// All the possible user roles in the system
const ROLES = {
  STUDENT: 'student',
  ALUMNI: 'alumni',
  EMPLOYER: 'employer',
  ADMIN: 'admin',
};

// All the types of opportunities that can be posted
const OPPORTUNITY_TYPES = [
  'job',
  'internship',
  'scholarship',
  'freelance',
  'event',
];

// The possible statuses for an opportunity
const OPPORTUNITY_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CLOSED: 'closed',
};

// The possible statuses for a user's application
const APPLICATION_STATUS = {
  SUBMITTED: 'submitted',
  SHORTLISTED: 'shortlisted',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

module.exports = {
  ROLES,
  OPPORTUNITY_TYPES,
  OPPORTUNITY_STATUS,
  APPLICATION_STATUS,
};
