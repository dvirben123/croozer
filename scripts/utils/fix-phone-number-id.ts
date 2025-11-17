#!/usr/bin/env tsx
/**
 * Fix Phone Number ID in .env
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

async function fixEnv() {
  log('\n🔧 Fixing WHATSAPP_PHONE_NUMBER_ID in .env', colors.bright);
  log('═'.repeat(60), colors.blue);

  const envPath = path.join(process.cwd(), '.env');
  const CORRECT_PHONE_NUMBER_ID = '789427540931519';

  try {
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    const regex = /^WHATSAPP_PHONE_NUMBER_ID=.*$/m;
    
    if (regex.test(envContent)) {
      const oldMatch = envContent.match(regex);
      const oldValue = oldMatch ? oldMatch[0].split('=')[1] : 'not set';
      
      envContent = envContent.replace(regex, `WHATSAPP_PHONE_NUMBER_ID=${CORRECT_PHONE_NUMBER_ID}`);
      
      fs.writeFileSync(envPath, envContent);
      
      log('\n✅ Updated .env file', colors.green);
      log(`   Old: ${oldValue}`, colors.red);
      log(`   New: ${CORRECT_PHONE_NUMBER_ID}`, colors.green);
    } else {
      log('\n❌ WHATSAPP_PHONE_NUMBER_ID not found in .env', colors.red);
    }

    log('\n📋 Correct Values:', colors.blue);
    log(`   WHATSAPP_PHONE_NUMBER_ID=${CORRECT_PHONE_NUMBER_ID}`);
    log(`   WHATSAPP_BUSINESS_ACCOUNT_ID=1980175552606363 (from Meta console)`);

  } catch (error: any) {
    log('\n❌ Error:', colors.red);
    log(`   ${error.message}`, colors.red);
    process.exit(1);
  }
}

fixEnv().catch((error) => {
  log(`\n❌ Unexpected Error: ${error.message}`, colors.red);
  process.exit(1);
});

