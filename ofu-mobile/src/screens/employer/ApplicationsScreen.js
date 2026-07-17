// ApplicationsScreen.js (Employer)
// Shows applications received with filters and shortlisting.
// Uses shared ApplicationModal for viewing individual applicants.

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import Header from '../../components/Header';
import ApplicationModal from '../../components/ApplicationModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

var C = {
  primary: '#22c55e', purple: '#6366f1', white: '#fff', gray: '#6b7280',
  lightGray: '#f3f4f6', border: '#e5e7eb', black: '#000',
  blue: '#3b82f6', yellow: '#f59e0b', error: '#ef4444',
  gold: '#eab308',
};

export default function ApplicationsScreen({ navigation }) {
  var [applications, setApplications] = useState([]);
  var [loading, setLoading] = useState(true);
  var [selectedApp, setSelectedApp] = useState(null);
  var [modalVisible, setModalVisible] = useState(false);
  var { logout } = useAuth();

  // Filter states
  var [selectedOpportunity, setSelectedOpportunity] = useState('all');
  var [statusFilter, setStatusFilter] = useState('all');

  // Shortlist modal states
  var [showShortlistModal, setShowShortlistModal] = useState(false);
  var [shortlistCount, setShortlistCount] = useState('');
  var [shortlistCriteria, setShortlistCriteria] = useState('both');
  var [isShortlisting, setIsShortlisting] = useState(false);

  useEffect(function () { loadApplications(); }, []);

  // Load all applications received by this employer
  async function loadApplications() {
    try {
      setLoading(true);
      var response = await api.get('/applications/received');
      var data = response.data.data || response.data.applications || response.data || [];
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Load applications error:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Get unique opportunity titles from loaded applications
  function getUniqueOpportunities() {
    var titles = [];
    var seen = {};
    for (var i = 0; i < applications.length; i++) {
      var title = applications[i].opportunityTitle || 'Untitled';
      if (!seen[title]) {
        seen[title] = true;
        titles.push(title);
      }
    }
    return titles;
  }

  // Get the opportunityID for the selected opportunity title
  function getOpportunityIdByTitle(title) {
    for (var i = 0; i < applications.length; i++) {
      if (applications[i].opportunityTitle === title) {
        return applications[i].opportunityID;
      }
    }
    return null;
  }

  // Filter applications based on selected opportunity and status
  function getFilteredApplications() {
    var filtered = applications;

    // Filter by opportunity
    if (selectedOpportunity !== 'all') {
      filtered = filtered.filter(function (app) {
        return app.opportunityTitle === selectedOpportunity;
      });
    }

    // Filter by status
    if (statusFilter === 'shortlisted') {
      filtered = filtered.filter(function (app) {
        return app.status === 'shortlisted';
      });
    }

    return filtered;
  }

  // Handle the shortlist action
  async function handleShortlist() {
    var count = parseInt(shortlistCount);
    if (!count || count < 1) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    var opportunityId = getOpportunityIdByTitle(selectedOpportunity);
    if (!opportunityId) {
      Alert.alert('Error', 'Could not find the selected opportunity');
      return;
    }

    try {
      setIsShortlisting(true);

      // Call the backend shortlist API
      await api.post('/applications/' + opportunityId + '/shortlist', {
        count: count,
        criteria: shortlistCriteria,
      });

      Alert.alert('Success', 'Top ' + count + ' candidates shortlisted!');

      // Close the modal and refresh the list
      setShowShortlistModal(false);
      setShortlistCount('');
      setShortlistCriteria('both');
      await loadApplications();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || error.message);
    }
    setIsShortlisting(false);
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

  // Get initials from a name for the avatar
  function getInitials(name) {
    if (!name) return '?';
    var p = name.trim().split(' ');
    return p.length >= 2 ? p[0][0].toUpperCase() + p[1][0].toUpperCase() : p[0][0].toUpperCase();
  }

  // Determine skill match badge
  function getMatchBadge(skills) {
    var count = 0;
    if (typeof skills === 'string') count = skills.split(',').length;
    else if (Array.isArray(skills)) count = skills.length;
    if (count > 3) return { label: 'High Match', bg: C.primary };
    if (count >= 2) return { label: 'Medium Match', bg: C.yellow };
    return { label: 'Low Match', bg: C.error };
  }

  // Get the style for a status badge
  function getStatusStyle(status) {
    if (status === 'accepted') return { bg: C.primary, label: 'Accepted' };
    if (status === 'rejected') return { bg: C.error, label: 'Rejected' };
    if (status === 'shortlisted') return { bg: C.gold, label: '⭐ Shortlisted' };
    return { bg: C.blue, label: 'Submitted' };
  }

  // Render each application card
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
            <Text style={s.cardOpp} numberOfLines={1}>{item.opportunityTitle || ''}</Text>
            <Text style={s.cardSkills} numberOfLines={1}>
              {typeof skills === 'string' ? skills : (Array.isArray(skills) ? skills.join(', ') : 'No skills')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
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

  var uniqueOpportunities = getUniqueOpportunities();
  var filteredApplications = getFilteredApplications();

  return (
    <View style={s.container}>
      <Header title="Applications Received" navigation={navigation}
        role="employer" showLogout={true} onLogout={function () { logout(); }} />

      {/* ========== OPPORTUNITY FILTER ROW ========== */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={s.filterScroll} contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 8 }}>

        {/* "All" button */}
        <TouchableOpacity
          style={[s.filterBtn, selectedOpportunity === 'all' && s.filterBtnActive]}
          onPress={function () { setSelectedOpportunity('all'); }}
        >
          <Text style={[s.filterBtnText, selectedOpportunity === 'all' && s.filterBtnTextActive]}>All</Text>
        </TouchableOpacity>

        {/* One button per opportunity */}
        {uniqueOpportunities.map(function (title) {
          var isActive = selectedOpportunity === title;
          return (
            <TouchableOpacity key={title}
              style={[s.filterBtn, isActive && s.filterBtnActive]}
              onPress={function () { setSelectedOpportunity(title); }}
            >
              <Text style={[s.filterBtnText, isActive && s.filterBtnTextActive]} numberOfLines={1}>{title}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ========== SHORTLIST BUTTON + STATUS FILTER ========== */}
      <View style={s.actionRow}>
        {/* Shortlist button — only when a specific opportunity is selected */}
        {selectedOpportunity !== 'all' ? (
          <TouchableOpacity style={s.shortlistBtn}
            onPress={function () { setShowShortlistModal(true); }}>
            <Text style={s.shortlistBtnText}>⭐ Shortlist Candidates</Text>
          </TouchableOpacity>
        ) : <View />}

        {/* Status filter toggle */}
        <View style={s.statusToggle}>
          <TouchableOpacity
            style={[s.toggleBtn, statusFilter === 'all' && s.toggleBtnActive]}
            onPress={function () { setStatusFilter('all'); }}
          >
            <Text style={[s.toggleBtnText, statusFilter === 'all' && s.toggleBtnTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.toggleBtn, statusFilter === 'shortlisted' && s.toggleBtnActive]}
            onPress={function () { setStatusFilter('shortlisted'); }}
          >
            <Text style={[s.toggleBtnText, statusFilter === 'shortlisted' && s.toggleBtnTextActive]}>⭐ Shortlisted</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ========== APPLICATIONS LIST ========== */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={s.centered}><ActivityIndicator size="large" color={C.primary} /></View>
        ) : filteredApplications.length === 0 ? (
          <View style={s.centered}>
            <Text style={{ fontSize: 16, color: C.gray }}>
              {applications.length === 0 ? 'No applications received yet.' : 'No applications match filters.'}
            </Text>
          </View>
        ) : (
          <FlatList data={filteredApplications} keyExtractor={function (i, x) { return (i.id || '') + x; }}
            renderItem={renderCard} style={{ flex: 1 }}
            contentContainerStyle={{ padding: 10, paddingBottom: 100 }} />
        )}
      </View>

      {/* ========== APPLICATION DETAIL MODAL ========== */}
      <ApplicationModal visible={modalVisible} application={selectedApp}
        onClose={function () { setModalVisible(false); }}
        onAccept={function () { if (selectedApp) updateStatus(selectedApp.id, 'accepted'); }}
        onReject={function () { if (selectedApp) updateStatus(selectedApp.id, 'rejected'); }} />

      {/* ========== SHORTLIST MODAL ========== */}
      <Modal visible={showShortlistModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>

            {/* Heading */}
            <Text style={s.modalTitle}>Shortlist Top Candidates</Text>
            <Text style={s.modalSubtitle}>For: {selectedOpportunity}</Text>

            {/* Count input */}
            <Text style={s.modalLabel}>How many candidates to shortlist?</Text>
            <TextInput
              style={s.modalInput}
              placeholder="e.g. 5"
              placeholderTextColor={C.gray}
              keyboardType="number-pad"
              value={shortlistCount}
              onChangeText={setShortlistCount}
            />

            {/* Criteria selection */}
            <Text style={s.modalLabel}>Shortlist based on:</Text>
            <View style={s.criteriaRow}>
              {[
                { key: 'skills', label: 'Skills Match' },
                { key: 'cgpa', label: 'CGPA' },
                { key: 'both', label: 'Both' },
              ].map(function (opt) {
                var isActive = shortlistCriteria === opt.key;
                return (
                  <TouchableOpacity key={opt.key}
                    style={[s.criteriaBtn, isActive && s.criteriaBtnActive]}
                    onPress={function () { setShortlistCriteria(opt.key); }}
                  >
                    <Text style={[s.criteriaBtnText, isActive && s.criteriaBtnTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Buttons */}
            <TouchableOpacity
              style={[s.shortlistSubmitBtn, isShortlisting && { opacity: 0.7 }]}
              onPress={handleShortlist}
              disabled={isShortlisting}
            >
              <Text style={s.shortlistSubmitBtnText}>
                {isShortlisting ? 'Shortlisting...' : 'Shortlist'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.cancelBtn}
              onPress={function () { setShowShortlistModal(false); }}
            >
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

var s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Filter row
  filterScroll: { maxHeight: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8,
    borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff',
  },
  filterBtnActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  filterBtnText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  filterBtnTextActive: { color: '#fff' },

  // Action row
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  shortlistBtn: {
    backgroundColor: '#6366f1', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8,
  },
  shortlistBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Status toggle
  statusToggle: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 2 },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#fff' },
  toggleBtnText: { fontSize: 11, color: '#6b7280', fontWeight: '500' },
  toggleBtnTextActive: { color: '#000', fontWeight: '600' },

  // Card
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#6b7280', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  cardOpp: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
  cardSkills: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  viewBtn: { borderWidth: 1, borderColor: '#6366f1', borderRadius: 6, padding: 8, marginTop: 10, alignItems: 'center' },
  viewBtnText: { color: '#6366f1', fontSize: 13, fontWeight: '500' },

  // Shortlist Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 2 },
  modalSubtitle: { fontSize: 13, color: '#6366f1', marginBottom: 16 },
  modalLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  modalInput: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10,
    fontSize: 15, color: '#000', backgroundColor: '#fff', marginBottom: 16,
  },
  criteriaRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  criteriaBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff',
  },
  criteriaBtnActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  criteriaBtnText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  criteriaBtnTextActive: { color: '#fff' },
  shortlistSubmitBtn: {
    backgroundColor: '#6366f1', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 10,
  },
  shortlistSubmitBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  cancelBtn: {
    backgroundColor: '#f3f4f6', borderRadius: 8, padding: 14, alignItems: 'center',
  },
  cancelBtnText: { color: '#6b7280', fontSize: 15, fontWeight: '500' },
});
