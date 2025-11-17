#!/usr/bin/env tsx
/**
 * Update .env file with verified WhatsApp credentials
 */

import * as fs from 'fs';
import * as path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// New verified values
const NEW_VALUES = {
  WHATSAPP_BUSINESS_ACCOUNT_ID: '1355735762746905',
  WHATSAPP_PHONE_NUMBER_ID: '831563980046780',
};

async function updateEnvFile() {
  log('\n🔧 Updating .env file with verified WhatsApp credentials', colors.bright);
  log('═'.repeat(60), colors.blue);

  const envPath = path.join(process.cwd(), '.env');
  const backupPath = path.join(process.cwd(), '.env.backup');

  try {
    // Check if .env exists
    if (!fs.existsSync(envPath)) {
      log('\n❌ .env file not found!', colors.red);
      process.exit(1);
    }

    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    // Create backup
    fs.copyFileSync(envPath, backupPath);
    log('\n✅ Backup created: .env.backup', colors.green);

    log('\n📝 Updating values:', colors.blue);

    // Update each value
    for (const [key, value] of Object.entries(NEW_VALUES)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      
      if (regex.test(envContent)) {
        // Update existing value
        const oldMatch = envContent.match(regex);
        const oldValue = oldMatch ? oldMatch[0].split('=')[1] : 'not set';
        envContent = envContent.replace(regex, `${key}=${value}`);
        log(`   ✓ ${key}`, colors.green);
        log(`     Old: ${oldValue}`, colors.yellow);
        log(`     New: ${value}`, colors.green);
      } else {
        // Add new value
        envContent += `\n${key}=${value}`;
        log(`   + ${key}=${value} (added)`, colors.green);
      }
    }

    // Write updated content
    fs.writeFileSync(envPath, envContent);

    log('\n✅ .env file updated successfully!', colors.green);
    log('═'.repeat(60), colors.green);

    log('\n📋 Updated Values:', colors.blue);
    log(`   WHATSAPP_BUSINESS_ACCOUNT_ID: ${NEW_VALUES.WHATSAPP_BUSINESS_ACCOUNT_ID}`);
    log(`   WHATSAPP_PHONE_NUMBER_ID: ${NEW_VALUES.WHATSAPP_PHONE_NUMBER_ID}`);

    log('\n💡 Note:', colors.yellow);
    log('   A backup of your old .env file was saved as .env.backup');
    log('   You can restore it if needed by running: cp .env.backup .env');

  } catch (error: any) {
    log('\n❌ Error updating .env file', colors.red);
    log(`   ${error.message}`, colors.red);
    
    // Restore backup if it exists
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, envPath);
      log('\n↩️  Restored from backup', colors.yellow);
    }
    
    process.exit(1);
  }
}

updateEnvFile().catch((error) => {
  log(`\n❌ Unexpected Error: ${error.message}`, colors.red);
  process.exit(1);
});

