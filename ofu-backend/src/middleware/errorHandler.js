// This file handles all errors that happen in the application.
// Express calls this automatically when an error is thrown or passed to next(err).

// Handle errors and send a JSON response to the client
function errorHandler(err, req, res, next) {
  // Log the error to the console for debugging
  console.error('Error:', err);

  // Use the error's status code, or default to 500 (Internal Server Error)
  let statusCode = err.statusCode;
  if (!statusCode) {
    statusCode = 500;
  }

  // Build the response object
  const response = {
    success: false,
    error: err.message || 'Internal Server Error',
  };

  // Only include the error stack trace in development mode (for debugging)
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

module.exports = errorHandler;
