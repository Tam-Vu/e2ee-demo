import * as Crypto from 'expo-crypto';

export interface KeyPair {
  privateKey: string;
  publicKey: string;
}

// Generate a random key pair (simplified for demo)
export async function generateKeyPair(): Promise<KeyPair> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const keyString = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return {
    privateKey: keyString,
    publicKey: keyString, // In a real app, use different keys
  };
}

// Simple XOR encryption for demo purposes
export async function encryptMessage(message: string, key: string): Promise<{ encrypted: string; iv: string }> {
  const iv = await Crypto.getRandomBytesAsync(16);
  const ivString = Array.from(iv)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  let encrypted = '';
  for (let i = 0; i < message.length; i++) {
    const charCode = message.charCodeAt(i);
    const keyCode = key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(charCode ^ keyCode);
  }
  
  const base64Encrypted = btoa(encrypted);
  
  return {
    encrypted: base64Encrypted,
    iv: ivString,
  };
}

// Simple XOR decryption for demo purposes
export function decryptMessage(encryptedMessage: string, key: string, iv: string): string {
  try {
    const encrypted = atob(encryptedMessage);
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i);
      const keyCode = key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode ^ keyCode);
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Decryption failed]';
  }
}
