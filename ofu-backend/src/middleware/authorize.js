// This file provides role-based access control.
// Use it after the authenticate middleware to restrict routes to certain roles.

// Check if the logged-in user has one of the allowed roles
// Usage: requireRole('admin', 'employer') — only admins and employers can access
function requireRole() {
  // Collect all the allowed roles from the arguments
  const allowedRoles = Array.from(arguments);

  // Return a middleware function that checks the user's role
  return function (req, res, next) {
    // Check if the user exists and their role is in the allowed list
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // User has an allowed role, continue to the next middleware
    next();
  };
}

module.exports = requireRole;
