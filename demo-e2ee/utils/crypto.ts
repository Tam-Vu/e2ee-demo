import * as Crypto from 'expo-crypto';
import { secp256k1 } from '@noble/curves/secp256k1';
import { Buffer } from 'buffer/';

export interface KeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}

export interface EncryptedData {
  content: string;
  iv: string;
}

/**
 * Generate ECDH key pair using secp256k1 curve
 */
export async function generateKeyPair(): Promise<KeyPair> {
  // Generate 32-byte private key
  const privateKey = await Crypto.getRandomBytesAsync(32);

  // Derive public key from private key
  const publicKey = secp256k1.getPublicKey(privateKey);

  return {
    privateKey: new Uint8Array(privateKey),
    publicKey: new Uint8Array(publicKey),
  };
}

/**
 * Calculate shared secret using ECDH
 * Both parties will get the same shared secret
 */
export function calculateSharedSecret(
  myPrivateKey: Uint8Array,
  theirPublicKey: Uint8Array
): Uint8Array {
  const sharedSecret = secp256k1.getSharedSecret(myPrivateKey, theirPublicKey);
  // Remove the first byte (0x04 prefix for uncompressed public key)
  return new Uint8Array(sharedSecret.slice(1));
}

/**
 * AES-256-CTR Encryption using Web Crypto API
 */
export async function encryptMessage(
  message: string,
  sharedSecret: Uint8Array
): Promise<EncryptedData> {
  try {
    // Generate random IV (16 bytes)
    const iv = await Crypto.getRandomBytesAsync(16);

    // Convert message to Uint8Array
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);

    // Import shared secret as CryptoKey
    const key = await crypto.subtle.importKey(
      'raw',
      sharedSecret.slice(0, 32), // Use first 32 bytes for AES-256
      { name: 'AES-CTR' },
      false,
      ['encrypt']
    );

    // Encrypt
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-CTR',
        counter: new Uint8Array(iv),
        length: 128,
      },
      key,
      messageBytes
    );

    // Convert to base64
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const content = Buffer.from(encryptedArray).toString('base64');
    const ivString = Buffer.from(iv).toString('base64');

    return {
      content,
      iv: ivString,
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * AES-256-CTR Decryption using Web Crypto API
 */
export async function decryptMessage(
  encryptedData: EncryptedData,
  sharedSecret: Uint8Array
): Promise<string> {
  try {
    // Decode base64
    const encryptedBytes = Buffer.from(encryptedData.content, 'base64');
    const iv = Buffer.from(encryptedData.iv, 'base64');

    // Import shared secret as CryptoKey
    const key = await crypto.subtle.importKey(
      'raw',
      sharedSecret.slice(0, 32), // Use first 32 bytes for AES-256
      { name: 'AES-CTR' },
      false,
      ['decrypt']
    );

    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-CTR',
        counter: new Uint8Array(iv),
        length: 128,
      },
      key,
      encryptedBytes
    );

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Decryption failed]';
  }
}

/**
 * Helper to convert Uint8Array to hex string
 */
export function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex');
}

/**
 * Helper to convert hex string to Uint8Array
 */
export function fromHex(hex: string): Uint8Array {
  return new Uint8Array(Buffer.from(hex, 'hex'));
}
