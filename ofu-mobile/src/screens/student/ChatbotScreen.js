// ChatbotScreen.js
// This screen lets students chat with the UCP AI Career Mentor on mobile.
// Messages are sent to the Node.js backend which forwards them to the Python chatbot.

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Header from '../../components/Header';
import StudentMenuBar from '../../components/StudentMenuBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Color constants
var COLORS = {
  primary: '#6366f1',
  white: '#fff',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  border: '#e5e7eb',
  black: '#111827',
};

export default function ChatbotScreen({ navigation }) {
  // Chat state
  var [messages, setMessages] = useState([]);
  var [inputText, setInputText] = useState('');
  var [loading, setLoading] = useState(false);
  var { logout } = useAuth();

  // Reference for the FlatList to scroll to bottom
  var flatListRef = useRef(null);

  // Show welcome message when screen loads
  useEffect(function () {
    setMessages([
      {
        id: '1',
        text:
          'Hello! I am your UCP AI Career Mentor. ' +
          'Ask me about internships, scholarships, ' +
          'or career guidance.',
        sender: 'bot',
      },
    ]);
  }, []);

  // Send a message to the chatbot
  async function handleSend() {
    // Don't send empty messages
    if (!inputText.trim() || loading) {
      return;
    }

    var userMessage = inputText.trim();
    setInputText('');

    // Add the user's message to the chat
    var userMsg = {
      id: String(Date.now()),
      text: userMessage,
      sender: 'user',
    };

    setMessages(function (prev) {
      return prev.concat([userMsg]);
    });

    setLoading(true);

    try {
      // Send message to the Node.js backend
      var response = await api.post('/ai/chat', {
        message: userMessage,
      });

      // Get the bot's response
      var botText = response.data.data.response || 'I received your message.';

      // Add bot response to the chat
      var botMsg = {
        id: String(Date.now() + 1),
        text: botText,
        sender: 'bot',
      };

      setMessages(function (prev) {
        return prev.concat([botMsg]);
      });
    } catch (err) {
      // Show friendly error if chatbot is not available
      console.log('Chat error:', err.message);

      var errorMsg = {
        id: String(Date.now() + 1),
        text: 'Sorry, I am having trouble right now. Please try again.',
        sender: 'bot',
      };

      setMessages(function (prev) {
        return prev.concat([errorMsg]);
      });
    }

    setLoading(false);
  }

  // Handle pressing the mic button
  function handleMicPress() {
    Alert.alert("Coming Soon", "Voice input will be available in a future update. For now please type your question.");
  }

  // Render a single chat message bubble
  function renderMessage({ item }) {
    var isUser = item.sender === 'user';

    return (
      <View style={[styles.messageRow, isUser ? styles.messageRight : styles.messageLeft]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser ? { color: COLORS.white } : { color: COLORS.black }]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="AI Career Mentor"
        navigation={navigation}
        role="student"
        showLogout={true}
        onLogout={function () { logout(); }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Chat messages list */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={function (item) { return item.id; }}
          renderItem={renderMessage}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12 }}
          onContentSizeChange={function () {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          }}
        />

        {/* Input area */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type your question..."
            placeholderTextColor={COLORS.gray}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.micButton}
            onPress={handleMicPress}
          >
            <Text style={{ fontSize: 18 }}>🎤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendButton, loading ? { opacity: 0.6 } : null]}
            onPress={handleSend}
            disabled={loading}
          >
            <Text style={styles.sendButtonText}>
              {loading ? '...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <StudentMenuBar activeScreen="Chatbot" navigation={navigation} />
    </View>
  );
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Message layout
  messageRow: {
    marginBottom: 8,
  },
  messageRight: {
    alignItems: 'flex-end',
  },
  messageLeft: {
    alignItems: 'flex-start',
  },
  // Chat bubbles
  bubble: {
    maxWidth: '80%',
    borderRadius: 12,
    padding: 12,
    margin: 4,
  },
  bubbleUser: {
    backgroundColor: '#6366f1',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Input area
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  micButton: {
    marginLeft: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#6366f1',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
