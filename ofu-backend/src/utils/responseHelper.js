// This file provides helper functions to send consistent JSON responses.
// Use these instead of writing res.status().json() everywhere.

// Send a success response with data
function success(res, data, statusCode) {
  // Use 200 as the default status code if none is provided
  if (!statusCode) {
    statusCode = 200;
  }

  return res.status(statusCode).json({
    success: true,
    data: data,
  });
}

// Send an error response with a message
function error(res, message, statusCode) {
  // Use 400 as the default status code if none is provided
  if (!statusCode) {
    statusCode = 400;
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = {
  success,
  error,
};
