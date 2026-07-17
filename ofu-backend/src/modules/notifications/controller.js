// This file handles incoming notification requests and sends responses.
// It connects the routes to the notification service functions.

const notificationsService = require('./service');
const { success, error } = require('../../utils/responseHelper');

// Get the latest 30 notifications for the logged-in user
async function getMyNotificationsController(req, res, next) {
  try {
    // Get the user's uid from the authenticate middleware
    const userId = req.user.uid;

    // Fetch their notifications from Firestore
    const notifications = await notificationsService.getMyNotifications(userId);

    return success(res, notifications);
  } catch (err) {
    next(err);
  }
}

// Get the count of unread notifications for the logged-in user
async function getUnreadCountController(req, res, next) {
  try {
    // Get the user's uid from the authenticate middleware
    const userId = req.user.uid;

    // Count their unread notifications
    const count = await notificationsService.getUnreadCount(userId);

    return success(res, { count: count });
  } catch (err) {
    next(err);
  }
}

// Mark a single notification as read
async function markAsReadController(req, res, next) {
  try {
    // Get the notification ID from the URL parameters
    const notificationId = req.params.id;

    // Get the user's uid from the authenticate middleware
    const userId = req.user.uid;

    // Try to mark this notification as read
    const result = await notificationsService.markNotificationAsRead(notificationId, userId);

    // Check if the service returned an error
    if (result.error) {
      return error(res, result.error, result.statusCode);
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

// Mark all unread notifications as read for the logged-in user
async function markAllAsReadController(req, res, next) {
  try {
    // Get the user's uid from the authenticate middleware
    const userId = req.user.uid;

    // Mark all their unread notifications as read
    const result = await notificationsService.markAllAsRead(userId);

    return success(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyNotificationsController,
  getUnreadCountController,
  markAsReadController,
  markAllAsReadController,
};
