// UserManagementScreen.js
// Admin screen to view and block users.
// Filter by role: All, Students, Alumni, Employers.

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

var C = {
  primary: '#ef4444', purple: '#6366f1', green: '#22c55e',
  white: '#fff', gray: '#6b7280', lightGray: '#f3f4f6',
  border: '#e5e7eb', black: '#000', blue: '#3b82f6', orange: '#f97316',
};
var FILTERS = ['all', 'students', 'alumni', 'employers'];
var ROLE_BADGES = { student: { bg: C.blue, label: 'Student' }, alumni: { bg: C.purple, label: 'Alumni' }, employer: { bg: C.green, label: 'Employer' }, admin: { bg: C.primary, label: 'Admin' } };

export default function UserManagementScreen({ navigation }) {
  var [users, setUsers] = useState([]);
  var [loading, setLoading] = useState(true);
  var [filter, setFilter] = useState('all');
  var { logout } = useAuth();

  useEffect(function () { loadUsers(); }, []);

  // Load all users from the backend
  async function loadUsers() {
    try {
      setLoading(true);
      var response = await api.get('/admin/users');
      var data = response.data.data || response.data.users || response.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Load users error:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Filter users by role
  function getFiltered() {
    if (filter === 'all') return users;
    var roleMap = { students: 'student', alumni: 'alumni', employers: 'employer' };
    var role = roleMap[filter];
    return users.filter(function (u) { return u.role === role; });
  }

  // Block a user with confirmation
  function handleBlock(userId) {
    Alert.alert('Confirm Block', 'Are you sure you want to block this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block', style: 'destructive',
        onPress: async function () {
          try {
            await api.patch('/users/' + userId + '/deactivate');
            setUsers(users.map(function (u) {
              if (u.id === userId) return { ...u, isActive: false };
              return u;
            }));
            Alert.alert('Success', 'User blocked');
          } catch (e) { Alert.alert('Error', e.response?.data?.error || e.message); }
        },
      },
    ]);
  }

  // Unblock a user with confirmation
  function handleUnblock(userId) {
    Alert.alert('Confirm Unblock', 'Are you sure you want to unblock this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock',
        onPress: async function () {
          try {
            await api.patch('/admin/users/' + userId + '/activate');
            setUsers(users.map(function (u) {
              if (u.id === userId) return { ...u, isActive: true };
              return u;
            }));
            Alert.alert('Success', 'User unblocked successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to unblock user: ' + error.message);
          }
        },
      },
    ]);
  }

  function renderUser({ item }) {
    var roleBadge = ROLE_BADGES[item.role] || { bg: C.gray, label: item.role || 'Unknown' };
    var isActive = item.isActive !== false;

    return (
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.userName}>{item.name || item.email || 'Unknown'}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            <View style={[s.badge, { backgroundColor: roleBadge.bg }]}>
              <Text style={s.badgeText}>{roleBadge.label}</Text>
            </View>
            <View style={[s.badge, { backgroundColor: isActive ? C.green : C.primary }]}>
              <Text style={s.badgeText}>{isActive ? 'Active' : 'Blocked'}</Text>
            </View>
          </View>
        </View>
        {isActive ? (
          <TouchableOpacity style={s.blockBtn} onPress={function () { handleBlock(item.id); }}>
            <Text style={s.blockBtnText}>Block</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.blockBtn, { backgroundColor: C.green }]} onPress={function () { handleUnblock(item.id); }}>
            <Text style={s.blockBtnText}>Unblock</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  var filtered = getFiltered();

  return (
    <View style={s.container}>
      <Header title="User Management" navigation={navigation}
        role="admin" showLogout={true} onLogout={function () { logout(); }} />

      {/* Filter row */}
      <View style={s.filterRow}>
        {FILTERS.map(function (f) {
          var isActive = filter === f;
          return (
            <TouchableOpacity key={f} style={[s.filterBtn, isActive && s.filterBtnActive]}
              onPress={function () { setFilter(f); }}>
              <Text style={[s.filterText, isActive && s.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={s.centered}><ActivityIndicator size="large" color={C.primary} /></View>
        ) : filtered.length === 0 ? (
          <View style={s.centered}><Text style={{ fontSize: 16, color: C.gray }}>No users found.</Text></View>
        ) : (
          <FlatList data={filtered} keyExtractor={function (i, x) { return (i.id || '') + x; }}
            renderItem={renderUser} style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 }} />
        )}
      </View>
    </View>
  );
}

var s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', padding: 10, backgroundColor: '#f3f4f6' },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, margin: 4, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  filterBtnActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  filterText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  userName: { fontSize: 15, fontWeight: 'bold', color: '#000' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  blockBtn: { backgroundColor: '#f97316', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  blockBtnText: { color: '#fff', fontSize: 12, fontWeight: '500' },
});
