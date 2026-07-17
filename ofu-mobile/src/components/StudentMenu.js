// StudentMenu.js
// Reusable horizontal navigation menu for student screens.
// Shows tabs for Browse, Saved, Alumni, Resume, Chatbot, Profile.
// The active tab has purple text and a purple bottom border.

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

var COLORS = {
  primary: '#6366f1',
  white: '#ffffff',
  gray: '#9ca3af',
  darkGray: '#374151',
  border: '#f3f4f6',
};

var MENU_ITEMS = [
  { label: 'Browse', screen: 'Browse' },
  { label: 'Saved', screen: 'Saved' },
  { label: 'Alumni', screen: 'Alumni' },
  { label: 'Resume', screen: 'Resume' },
  { label: 'Chatbot', screen: 'Chatbot' },
  { label: 'Profile', screen: 'Profile' },
];

export default function StudentMenu({ activeScreen, navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MENU_ITEMS.map(function (item) {
          var isActive = activeScreen === item.screen;
          return (
            <TouchableOpacity
              key={item.screen}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={function () {
                if (!isActive) navigation.navigate(item.screen);
              }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {item.label}
              </Text>
              {/* Subtle underline indicator looks more professional than full borders */}
              {isActive && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

var styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600', // Slightly bolder for better readability
    color: COLORS.gray,
    textTransform: 'uppercase', // Professional dashboard standard
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: '60%', // Centered short indicator is more modern
    height: 3,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});