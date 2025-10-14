import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import io, { Socket } from 'socket.io-client';
import { generateKeyPair, encryptMessage, decryptMessage, KeyPair } from '@/utils/crypto';

const SERVER_URL = 'http://192.168.2.37:3000';

interface User {
  username: string;
  publicKey: string;
  socketId: string;
  isMonitor?: boolean;
}

interface Message {
  id: string;
  text: string;
  from: string;
  timestamp: number;
  isMe: boolean;
  isIntercepted?: boolean;
  fromUsername?: string;
  toUsername?: string;
  encryptedData?: string;
}

export default function E2EEChatScreen() {
  const [username, setUsername] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isMonitorMode, setIsMonitorMode] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [myKeys, setMyKeys] = useState<KeyPair | null>(null);
  
  // Use ref to avoid closure issues with socket event handlers
  const myKeysRef = useRef<KeyPair | null>(null);

  useEffect(() => {
    myKeysRef.current = myKeys;
  }, [myKeys]);

  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  const register = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    try {
      const keys = await generateKeyPair();
      setMyKeys(keys);

      const newSocket = io(SERVER_URL);

      newSocket.on('connect', () => {
        newSocket.emit('register', {
          username: username.trim(),
          publicKey: keys.publicKey,
          isMonitor: isMonitorMode,
        });
        setIsRegistered(true);
      });

      newSocket.on('users', (userList: User[]) => {
        setUsers(userList.filter((u) => u.socketId !== newSocket.id && !u.isMonitor));
      });

      newSocket.on('message', async ({ from, fromUsername, encryptedMessage, iv, timestamp }) => {
        const keys = myKeysRef.current;
        if (keys) {
          const decrypted = decryptMessage(encryptedMessage, keys.privateKey, iv);
          console.log('Received message:', { from, fromUsername, decrypted });
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + Math.random(),
              text: decrypted,
              from,
              fromUsername,
              timestamp,
              isMe: false,
            },
          ]);
        } else {
          console.log('No keys available to decrypt message');
        }
      });

      // Hacker/Monitor mode - intercept messages
      newSocket.on('intercepted', ({ fromUsername, toUsername, encryptedMessage, iv, timestamp, note }) => {
        console.log('Intercepted message:', { fromUsername, toUsername, encryptedMessage, iv });
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + Math.random(),
            text: note,
            from: 'intercepted',
            fromUsername,
            toUsername,
            timestamp,
            isMe: false,
            isIntercepted: true,
            encryptedData: encryptedMessage, // Show full encrypted message
          },
        ]);
      });

      newSocket.on('connect_error', () => {
        Alert.alert('Connection Error', 'Could not connect to server');
      });

      setSocket(newSocket);
    } catch (error) {
      Alert.alert('Error', 'Failed to register');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedUser || !myKeys || !socket) return;

    try {
      const { encrypted, iv } = await encryptMessage(message.trim(), selectedUser.publicKey);

      console.log('Sending message:', { 
        to: selectedUser.socketId, 
        toUsername: selectedUser.username,
        originalMessage: message.trim() 
      });

      socket.emit('message', {
        to: selectedUser.socketId,
        encryptedMessage: encrypted,
        iv,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          text: message.trim(),
          from: 'me',
          timestamp: Date.now(),
          isMe: true,
        },
      ]);

      setMessage('');
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  if (!isRegistered) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          E2EE Chat Demo
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {isMonitorMode ? '🔍 Monitor Mode - See encrypted traffic' : 'Enter your username to start'}
        </ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />
        <TouchableOpacity 
          style={[styles.monitorToggle, isMonitorMode && styles.monitorToggleActive]} 
          onPress={() => setIsMonitorMode(!isMonitorMode)}
        >
          <ThemedText style={styles.monitorToggleText}>
            {isMonitorMode ? '🔓 Monitor Mode (Hacker)' : '🔒 Normal User'}
          </ThemedText>
          <ThemedText style={styles.monitorHint}>
            {isMonitorMode 
              ? 'You will see encrypted messages but cannot decrypt them' 
              : 'Tap to enable monitor/hacker mode'}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={register}>
          <ThemedText style={styles.buttonText}>Join Chat</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Monitor/Hacker mode - just show intercepted messages
  if (isMonitorMode) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">🔍 Monitor Mode - Intercepting Traffic</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.statsContainer}>
          <ThemedText style={styles.statsText}>
            📊 Intercepted: {messages.length} message{messages.length !== 1 ? 's' : ''}
          </ThemedText>
        </ThemedView>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.interceptedContainer}>
              <ThemedText style={styles.interceptedHeader}>
                📡 {item.fromUsername} → {item.toUsername}
              </ThemedText>
              <ThemedText style={styles.interceptedTime}>
                {new Date(item.timestamp).toLocaleTimeString()}
              </ThemedText>
              <View style={styles.encryptedDataContainer}>
                <ThemedText style={styles.interceptedLabel}>Encrypted Message (Full):</ThemedText>
                <View style={styles.scrollableEncrypted}>
                  <ThemedText style={styles.interceptedEncrypted} selectable>
                    {item.encryptedData}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.interceptedNote}>{item.text}</ThemedText>
            </View>
          )}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                👀 Waiting to intercept messages...
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                All encrypted traffic between users will appear here
              </ThemedText>
            </View>
          }
        />
      </KeyboardAvoidingView>
    );
  }

  if (!selectedUser) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Select a User
        </ThemedText>
        <FlatList
          data={users}
          keyExtractor={(item) => item.socketId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => {
                setSelectedUser(item);
                setMessages([]);
              }}
            >
              <ThemedText style={styles.username}>{item.username}</ThemedText>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>No users online</ThemedText>
          }
        />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedUser(null)}>
          <ThemedText style={styles.backButton}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.chatUsername}>{selectedUser?.username || 'Chat'}</ThemedText>
      </ThemedView>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.isMe ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <ThemedText style={[
              styles.messageText,
              item.isMe ? styles.myMessageText : styles.theirMessageText
            ]}>
              {item.text}
            </ThemedText>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
      />

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <ThemedText style={styles.sendButtonText}>Send</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#000000',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  username: {
    fontSize: 18,
    color: '#000000',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 10,
    color: '#999999',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 15,
    backgroundColor: '#FFFFFF',
  },
  statsContainer: {
    padding: 12,
    backgroundColor: '#e8f4f8',
    borderBottomWidth: 1,
    borderBottomColor: '#b3d9e8',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
    textAlign: 'center',
  },
  backButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  chatUsername: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1565C0',
  },
  messagesList: {
    paddingVertical: 20,
    backgroundColor: '#F5F5F5',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9E9EB',
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  monitorToggle: {
    borderWidth: 2,
    borderColor: '#FF9500',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#FFFAF0',
  },
  monitorToggleActive: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF0F0',
  },
  monitorToggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#000000',
  },
  monitorHint: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666666',
  },
  interceptedContainer: {
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
    borderColor: '#FF3B30',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  interceptedHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FF3B30',
  },
  interceptedTime: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 8,
  },
  encryptedDataContainer: {
    marginVertical: 8,
  },
  interceptedLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  scrollableEncrypted: {
    maxHeight: 150,
    backgroundColor: '#1E1E1E',
    borderRadius: 6,
    padding: 10,
  },
  interceptedEncrypted: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#00FF00',
    lineHeight: 16,
  },
  interceptedNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666666',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFD0D0',
  },
});
