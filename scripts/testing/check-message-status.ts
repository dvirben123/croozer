#!/usr/bin/env tsx
/**
 * Check if recipient is registered as a test number
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

async function checkTestNumbers() {
  log('\n🔍 Checking WhatsApp Test Numbers', colors.bright);
  log('═'.repeat(60), colors.blue);

  const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '1355735762746905';
  const ACCESS_TOKEN = process.env.META_SYSTEM_USER_ACCESS_TOKEN;

  if (!ACCESS_TOKEN) {
    log('\n❌ ERROR: META_SYSTEM_USER_ACCESS_TOKEN not found', colors.red);
    process.exit(1);
  }

  log('\n🔄 Fetching registered test numbers...', colors.yellow);

  try {
    // Check phone number details
    const phoneUrl = `https://graph.facebook.com/v24.0/831563980046780?fields=id,display_phone_number,verified_name,code_verification_status,quality_rating`;
    const phoneResponse = await fetch(phoneUrl, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    });
    const phoneData = await phoneResponse.json();

    log('\n📱 Your WhatsApp Business Number:', colors.blue);
    log(`   Number: ${phoneData.display_phone_number || 'N/A'}`, colors.green);
    log(`   Name: ${phoneData.verified_name || 'N/A'}`, colors.green);
    log(`   Status: ${phoneData.code_verification_status || 'N/A'}`, colors.green);

    // Try to get message templates
    const templatesUrl = `https://graph.facebook.com/v24.0/${WABA_ID}/message_templates?fields=name,status`;
    const templatesResponse = await fetch(templatesUrl, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    });
    const templatesData = await templatesResponse.json();

    if (templatesData.data) {
      log('\n📋 Available Templates:', colors.blue);
      templatesData.data.forEach((template: any) => {
        const statusIcon = template.status === 'APPROVED' ? '✅' : '❌';
        log(`   ${statusIcon} ${template.name} (${template.status})`, colors.green);
      });
    }

    log('\n⚠️  Important Information:', colors.yellow);
    log('═'.repeat(60), colors.yellow);
    
    log('\n📝 To send messages to a phone number, you must:', colors.bright);
    log('   1. Add it as a test number in Meta App Dashboard', colors.yellow);
    log('   2. Or wait for the recipient to message you first', colors.yellow);
    log('   3. Or use approved template messages (like hello_world)', colors.yellow);

    log('\n🔗 Add Test Number:', colors.blue);
    log('   1. Go to: https://developers.facebook.com/apps/1284378939762336/whatsapp-business/wa-dev-console/', colors.green);
    log('   2. Look for "Send and receive messages" or "To" section', colors.green);
    log('   3. Click "Manage phone number list" or "Add phone number"', colors.green);
    log('   4. Enter: +972526581731', colors.green);
    log('   5. You will receive a 6-digit code on WhatsApp', colors.green);
    log('   6. Enter the code to verify', colors.green);

    log('\n💡 Alternative - Use API Setup:', colors.blue);
    log('   1. Go to: https://developers.facebook.com/apps/1284378939762336/whatsapp-business/wa-settings/', colors.green);
    log('   2. Navigate to "API Setup" tab', colors.green);
    log('   3. Under "Step 5: Send messages with the API"', colors.green);
    log('   4. Click "Add phone number" next to "To:"', colors.green);
    log('   5. Add +972526581731 and verify with code', colors.green);

    log('\n📊 Message Sending Rules:', colors.blue);
    log('   ✅ Template messages: Can be sent to ANY number (no restrictions)', colors.green);
    log('   ⚠️  Text messages: Only within 24h window after user messages you', colors.yellow);
    log('   ⚠️  Test numbers: Must be verified in Meta dashboard first', colors.yellow);

    log('\n🎯 Next Steps:', colors.bright);
    log('   1. Add +972526581731 as a test number (see instructions above)');
    log('   2. Verify the number with the code sent to WhatsApp');
    log('   3. Try sending the message again');
    log('   4. Check the WhatsApp on +972526581731');

  } catch (error: any) {
    log('\n❌ Request Failed', colors.red);
    log(`   Error: ${error.message}`, colors.red);
  }
}

checkTestNumbers().catch((error) => {
  log(`\n❌ Unexpected Error: ${error.message}`, colors.red);
  process.exit(1);
});

