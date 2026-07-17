import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Fixes time-bar overlap
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function Header({ title, navigation, role, showLogout, onLogout }) {
  var [menuVisible, setMenuVisible] = useState(false);
  var [unreadCount, setUnreadCount] = useState(0);

  useEffect(function () {
    if (role !== 'student') return;
    fetchUnreadCount();
    var interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [role]);

  async function fetchUnreadCount() {
    try {
      var response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.data.count || 0);
    } catch (error) { console.log(error.message); }
  }

  function getMenuItems() {
    if (role === 'student') return [
      { label: 'Profile', screen: 'Profile', icon: 'person-outline' },
      { label: 'Browse', screen: 'Browse', icon: 'home-outline' },
      { label: 'Saved', screen: 'Saved', icon: 'bookmark-outline' },
      { label: 'Alumni', screen: 'Alumni', icon: 'people-outline' },
      { label: 'Resume', screen: 'Resume', icon: 'document-text-outline' },
      { label: 'Chatbot', screen: 'Chatbot', icon: 'chatbubble-ellipses-outline' },
      { label: 'Notifications', screen: 'Notifications', icon: 'notifications-outline' },
    ];
    if (role === 'employer' || role === 'alumni') return [
      { label: 'Post Opportunity', screen: 'PostOpportunity', icon: 'add-circle-outline' },
      { label: 'Applications', screen: 'Applications', icon: 'clipboard-outline' },
      { label: 'My Posts', screen: 'MyPosts', icon: 'pin-outline' },
      { label: 'Profile', screen: 'EmployerProfile', icon: 'person-circle-outline' },
    ];
    if (role === 'admin') return [
      { label: 'Applications', screen: 'AdminApplications', icon: 'folder-open-outline' },
      { label: 'Pending', screen: 'Pending', icon: 'timer-outline' },
      { label: 'Users', screen: 'UserManagement', icon: 'people-circle-outline' },
      { label: 'Analytics', screen: 'Analytics', icon: 'stats-chart-outline' },
    ];
    return [];
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={28} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>{title}</Text>

        <View style={styles.rightSection}>
          {role === 'student' && (
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={24} color="#111827" />
              {unreadCount > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuPanel}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}><Ionicons name="close" size={24} /></TouchableOpacity>
            </View>
            {getMenuItems().map((item, idx) => (
              <TouchableOpacity key={idx} style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate(item.screen); }}>
                <Ionicons name={item.icon} size={22} color="#4b5563" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={() => { setMenuVisible(false); if(onLogout) onLogout(); }}>
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
              <Text style={styles.logoutItemText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center' },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  menuPanel: { width: 280, backgroundColor: '#ffffff', height: '100%', paddingTop: 60, paddingHorizontal: 20 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  menuTitle: { fontSize: 20, fontWeight: '800' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 },
  menuItemText: { fontSize: 15, fontWeight: '500', color: '#374151' },
  logoutItem: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  logoutItemText: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
});