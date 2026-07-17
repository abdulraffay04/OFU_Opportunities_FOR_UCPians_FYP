import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={styles.text}>Loading</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    marginTop: 16,
    fontSize: 13,
    color: '#9ca3af', // Using your professional slate-gray
    fontWeight: '600',
    textTransform: 'uppercase', // Matches the menu styling
    letterSpacing: 1, // High-end feel
  },
});