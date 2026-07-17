// This file checks if the user has a valid Firebase authentication token.
// It extracts the token from the Authorization header and verifies it.

const { admin, db } = require('../config/firebase');

// Verify the Firebase token and attach user info to the request
async function authenticate(req, res, next) {
  // Get the Authorization header from the request
  const authHeader = req.headers.authorization;

  // Check if the Authorization header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'No token provided',
    });
  }

  // Extract just the token part (after "Bearer ")
  const token = authHeader.split('Bearer ')[1];

  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Look up the user's role from the Firestore users collection
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    let userRole = null;
    if (userDoc.exists) {
      userRole = userDoc.data().role;
    }

    // Attach the user info to the request object so other middleware can use it
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userRole,
    };

    // Token is valid, move to the next middleware
    next();
  } catch (error) {
    // Token verification failed
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
}

module.exports = authenticate;
