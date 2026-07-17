// This file handles sending push notifications to users.
// It uses Firebase Cloud Messaging (FCM) to send notifications.

const { admin, db } = require('../../config/firebase');

// Send a push notification to a specific user
// This function never throws errors — notification failure must not crash the API
async function sendToUser(userId, notificationData) {
  try {
    // Get the user document to find their FCM token
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    // If user doesn't exist, return false
    if (!userDoc.exists) {
      console.log('Notification: User not found -', userId);
      return { sent: false, reason: 'user not found' };
    }

    const userData = userDoc.data();

    // Check if the user has an FCM token stored
    if (!userData.fcmToken) {
      console.log('No FCM token for user:', userId);
      return { sent: false, reason: 'no token' };
    }

    // Build the message object for Firebase Cloud Messaging
    const message = {
      token: userData.fcmToken,
      notification: {
        title: notificationData.title,
        body: notificationData.body,
      },
      data: notificationData.data || {},
    };

    // Send the notification using Firebase Admin SDK
    await admin.messaging().send(message);

    console.log('Notification sent to user:', userId);
    return { sent: true };
  } catch (notificationError) {
    // Log the error but never throw — notification failure must not crash the API
    console.error('Failed to send notification to user:', userId, notificationError.message);
    return { sent: false, reason: notificationError.message };
  }
}

// ========================================
// IN-APP NOTIFICATIONS (Firestore-based)
// ========================================

// Create a notification document in Firestore for one user
// This function never throws — notification failure must not crash anything
async function createNotificationForUser(userId, title, message, type, relatedId) {
  try {
    // Build the notification document
    const notificationData = {
      userId: userId,
      title: title,
      message: message,
      type: type,
      relatedId: relatedId || null,
      isRead: false,
      createdAt: new Date(),
    };

    // Save it to the "notifications" collection
    await db.collection('notifications').add(notificationData);
  } catch (error) {
    // Log the error but never throw — this must not crash any flow
    console.error('Failed to create notification for user:', userId, error.message);
  }
}

// Notify all students about a newly approved opportunity
// This function never throws — it must never crash the approval flow
async function notifyAllStudentsAboutNewOpportunity(opportunity) {
  try {
    // Get all users who have the "student" role
    const studentsSnapshot = await db.collection('users')
      .where('role', '==', 'student')
      .get();

    console.log('Notifying', studentsSnapshot.size, 'students about new opportunity:', opportunity.title);

    // Loop through each student and create a notification for them
    for (var i = 0; i < studentsSnapshot.docs.length; i++) {
      var studentDoc = studentsSnapshot.docs[i];

      await createNotificationForUser(
        studentDoc.id,
        'New Opportunity Posted',
        'A new ' + (opportunity.type || 'opportunity') + ' has been posted: ' + opportunity.title,
        'new_opportunity',
        opportunity.id
      );
    }

    console.log('Successfully notified', studentsSnapshot.size, 'students');
  } catch (error) {
    // Log the error but never throw — this must never crash the approval flow
    console.error('Failed to notify students about opportunity:', error.message);
  }
}

// Get the latest 30 notifications for a user, newest first
async function getMyNotifications(userId) {
  const snapshot = await db.collection('notifications')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(30)
    .get();

  // Build an array of notifications with their document id included
  var notifications = [];
  for (var i = 0; i < snapshot.docs.length; i++) {
    var doc = snapshot.docs[i];
    var data = doc.data();
    data.id = doc.id;
    notifications.push(data);
  }

  return notifications;
}

// Get the count of unread notifications for a user
async function getUnreadCount(userId) {
  const snapshot = await db.collection('notifications')
    .where('userId', '==', userId)
    .where('isRead', '==', false)
    .get();

  return snapshot.size;
}

// Mark a single notification as read (only if the user owns it)
async function markNotificationAsRead(notificationId, userId) {
  // Get the notification document
  const docRef = db.collection('notifications').doc(notificationId);
  const doc = await docRef.get();

  // Check that it exists
  if (!doc.exists) {
    return { error: 'Notification not found', statusCode: 404 };
  }

  // Check that this notification belongs to the requesting user
  if (doc.data().userId !== userId) {
    return { error: 'Not authorized', statusCode: 403 };
  }

  // Update isRead to true
  await docRef.update({ isRead: true });

  return { message: 'Notification marked as read' };
}

// Mark all unread notifications as read for a user
async function markAllAsRead(userId) {
  // Get all unread notifications for this user
  const snapshot = await db.collection('notifications')
    .where('userId', '==', userId)
    .where('isRead', '==', false)
    .get();

  // Update each one to isRead: true
  for (var i = 0; i < snapshot.docs.length; i++) {
    await snapshot.docs[i].ref.update({ isRead: true });
  }

  return { updated: snapshot.size };
}

module.exports = {
  sendToUser,
  createNotificationForUser,
  notifyAllStudentsAboutNewOpportunity,
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
};
