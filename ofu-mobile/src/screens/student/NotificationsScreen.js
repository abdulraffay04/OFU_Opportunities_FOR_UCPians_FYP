// NotificationsScreen.js
// Shows a list of notifications for the student.
// Students can mark individual notifications or all as read.

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

var COLORS = {
  primary: '#6366f1',
  white: '#ffffff',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  border: '#e5e7eb',
  black: '#000000',
  unreadBg: '#eef2ff',
  red: '#ef4444',
};

// Helper function to turn a date into a relative time string
// Returns "Just now", "X minutes ago", "X hours ago", or "X days ago"
function formatTimeAgo(date) {
  // Handle Firestore Timestamp objects (they have _seconds property)
  var dateObj;
  if (date && date._seconds) {
    dateObj = new Date(date._seconds * 1000);
  } else if (date && date.seconds) {
    dateObj = new Date(date.seconds * 1000);
  } else {
    dateObj = new Date(date);
  }

  var now = new Date();
  var diffMs = now - dateObj;
  var diffMinutes = Math.floor(diffMs / 60000);
  var diffHours = Math.floor(diffMs / 3600000);
  var diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return diffMinutes + ' minutes ago';
  if (diffHours < 24) return diffHours + ' hours ago';
  return diffDays + ' days ago';
}

export default function NotificationsScreen({ navigation }) {
  var [notifications, setNotifications] = useState([]);
  var [loading, setLoading] = useState(true);
  var { logout } = useAuth();

  // Load notifications when the screen mounts
  useEffect(function () {
    loadNotifications();
  }, []);

  // Fetch all notifications from the backend API
  async function loadNotifications() {
    try {
      setLoading(true);
      var response = await api.get('/notifications');
      var data = response.data.data || [];
      setNotifications(data);
    } catch (error) {
      console.log('Failed to load notifications:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle tapping on a single notification — mark it as read
  async function handleNotificationPress(notification) {
    try {
      // Mark this notification as read on the backend
      if (!notification.isRead) {
        await api.patch('/notifications/' + notification.id + '/read');

        // Update the notification in local state to show as read
        setNotifications(function (prev) {
          return prev.map(function (n) {
            if (n.id === notification.id) {
              return Object.assign({}, n, { isRead: true });
            }
            return n;
          });
        });
      }

      // Navigate to Browse screen if there is a relatedId
      if (notification.relatedId) {
        navigation.navigate('Browse');
      }
    } catch (error) {
      console.log('Failed to mark notification as read:', error.message);
    }
  }

  // Handle "Mark All Read" button press
  async function handleMarkAllRead() {
    try {
      await api.patch('/notifications/mark-all-read');

      // Update all notifications in local state to show as read
      setNotifications(function (prev) {
        return prev.map(function (n) {
          return Object.assign({}, n, { isRead: true });
        });
      });
    } catch (error) {
      console.log('Failed to mark all as read:', error.message);
    }
  }

  // Handle logout button press
  function handleLogout() {
    logout();
  }

  // Check if there are any unread notifications
  function hasUnread() {
    for (var i = 0; i < notifications.length; i++) {
      if (!notifications[i].isRead) return true;
    }
    return false;
  }

  // Render a single notification item in the FlatList
  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: item.isRead ? COLORS.white : COLORS.unreadBg },
        ]}
        onPress={function () { handleNotificationPress(item); }}
      >
        {/* Notification title */}
        <Text style={[
          styles.notificationTitle,
          { fontWeight: item.isRead ? '500' : 'bold' },
        ]}>
          {item.title}
        </Text>

        {/* Notification message */}
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>

        {/* Relative time */}
        <Text style={styles.notificationTime}>
          {formatTimeAgo(item.createdAt)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with title */}
      <Header
        title="Notifications"
        navigation={navigation}
        role="student"
        showLogout={true}
        onLogout={handleLogout}
      />

      {/* Mark All Read button — only visible when there are unread notifications */}
      {!loading && hasUnread() && (
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark All Read</Text>
        </TouchableOpacity>
      )}

      {/* Main content area */}
      <View style={styles.content}>
        {/* Loading spinner */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : notifications.length === 0 ? (
          /* Empty state */
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          /* Notification list */
          <FlatList
            data={notifications}
            keyExtractor={function (item) { return item.id; }}
            renderItem={renderItem}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={true}
          />
        )}
      </View>
    </View>
  );
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markAllButton: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  markAllText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  notificationItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notificationTitle: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 3,
  },
  notificationMessage: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
});
