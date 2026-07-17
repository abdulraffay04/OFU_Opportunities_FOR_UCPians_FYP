// AnalyticsScreen.js
// Admin screen showing platform statistics.
// 2x2 metric cards grid + opportunity type bar chart.

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

var C = {
  primary: '#ef4444', green: '#22c55e', purple: '#6366f1',
  white: '#fff', gray: '#6b7280', lightGray: '#f3f4f6',
  border: '#e5e7eb', black: '#000', blue: '#3b82f6',
  yellow: '#f59e0b', orange: '#f97316',
};
var BAR_COLORS = { job: C.green, internship: C.blue, scholarship: C.yellow, freelance: C.orange, event: C.purple };

export default function AnalyticsScreen({ navigation }) {
  var [analytics, setAnalytics] = useState(null);
  var [loading, setLoading] = useState(true);
  var { logout } = useAuth();

  useEffect(function () { loadAnalytics(); }, []);

  // Load platform analytics data from the backend
  async function loadAnalytics() {
    try {
      setLoading(true);
      var response = await api.get('/admin/analytics');
      var data = response.data.data || response.data || {};
      setAnalytics(data);
    } catch (error) {
      console.log('Load analytics error:', error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={s.container}>
        <Header title="Platform Analytics" navigation={navigation}
          role="admin" showLogout={true} onLogout={function () { logout(); }} />
        <View style={s.centered}><ActivityIndicator size="large" color={C.primary} /></View>
      </View>
    );
  }

  // Safely get values
  var data = analytics || {};
  var students = data.totalStudents || data.students || 0;
  var alumni = data.totalAlumni || data.alumni || 0;
  var opps = data.totalOpportunities || data.opportunities || 0;
  var pending = data.pendingApproval || data.pending || 0;
  var byType = data.opportunitiesByType || data.byType || {};

  // Calculate max for proportional bars
  var counts = Object.values(byType);
  var maxCount = counts.length > 0 ? Math.max.apply(null, counts) : 1;

  return (
    <View style={s.container}>
      <Header title="Platform Analytics" navigation={navigation}
        role="admin" showLogout={true} onLogout={function () { logout(); }} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={true}>

        {/* 2x2 Metric Cards */}
        <View style={s.grid}>
          <View style={s.metricCard}>
            <Text style={[s.metricNum, { color: C.blue }]}>{students}</Text>
            <Text style={s.metricLabel}>Total Students</Text>
          </View>
          <View style={s.metricCard}>
            <Text style={[s.metricNum, { color: C.purple }]}>{alumni}</Text>
            <Text style={s.metricLabel}>Total Alumni</Text>
          </View>
          <View style={s.metricCard}>
            <Text style={[s.metricNum, { color: C.green }]}>{opps}</Text>
            <Text style={s.metricLabel}>Total Opportunities</Text>
          </View>
          <View style={s.metricCard}>
            <Text style={[s.metricNum, { color: C.orange }]}>{pending}</Text>
            <Text style={s.metricLabel}>Pending Approval</Text>
          </View>
        </View>

        {/* Bar Chart */}
        <Text style={s.sectionTitle}>Opportunities by Type</Text>
        {Object.keys(byType).length > 0 ? Object.keys(byType).map(function (type) {
          var count = byType[type] || 0;
          var barColor = BAR_COLORS[type.toLowerCase()] || C.gray;
          var widthPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <View key={type} style={s.barRow}>
              <Text style={s.barLabel}>{type}</Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: widthPercent + '%', backgroundColor: barColor }]} />
              </View>
              <Text style={s.barCount}>{count}</Text>
            </View>
          );
        }) : (
          <Text style={{ color: C.gray, textAlign: 'center', marginTop: 10 }}>No data available</Text>
        )}
      </ScrollView>
    </View>
  );
}

var s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  metricCard: {
    width: '47%', margin: '1.5%', backgroundColor: '#fff', borderRadius: 12,
    padding: 15, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center',
  },
  metricNum: { fontSize: 32, fontWeight: 'bold' },
  metricLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', marginTop: 20, marginBottom: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barLabel: { width: 80, fontSize: 13, color: '#000' },
  barTrack: { flex: 1, height: 20, backgroundColor: '#f3f4f6', borderRadius: 10, marginHorizontal: 10, overflow: 'hidden' },
  barFill: { height: 20, borderRadius: 10 },
  barCount: { width: 30, fontSize: 13, color: '#000', textAlign: 'right' },
});
