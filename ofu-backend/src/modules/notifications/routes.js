// This file defines the notification-related API routes.
// It maps HTTP methods and paths to controller functions.

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authenticate');
const notificationsController = require('./controller');

// GET /api/v1/notifications
// Authenticated — get the latest 30 notifications for the logged-in user
router.get(
  '/',
  authenticate,
  notificationsController.getMyNotificationsController
);

// GET /api/v1/notifications/unread-count
// Authenticated — get the count of unread notifications
router.get(
  '/unread-count',
  authenticate,
  notificationsController.getUnreadCountController
);

// PATCH /api/v1/notifications/mark-all-read
// Authenticated — mark all unread notifications as read
// NOTE: This route MUST come before /:id/read so Express doesn't
// match "mark-all-read" as a notification :id
router.patch(
  '/mark-all-read',
  authenticate,
  notificationsController.markAllAsReadController
);

// PATCH /api/v1/notifications/:id/read
// Authenticated — mark a single notification as read
router.patch(
  '/:id/read',
  authenticate,
  notificationsController.markAsReadController
);

module.exports = router;
