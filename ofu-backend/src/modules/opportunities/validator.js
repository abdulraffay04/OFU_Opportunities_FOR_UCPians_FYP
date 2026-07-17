// This file contains validation rules for opportunity-related requests.
// It checks that the request body has the correct fields and formats.

const { body, validationResult } = require('express-validator');
const { OPPORTUNITY_TYPES } = require('../../config/constants');

// Validation rules for creating a new opportunity
const createOpportunityRules = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(OPPORTUNITY_TYPES).withMessage('Type must be one of: ' + OPPORTUNITY_TYPES.join(', ')),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description must be a string')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),

  body('location')
    .notEmpty().withMessage('Location is required')
    .isString().withMessage('Location must be a string'),

  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid date')
    .custom(function (value) {
      const deadlineDate = new Date(value);
      const today = new Date();
      if (deadlineDate <= today) {
        throw new Error('Deadline must be a future date');
      }
      return true;
    }),

  // Required skills is optional — comma separated string like "React, Node.js"
  body('requiredSkills')
    .optional()
    .isString().withMessage('Required skills must be a string'),
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
  createOpportunityRules,
  handleValidationErrors,
};
