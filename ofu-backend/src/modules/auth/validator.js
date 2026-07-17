// This file contains validation rules for auth-related requests.
// It checks that the request body has the correct fields and formats.
// Students must use a valid UCP email address (e.g. L1F22BSCS0650@ucp.edu.pk).

const { body, validationResult } = require('express-validator');
const { ROLES } = require('../../config/constants');

// Get all valid role values from the ROLES constant
const validRoles = Object.values(ROLES);

// Check if an email matches the UCP student email format
// Valid format example: L1F22BSCS0650@ucp.edu.pk
function isValidUCPEmail(email) {
  const ucpPattern = /^L1[FS]\d{2}[A-Z]+\d{4}@ucp\.edu\.pk$/i;
  return ucpPattern.test(email);
}

// Validation rules for the register-profile endpoint
const registerProfileRules = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email address'),

  // If the role is "student", the email must match the UCP format
  body('email').custom(function (emailValue, { req }) {
    const userRole = req.body.role;

    // Only check UCP email format for students
    if (userRole === 'student') {
      if (!isValidUCPEmail(emailValue)) {
        throw new Error('Students must register with their UCP email address (e.g. L1F22BSCS0650@ucp.edu.pk)');
      }
    }

    return true;
  }),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(validRoles).withMessage('Role must be one of: ' + validRoles.join(', ')),
];

// Check if there are any validation errors and return them
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
    });
  }

  next();
}

module.exports = {
  registerProfileRules,
  handleValidationErrors,
};
