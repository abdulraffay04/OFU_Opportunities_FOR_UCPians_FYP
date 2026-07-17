import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

var COLORS = {
  primary: '#6366f1',
  gray: '#9ca3af',
  activeGray: '#1f2937',
  border: '#f3f4f6',
  white: '#ffffff',
};

var MENU_ITEMS = [
  { label: 'Browse', screen: 'Browse', icon: 'home-outline', activeIcon: 'home' },
  { label: 'Saved', screen: 'Saved', icon: 'bookmark-outline', activeIcon: 'bookmark' },
  { label: 'Alumni', screen: 'Alumni', icon: 'people-outline', activeIcon: 'people' },
  { label: 'Resume', screen: 'Resume', icon: 'document-text-outline', activeIcon: 'document-text' },
  { label: 'Chat', screen: 'Chatbot', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses' },
  { label: 'Profile', screen: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export default function StudentMenuBar({ activeScreen, navigation }) {
  return (
    <View style={styles.container}>
      {MENU_ITEMS.map(function (item) {
        var isActive = activeScreen === item.screen;
        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={function () {
              if (!isActive) navigation.navigate(item.screen);
            }}
          >
            <Icon 
              name={isActive ? item.activeIcon : item.icon} 
              size={22} 
              color={isActive ? COLORS.primary : COLORS.gray} 
            />
            <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

var styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    paddingTop: 12,
    paddingBottom: 20, // Provides space for iPhone home indicators
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
  },
  menuLabel: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  }
});