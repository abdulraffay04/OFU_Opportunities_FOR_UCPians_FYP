// MyPostsScreen.js
// Shows opportunities posted by the current employer/alumni.
// Each card shows title, status badge, and applicant count.

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

var C = {
  primary: '#22c55e', white: '#fff', gray: '#6b7280',
  lightGray: '#f3f4f6', border: '#e5e7eb', black: '#000',
  blue: '#3b82f6', yellow: '#f59e0b', error: '#ef4444',
};

export default function MyPostsScreen({ navigation }) {
  var [posts, setPosts] = useState([]);
  var [loading, setLoading] = useState(true);
  var { logout } = useAuth();

  useEffect(function () { loadMyPosts(); }, []);

  // Load all opportunities posted by this employer
  async function loadMyPosts() {
    try {
      setLoading(true);
      var response = await api.get('/opportunities/my');
      var data = response.data.data || response.data.opportunities || response.data || [];
      console.log("My opportunities with applicant counts (mobile):", data);
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Load posts error:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Get status badge style
  function getStatus(status) {
    if (status === 'approved') return { label: 'Active', bg: C.primary };
    if (status === 'pending') return { label: 'Pending', bg: C.yellow };
    if (status === 'rejected') return { label: 'Rejected', bg: C.error };
    if (status === 'closed') return { label: 'Closed', bg: C.gray };
    return { label: status || 'Unknown', bg: C.gray };
  }

  function renderCard({ item }) {
    var status = getStatus(item.status);
    var count = item.applicantCount || item.applicationCount || 0;

    return (
      <View style={s.card}>
        <View style={s.cardRow}>
          {/* Left: title + status */}
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{item.title || 'Untitled'}</Text>
            <View style={[s.badge, { backgroundColor: status.bg, marginTop: 6 }]}>
              <Text style={s.badgeText}>{status.label}</Text>
            </View>
          </View>
          {/* Right: applicant count */}
          <View style={s.countBox}>
            <Text style={s.countNumber}>{count}</Text>
            <Text style={s.countLabel}>Applicants</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Header title="My Posted Opportunities" navigation={navigation}
        role="employer" showLogout={true} onLogout={function () { logout(); }} />

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={s.centered}><ActivityIndicator size="large" color={C.primary} /></View>
        ) : posts.length === 0 ? (
          <View style={s.centered}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: C.black }}>
              No opportunities posted yet.
            </Text>
            <Text style={{ fontSize: 13, color: C.gray, marginTop: 6, textAlign: 'center' }}>
              Tap Post Opportunity to get started.
            </Text>
          </View>
        ) : (
          <FlatList data={posts} keyExtractor={function (i, x) { return (i.id || '') + x; }}
            renderItem={renderCard} style={{ flex: 1 }}
            contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
            showsVerticalScrollIndicator={true} />
        )}
      </View>
    </View>
  );
}

var s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  countBox: { alignItems: 'center', marginLeft: 12 },
  countNumber: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6' },
  countLabel: { fontSize: 12, color: '#6b7280' },
});
