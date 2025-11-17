#!/usr/bin/env tsx

/**
 * Generate Encryption Keys
 *
 * This script generates secure encryption keys for the ENCRYPTION_KEY and ENCRYPTION_IV
 * environment variables required for token encryption.
 *
 * Usage:
 *   pnpm dlx tsx scripts/generate-encryption-keys.ts
 */

import crypto from 'crypto';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

console.log('\n' + '='.repeat(60));
log('  Encryption Keys Generator', colors.cyan);
console.log('='.repeat(60) + '\n');

log('Generating secure encryption keys...\n', colors.yellow);

// Generate encryption key (32 bytes = 64 hex characters for AES-256)
const encryptionKey = crypto.randomBytes(32).toString('hex');

// Generate IV (16 bytes = 32 hex characters for AES-256-CBC)
const iv = crypto.randomBytes(16).toString('hex');

// Generate webhook verify token
const webhookToken = crypto.randomBytes(32).toString('hex');

log('✓ Keys generated successfully!\n', colors.green);

console.log('Add these to your .env file:\n');
console.log('# Security - Token Encryption');
log(`ENCRYPTION_KEY=${encryptionKey}`, colors.cyan);
log(`ENCRYPTION_IV=${iv}`, colors.cyan);
console.log();
console.log('# Webhook Configuration');
log(`WEBHOOK_VERIFY_TOKEN=${webhookToken}`, colors.cyan);
console.log();

log('\n⚠️  IMPORTANT: Keep these keys secret and never commit them to version control!', colors.yellow);
log('   These keys will be used to encrypt WhatsApp access tokens in the database.\n', colors.yellow);

console.log('='.repeat(60) + '\n');
