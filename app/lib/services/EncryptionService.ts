/**
 * Encryption Service
 *
 * Handles encryption and decryption of sensitive data (WhatsApp access tokens, etc.)
 * Uses AES-256-CBC encryption with environment-configured keys
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

export class EncryptionService {
  private static encryptionKey: Buffer | null = null;
  private static iv: Buffer | null = null;

  /**
   * Initialize encryption keys from environment variables
   */
  private static initializeKeys() {
    if (this.encryptionKey && this.iv) {
      return; // Already initialized
    }

    const keyHex = process.env.ENCRYPTION_KEY;
    const ivHex = process.env.ENCRYPTION_IV;

    if (!keyHex || !ivHex) {
      throw new Error(
        'Encryption keys not configured. Set ENCRYPTION_KEY and ENCRYPTION_IV in .env file.\n' +
          'Generate keys with:\n' +
          '  openssl rand -hex 32  # for ENCRYPTION_KEY\n' +
          '  openssl rand -hex 16  # for ENCRYPTION_IV'
      );
    }

    // Validate key length (should be 64 hex characters = 32 bytes)
    if (keyHex.length !== 64) {
      throw new Error(`ENCRYPTION_KEY must be 64 hex characters (32 bytes), got ${keyHex.length}`);
    }

    // Validate IV length (should be 32 hex characters = 16 bytes)
    if (ivHex.length !== 32) {
      throw new Error(`ENCRYPTION_IV must be 32 hex characters (16 bytes), got ${ivHex.length}`);
    }

    try {
      this.encryptionKey = Buffer.from(keyHex, 'hex');
      this.iv = Buffer.from(ivHex, 'hex');
    } catch (error) {
      throw new Error('Invalid encryption keys. Ensure ENCRYPTION_KEY and ENCRYPTION_IV are valid hex strings.');
    }
  }

  /**
   * Encrypt a string value
   * @param plaintext - The string to encrypt
   * @returns Encrypted string in hex format
   */
  static encrypt(plaintext: string): string {
    if (!plaintext) {
      throw new Error('Cannot encrypt empty value');
    }

    this.initializeKeys();

    try {
      const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey!, this.iv!);
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error: any) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt an encrypted string
   * @param encryptedHex - The encrypted string in hex format
   * @returns Decrypted plaintext string
   */
  static decrypt(encryptedHex: string): string {
    if (!encryptedHex) {
      throw new Error('Cannot decrypt empty value');
    }

    this.initializeKeys();

    try {
      const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey!, this.iv!);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error: any) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate a random encryption key
   * @returns Hex string suitable for ENCRYPTION_KEY
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a random IV
   * @returns Hex string suitable for ENCRYPTION_IV
   */
  static generateIV(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Validate that encryption keys are properly configured
   * @returns true if keys are valid, throws error otherwise
   */
  static validateConfiguration(): boolean {
    try {
      this.initializeKeys();
      return true;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Test encryption/decryption with a sample value
   * @returns true if encryption roundtrip works correctly
   */
  static test(): boolean {
    const testValue = 'test_encryption_' + Date.now();

    try {
      const encrypted = this.encrypt(testValue);
      const decrypted = this.decrypt(encrypted);

      if (decrypted !== testValue) {
        throw new Error('Encryption test failed: decrypted value does not match original');
      }

      return true;
    } catch (error: any) {
      throw new Error(`Encryption test failed: ${error.message}`);
    }
  }
}

// Named exports for convenience
export const { encrypt, decrypt, generateKey, generateIV, validateConfiguration, test } = EncryptionService;
