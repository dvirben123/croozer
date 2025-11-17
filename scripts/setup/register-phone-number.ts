#!/usr/bin/env tsx
/**
 * Register WhatsApp Business Phone Number
 * 
 * This script registers a phone number with WhatsApp Cloud API
 * and enables two-step verification.
 */

import 'dotenv/config';

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

async function registerPhoneNumber() {
  log('\n🚀 WhatsApp Phone Number Registration', colors.bright);
  log('═'.repeat(60), colors.blue);

  // Configuration
  const PHONE_NUMBER_ID = '831563980046780';
  const PHONE_NUMBER = '+972 535331770';
  const PIN = '147258';
  const DATA_LOCALIZATION_REGION = 'AE'; // United Arab Emirates (closest to Israel in MEA region)
  const ACCESS_TOKEN = process.env.META_SYSTEM_USER_ACCESS_TOKEN;

  // Validate environment variables
  if (!ACCESS_TOKEN) {
    log('\n❌ ERROR: META_SYSTEM_USER_ACCESS_TOKEN not found in .env', colors.red);
    log('Please ensure your .env file contains the access token.', colors.yellow);
    process.exit(1);
  }

  log('\n📋 Registration Details:', colors.blue);
  log(`   Phone Number: ${PHONE_NUMBER}`);
  log(`   Phone Number ID: ${PHONE_NUMBER_ID}`);
  log(`   PIN: ${'*'.repeat(PIN.length)} (${PIN.length} digits)`);
  log(`   API Version: v20.0 (registration endpoint)`);

  // Prepare request - Using v20.0 as registration endpoint is deprecated in v21.0+
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/register`;
  const body = {
    messaging_product: 'whatsapp',
    pin: PIN,
  };

  log('\n🔄 Sending registration request...', colors.yellow);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      log('\n❌ Registration Failed', colors.red);
      log('═'.repeat(60), colors.red);
      
      if (data.error) {
        log(`\nError Code: ${data.error.code}`, colors.red);
        log(`Error Type: ${data.error.type}`, colors.red);
        log(`Message: ${data.error.message}`, colors.red);
        
        if (data.error.error_subcode) {
          log(`Subcode: ${data.error.error_subcode}`, colors.red);
        }

        // Provide helpful error messages
        if (data.error.code === 133016) {
          log('\n⚠️  Rate Limit Exceeded:', colors.yellow);
          log('   You have made 10 registration requests in the last 72 hours.', colors.yellow);
          log('   Please wait before trying again.', colors.yellow);
        } else if (data.error.code === 190) {
          log('\n⚠️  Access Token Issue:', colors.yellow);
          log('   Your access token may be invalid or expired.', colors.yellow);
          log('   Please regenerate your META_SYSTEM_USER_ACCESS_TOKEN.', colors.yellow);
        } else if (data.error.message.includes('PIN')) {
          log('\n⚠️  PIN Issue:', colors.yellow);
          log('   The PIN may be incorrect or the number may already have 2FA enabled.', colors.yellow);
        }
      }

      log('\n📄 Full Response:', colors.yellow);
      console.log(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    // Success!
    log('\n✅ Registration Successful!', colors.green);
    log('═'.repeat(60), colors.green);
    
    log('\n📱 Your phone number is now registered with WhatsApp Cloud API', colors.green);
    log(`   Phone: ${PHONE_NUMBER}`, colors.green);
    log(`   Two-Step Verification: Enabled`, colors.green);
    log(`   PIN: 147258 (keep this safe!)`, colors.green);

    log('\n📄 API Response:', colors.blue);
    console.log(JSON.stringify(data, null, 2));

    log('\n🎉 Next Steps:', colors.bright);
    log('   1. Your phone number can now send messages via Cloud API');
    log('   2. Keep your 6-digit PIN (147258) safe - you\'ll need it for 2FA');
    log('   3. Test sending a message from the dashboard');
    log('   4. Configure webhooks to receive messages');

    log('\n⚠️  Important Notes:', colors.yellow);
    log('   • You can only make 10 registration requests per 72 hours');
    log('   • Keep your PIN secure - it protects your WhatsApp account');
    log('   • Check WhatsApp Manager to confirm status changed from Pending');

  } catch (error: any) {
    log('\n❌ Request Failed', colors.red);
    log('═'.repeat(60), colors.red);
    log(`\nError: ${error.message}`, colors.red);
    
    if (error.cause) {
      log(`Cause: ${error.cause}`, colors.red);
    }

    log('\n💡 Troubleshooting:', colors.yellow);
    log('   1. Check your internet connection');
    log('   2. Verify META_SYSTEM_USER_ACCESS_TOKEN in .env');
    log('   3. Ensure the token has required permissions:');
    log('      - whatsapp_business_management');
    log('      - whatsapp_business_messaging');
    
    process.exit(1);
  }
}

// Run the registration
registerPhoneNumber().catch((error) => {
  log(`\n❌ Unexpected Error: ${error.message}`, colors.red);
  process.exit(1);
});

