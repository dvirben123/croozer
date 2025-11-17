#!/usr/bin/env tsx
/**
 * Check WhatsApp Phone Number Status
 * 
 * This script checks the registration status and details of a phone number
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

async function checkPhoneStatus() {
  log('\n📱 WhatsApp Phone Number Status Check', colors.bright);
  log('═'.repeat(60), colors.blue);

  // Configuration
  const PHONE_NUMBER_ID = '831563980046780';
  const ACCESS_TOKEN = process.env.META_SYSTEM_USER_ACCESS_TOKEN;

  // Validate environment variables
  if (!ACCESS_TOKEN) {
    log('\n❌ ERROR: META_SYSTEM_USER_ACCESS_TOKEN not found in .env', colors.red);
    process.exit(1);
  }

  log('\n🔄 Fetching phone number details...', colors.yellow);

  try {
    const url = `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}?fields=id,display_phone_number,verified_name,code_verification_status,quality_rating,messaging_limit_tier,is_official_business_account,account_mode,certificate,name_status&access_token=${ACCESS_TOKEN}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      log('\n❌ Failed to fetch phone number details', colors.red);
      log('═'.repeat(60), colors.red);
      
      if (data.error) {
        log(`\nError Code: ${data.error.code}`, colors.red);
        log(`Error Type: ${data.error.type}`, colors.red);
        log(`Message: ${data.error.message}`, colors.red);
      }

      log('\n📄 Full Response:', colors.yellow);
      console.log(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    // Success!
    log('\n✅ Phone Number Details Retrieved', colors.green);
    log('═'.repeat(60), colors.green);
    
    log('\n📱 Phone Number Information:', colors.blue);
    log(`   ID: ${data.id || 'N/A'}`);
    log(`   Display Number: ${data.display_phone_number || 'N/A'}`);
    log(`   Verified Name: ${data.verified_name || 'N/A'}`);
    log(`   Name Status: ${data.name_status || 'N/A'}`);
    
    log('\n📊 Status & Quality:', colors.blue);
    log(`   Code Verification: ${data.code_verification_status || 'N/A'}`);
    log(`   Quality Rating: ${data.quality_rating || 'N/A'}`);
    log(`   Messaging Limit Tier: ${data.messaging_limit_tier || 'N/A'}`);
    log(`   Account Mode: ${data.account_mode || 'N/A'}`);
    log(`   Official Business: ${data.is_official_business_account ? 'Yes' : 'No'}`);

    if (data.certificate) {
      log('\n🔐 Certificate:', colors.blue);
      log(`   ${data.certificate.substring(0, 80)}...`);
    }

    log('\n📄 Full API Response:', colors.yellow);
    console.log(JSON.stringify(data, null, 2));

    // Interpret the status
    log('\n💡 Status Interpretation:', colors.bright);
    
    if (data.code_verification_status === 'VERIFIED') {
      log('   ✅ Phone number is VERIFIED and ready to use', colors.green);
    } else {
      log(`   ⚠️  Verification Status: ${data.code_verification_status}`, colors.yellow);
    }

    if (data.quality_rating === 'GREEN') {
      log('   ✅ Quality rating is EXCELLENT', colors.green);
    } else if (data.quality_rating === 'YELLOW') {
      log('   ⚠️  Quality rating is MEDIUM - be careful with message quality', colors.yellow);
    } else if (data.quality_rating === 'RED') {
      log('   ❌ Quality rating is LOW - risk of restrictions', colors.red);
    }

    const tierLimits: Record<string, string> = {
      'TIER_1K': '1,000 conversations/24h',
      'TIER_10K': '10,000 conversations/24h',
      'TIER_100K': '100,000 conversations/24h',
      'TIER_UNLIMITED': 'Unlimited conversations',
    };

    const tierLimit = tierLimits[data.messaging_limit_tier] || data.messaging_limit_tier;
    log(`   📊 Current Messaging Limit: ${tierLimit}`, colors.blue);

    log('\n🎉 Next Steps:', colors.bright);
    log('   1. Your phone number is already registered and active');
    log('   2. You can start sending messages via the Cloud API');
    log('   3. Test sending a message from your dashboard');
    log('   4. Monitor your quality rating to avoid restrictions');

  } catch (error: any) {
    log('\n❌ Request Failed', colors.red);
    log('═'.repeat(60), colors.red);
    log(`\nError: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the check
checkPhoneStatus().catch((error) => {
  log(`\n❌ Unexpected Error: ${error.message}`, colors.red);
  process.exit(1);
});

