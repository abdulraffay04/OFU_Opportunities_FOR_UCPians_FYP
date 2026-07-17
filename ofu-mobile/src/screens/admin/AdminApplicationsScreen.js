// AdminApplicationsScreen.js
// Admin view of all applications across the platform.
// Uses shared ApplicationModal for profile viewing.

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import Header from '../../components/Header';
import ApplicationModal from '../../components/ApplicationModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

var C = {
  primary: '#ef4444', purple: '#6366f1', green: '#22c55e',
  white: '#fff', gray: '#6b7280', lightGray: '#f3f4f6',
  border: '#e5e7eb', black: '#000', blue: '#3b82f6', yellow: '#f59e0b',
};

export default function AdminApplicationsScreen({ navigation }) {
  var [applications, setApplications] = useState([]);
  var [loading, setLoading] = useState(true);
  var [selectedApp, setSelectedApp] = useState(null);
  var [modalVisible, setModalVisible] = useState(false);
  var { logout } = useAuth();

  useEffect(function () { loadAllApplications(); }, []);

  // Load all applications across the platform for admin view
  async function loadAllApplications() {
    try {
      setLoading(true);
      var response = await api.get('/applications/admin/all');
      var data = response.data.data || response.data.applications || response.data || [];
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Load admin applications error:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Update the status of an application (accept or reject)
  async function updateStatus(appId, newStatus) {
    try {
      await api.patch('/applications/' + appId + '/status', { status: newStatus });
      Alert.alert('Success', 'Application ' + newStatus);
      setApplications(applications.map(function (app) {
        if (app.id === appId) {
          return { ...app, status: newStatus };
        }
        return app;
      }));
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || error.message);
    }
  }

  function getInitials(name) {
    if (!name) return '?';
    var p = name.trim().split(' ');
    return p.length >= 2 ? p[0][0].toUpperCase() + p[1][0].toUpperCase() : p[0][0].toUpperCase();
  }

  function getMatchBadge(skills) {
    var count = 0;
    if (typeof skills === 'string') count = skills.split(',').length;
    else if (Array.isArray(skills)) count = skills.length;
    if (count > 3) return { label: 'High Match', bg: C.green };
    if (count >= 2) return { label: 'Medium Match', bg: C.yellow };
    return { label: 'Low Match', bg: C.primary };
  }

  function getStatusStyle(status) {
    if (status === 'accepted') return { bg: C.green, label: 'Accepted' };
    if (status === 'rejected') return { bg: C.primary, label: 'Rejected' };
    return { bg: C.blue, label: 'Submitted' };
  }

  function renderCard({ item }) {
    var student = item.student || item.user || {};
    var name = student.name || item.studentName || 'Applicant';
    var skills = student.skills || item.skills || '';
    var match = getMatchBadge(skills);
    var status = getStatusStyle(item.status);

    return (
      <View style={s.card}>
        <View style={s.cardRow}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{getInitials(name)}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.cardName}>{name}</Text>
            <Text style={{ fontSize: 12, color: C.purple, marginTop: 2 }}>
              Applied for: {item.opportunityTitle || item.opportunity?.title || 'Opportunity'}
            </Text>
            <Text style={s.cardSkills} numberOfLines={1}>
              {typeof skills === 'string' ? skills : (Array.isArray(skills) ? skills.join(', ') : '')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              <View style={[s.badge, { backgroundColor: match.bg }]}>
                <Text style={s.badgeText}>{match.label}</Text></View>
              <View style={[s.badge, { backgroundColor: status.bg }]}>
                <Text style={s.badgeText}>{status.label}</Text></View>
            </View>
          </View>
        </View>
        <TouchableOpacity style={s.viewBtn} onPress={function () { setSelectedApp(item); setModalVisible(true); }}>
          <Text style={s.viewBtnText}>View Profile</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Header title="All Applications" navigation={navigation}
        role="admin" showLogout={true} onLogout={function () { logout(); }} />
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={s.centered}><ActivityIndicator size="large" color={C.primary} /></View>
        ) : applications.length === 0 ? (
          <View style={s.centered}><Text style={{ fontSize: 16, color: C.gray }}>No applications found.</Text></View>
        ) : (
          <FlatList data={applications} keyExtractor={function (i, x) { return (i.id || '') + x; }}
            renderItem={renderCard} style={{ flex: 1 }}
            contentContainerStyle={{ padding: 10, paddingBottom: 100 }} />
        )}
      </View>
      <ApplicationModal visible={modalVisible} application={selectedApp}
        onClose={function () { setModalVisible(false); }}
        onAccept={function () { if (selectedApp) updateStatus(selectedApp.id, 'accepted'); }}
        onReject={function () { if (selectedApp) updateStatus(selectedApp.id, 'rejected'); }} />
    </View>
  );
}

var s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#6b7280', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  cardSkills: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  viewBtn: { borderWidth: 1, borderColor: '#6366f1', borderRadius: 6, padding: 8, marginTop: 10, alignItems: 'center' },
  viewBtnText: { color: '#6366f1', fontSize: 13, fontWeight: '500' },
});
