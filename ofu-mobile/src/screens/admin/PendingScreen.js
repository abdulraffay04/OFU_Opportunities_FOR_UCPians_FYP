// PendingScreen.js
// Admin screen to approve or reject pending opportunities.
// Shows reject modal with reason input.

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal, TextInput,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

var C = {
  primary: '#ef4444', green: '#22c55e', white: '#fff', gray: '#6b7280',
  lightGray: '#f3f4f6', border: '#e5e7eb', black: '#000',
  blue: '#3b82f6', yellow: '#f59e0b', orange: '#f97316', purple: '#6366f1',
};
var TYPE_COLORS = { job: C.green, internship: C.blue, scholarship: C.yellow, freelance: C.orange, event: C.purple };

export default function PendingScreen({ navigation }) {
  var [opportunities, setOpportunities] = useState([]);
  var [loading, setLoading] = useState(true);
  var [rejectModalVisible, setRejectModalVisible] = useState(false);
  var [selectedOpp, setSelectedOpp] = useState(null);
  var [rejectReason, setRejectReason] = useState('');
  var { logout } = useAuth();

  useEffect(function () { loadPendingOpportunities(); }, []);

  // Load all opportunities that are waiting for admin approval
  async function loadPendingOpportunities() {
    try {
      setLoading(true);
      var response = await api.get('/admin/pending');
      var data = response.data.data || response.data.opportunities || response.data || [];
      setOpportunities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Load pending error:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Approve an opportunity so it becomes visible to students
  async function handleApprove(opportunityId) {
    try {
      await api.patch('/admin/opportunities/' + opportunityId + '/approve');
      setOpportunities(opportunities.filter(function (opp) { return opp.id !== opportunityId; }));
      Alert.alert('Success', 'Opportunity approved');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || error.message);
    }
  }

  // Reject an opportunity with the reason entered by admin
  async function handleReject() {
    if (!rejectReason.trim()) {
      Alert.alert('Error', 'Please enter a reason');
      return;
    }
    try {
      await api.patch('/admin/opportunities/' + selectedOpp.id + '/reject', { rejectReason: rejectReason.trim() });
      setOpportunities(opportunities.filter(function (opp) { return opp.id !== selectedOpp.id; }));
      setRejectModalVisible(false);
      setRejectReason('');
      Alert.alert('Success', 'Opportunity rejected');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || error.message);
    }
  }

  function renderCard({ item }) {
    var badgeColor = TYPE_COLORS[(item.type || '').toLowerCase()] || C.gray;
    return (
      <View style={s.card}>
        <Text style={s.title}>{item.title || 'Untitled'}</Text>
        <Text style={s.poster}>Posted by: {item.posterName || item.postedBy || 'Unknown'}</Text>
        <View style={[s.badge, { backgroundColor: badgeColor }]}>
          <Text style={s.badgeText}>{(item.type || 'other').toUpperCase()}</Text>
        </View>
        <Text style={s.meta}>📍 {item.location || 'N/A'}  •  📅 {item.deadline || 'N/A'}</Text>
        <View style={s.btnRow}>
          <TouchableOpacity style={[s.btn, { backgroundColor: C.green, marginRight: 5 }]}
            onPress={function () { handleApprove(item.id); }}>
            <Text style={s.btnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btn, { backgroundColor: C.primary, marginLeft: 5 }]}
            onPress={function () { setSelectedOpp(item); setRejectModalVisible(true); }}>
            <Text style={s.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Header title="Pending Opportunities" navigation={navigation}
        role="admin" showLogout={true} onLogout={function () { logout(); }} />
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={s.centered}><ActivityIndicator size="large" color={C.primary} /></View>
        ) : opportunities.length === 0 ? (
          <View style={s.centered}>
            <Text style={{ fontSize: 32 }}>✅</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: C.black, marginTop: 8 }}>No pending opportunities.</Text>
            <Text style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>All caught up!</Text>
          </View>
        ) : (
          <FlatList data={opportunities} keyExtractor={function (i, x) { return (i.id || '') + x; }}
            renderItem={renderCard} style={{ flex: 1 }}
            contentContainerStyle={{ padding: 10, paddingBottom: 100 }} />
        )}
      </View>

      {/* Reject Modal */}
      <Modal visible={rejectModalVisible} transparent={true} animationType="fade"
        onRequestClose={function () { setRejectModalVisible(false); }}>
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: C.black }}>Reject Opportunity</Text>
            <Text style={{ fontSize: 13, color: C.gray, marginBottom: 15 }}>{selectedOpp?.title}</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: C.black, marginBottom: 6 }}>Reason for rejection:</Text>
            <TextInput style={s.reasonInput} placeholder="Enter rejection reason..."
              placeholderTextColor={C.gray} value={rejectReason} onChangeText={setRejectReason}
              multiline={true} numberOfLines={3} textAlignVertical="top" />
            <TouchableOpacity style={[s.btn, { backgroundColor: C.primary, marginTop: 12 }]} onPress={handleReject}>
              <Text style={s.btnText}>Confirm Reject</Text></TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: C.gray, marginTop: 8 }]}
              onPress={function () { setRejectModalVisible(false); setRejectReason(''); }}>
              <Text style={s.btnText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

var s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  poster: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginTop: 6 },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 6 },
  btnRow: { flexDirection: 'row', marginTop: 12 },
  btn: { flex: 1, borderRadius: 6, padding: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  reasonInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, fontSize: 14, color: '#000', minHeight: 70, textAlignVertical: 'top' },
});
