// BrowseScreen.js
// Shows opportunities list with cards, bookmark, view details, and apply.
// Includes a "Recommended for You" section at the top based on student profile.

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import Header from '../../components/Header';
import StudentMenuBar from '../../components/StudentMenuBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

var COLORS = {
  primary: '#6366f1', white: '#ffffff', gray: '#6b7280',
  lightGray: '#f3f4f6', border: '#e5e7eb', black: '#000000',
};

var TYPE_BADGES = {
  job: '#22c55e', internship: '#3b82f6', scholarship: '#f59e0b',
  freelance: '#f97316', event: '#6366f1',
};

export default function BrowseScreen({ navigation }) {
  var [opportunities, setOpportunities] = useState([]);
  var [loading, setLoading] = useState(true);
  var [recommended, setRecommended] = useState([]);
  var [loadingRecommended, setLoadingRecommended] = useState(true);
  var { logout } = useAuth();

  // Load opportunities and recommendations when the screen mounts
  useEffect(function () {
    loadOpportunities();
    loadRecommended();
  }, []);

  // Load all available opportunities from the backend API
  async function loadOpportunities() {
    try {
      setLoading(true);
      console.log('Loading opportunities...');
      console.log("Loading opportunities, calling /opportunities")

      var response = await api.get('/opportunities');

      // Backend wraps response in { success: true, data: [...] }
      var data = response.data.data ||
        response.data || [];

      console.log('Opportunities loaded:',
        Array.isArray(data) ? data.length : 0);

      if (Array.isArray(data)) {
        setOpportunities(data);
      } else {
        setOpportunities([]);
      }

    } catch (error) {
      console.log('Opportunities error:', error.message);
      console.log("Opportunities load failed:", error.message)
      console.log("Error status:", error.response?.status)
      console.log("Error code:", error.code)
      Alert.alert(
        'Error',
        'Failed to load opportunities: ' + error.message
      );
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }

  // Load recommended opportunities from the backend API
  async function loadRecommended() {
    try {
      setLoadingRecommended(true);
      var response = await api.get('/opportunities/recommended');
      var data = response.data.data || [];
      setRecommended(data);
    } catch (error) {
      console.log('Recommendations error:', error.message);
      setRecommended([]);
    } finally {
      setLoadingRecommended(false);
    }
  }

  function handleLogout() { logout(); }

  function handleViewDetails(opp) {
    Alert.alert(
      opp.title || 'Opportunity',
      'Type: ' + (opp.type || 'N/A') + '\n' +
      'Company: ' + (opp.company || opp.organization || 'N/A') + '\n' +
      'Location: ' + (opp.location || 'N/A') + '\n' +
      'Deadline: ' + (opp.deadline || 'N/A') + '\n\n' +
      (opp.description || 'No description available')
    );
  }

  function handleApply(opp) {
    navigation.navigate('Apply', { opportunity: opp });
  }

  async function handleBookmark(oppId) {
    try {
      await api.post('/saved', { opportunityId: oppId });
      Alert.alert('Saved!', 'Opportunity saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save opportunity');
    }
  }

  function getBadgeColor(type) {
    return TYPE_BADGES[(type || '').toLowerCase()] || COLORS.gray;
  }

  // Render a single recommended opportunity card (horizontal scroll)
  function renderRecommendedCard(opp) {
    return (
      <View key={'rec-' + opp.id} style={styles.recCard}>
        {/* Top row — type badge and match percentage */}
        <View style={styles.recTopRow}>
          <View style={[styles.badge, { backgroundColor: getBadgeColor(opp.type) }]}>
            <Text style={styles.badgeText}>{(opp.type || 'other').toUpperCase()}</Text>
          </View>
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>{opp.relevanceScore}% match</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.recTitle} numberOfLines={2}>{opp.title || 'Untitled'}</Text>

        {/* Location */}
        <Text style={styles.recLocation} numberOfLines={1}>
          📍 {opp.location || 'Not specified'}
        </Text>

        {/* Description — truncated */}
        <Text style={styles.recDesc} numberOfLines={2}>{opp.description || 'No description'}</Text>

        {/* Buttons */}
        <View style={styles.recActions}>
          <TouchableOpacity style={styles.recViewBtn}
            onPress={function () { handleViewDetails(opp); }}>
            <Text style={styles.recViewBtnText}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recApplyBtn}
            onPress={function () { handleApply(opp); }}>
            <Text style={styles.recApplyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render a single opportunity card in the main FlatList
  function renderCard({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={[styles.badge, { backgroundColor: getBadgeColor(item.type) }]}>
            <Text style={styles.badgeText}>{(item.type || 'other').toUpperCase()}</Text>
          </View>
          <TouchableOpacity onPress={function () { handleBookmark(item.id); }}>
            <Text style={styles.bookmarkIcon}>🔖</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cardTitle}>{item.title || 'Untitled'}</Text>
        <Text style={styles.cardCompany}>{item.company || item.organization || ''}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description || 'No description'}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.viewBtn}
            onPress={function () { handleViewDetails(item); }}>
            <Text style={styles.viewBtnText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn}
            onPress={function () { handleApply(item); }}>
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render the recommended section as a FlatList header
  function renderListHeader() {
    // Don't show if still loading or no recommendations
    if (loadingRecommended || recommended.length === 0) {
      return null;
    }

    return (
      <View style={styles.recSection}>
        {/* Section heading */}
        <Text style={styles.recHeading}>⭐ Recommended for You</Text>
        <Text style={styles.recSubheading}>Based on your degree and skills</Text>

        {/* Horizontal scrollable row of recommended cards */}
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.recScroll}
          contentContainerStyle={{ paddingRight: 10 }}
        >
          {recommended.map(function (opp) {
            return renderRecommendedCard(opp);
          })}
        </ScrollView>

        {/* Section divider */}
        <Text style={styles.allOppsHeading}>All Opportunities</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Browse Opportunities" navigation={navigation}
        role="student" showLogout={true} onLogout={handleLogout} />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : opportunities.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No opportunities available</Text>
          </View>
        ) : (
          <FlatList
            data={opportunities}
            keyExtractor={function (item) { return item.id || String(Math.random()); }}
            renderItem={renderCard}
            ListHeaderComponent={renderListHeader}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
            showsVerticalScrollIndicator={true}
          />
        )}
      </View>

      <StudentMenuBar activeScreen="Browse" navigation={navigation} />
    </View>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  content: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: COLORS.gray },

  // ===== RECOMMENDED SECTION =====
  recSection: {
    marginBottom: 10,
  },
  recHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 2,
  },
  recSubheading: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 10,
  },
  recScroll: {
    marginBottom: 14,
  },
  recCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
    width: 240,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  recTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  matchBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  recTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  recLocation: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  recDesc: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 16,
    marginBottom: 10,
  },
  recActions: {
    flexDirection: 'row',
  },
  recViewBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    marginRight: 4,
  },
  recViewBtnText: { color: COLORS.gray, fontSize: 12, fontWeight: '500' },
  recApplyBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    marginLeft: 4,
  },
  recApplyBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '500' },

  allOppsHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    marginTop: 4,
  },

  // ===== MAIN OPPORTUNITY CARDS =====
  card: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 15, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '600', color: COLORS.white },
  bookmarkIcon: { fontSize: 20 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.black, marginTop: 8 },
  cardCompany: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  cardDesc: { fontSize: 13, color: COLORS.gray, marginTop: 6, lineHeight: 18 },
  cardActions: { flexDirection: 'row', marginTop: 12 },
  viewBtn: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6,
    padding: 8, alignItems: 'center', marginRight: 5,
  },
  viewBtnText: { color: COLORS.gray, fontSize: 13, fontWeight: '500' },
  applyBtn: {
    flex: 1, backgroundColor: COLORS.primary, borderRadius: 6,
    padding: 8, alignItems: 'center', marginLeft: 5,
  },
  applyBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '500' },
});
