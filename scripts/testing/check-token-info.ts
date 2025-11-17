#!/usr/bin/env tsx
/**
 * Check Access Token Information
 * Verifies if token is permanent and shows expiration details
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

async function checkToken() {
  log('\n🔐 Access Token Information', colors.bright);
  log('═'.repeat(60), colors.blue);

  const ACCESS_TOKEN = process.env.META_SYSTEM_USER_ACCESS_TOKEN;

  if (!ACCESS_TOKEN) {
    log('\n❌ ERROR: META_SYSTEM_USER_ACCESS_TOKEN not found in .env', colors.red);
    process.exit(1);
  }

  log('\n🔄 Checking token details...', colors.yellow);

  try {
    // Debug the access token
    const debugUrl = `https://graph.facebook.com/v24.0/debug_token?input_token=${ACCESS_TOKEN}&access_token=${ACCESS_TOKEN}`;
    
    const response = await fetch(debugUrl);
    const data = await response.json();

    if (!response.ok || data.error) {
      log('\n❌ Failed to check token', colors.red);
      if (data.error) {
        log(`   Error: ${data.error.message}`, colors.red);
      }
      process.exit(1);
    }

    const tokenData = data.data;

    log('\n✅ Token Information:', colors.green);
    log('═'.repeat(60), colors.green);

    log('\n📋 Basic Info:', colors.blue);
    log(`   App ID: ${tokenData.app_id || 'N/A'}`);
    log(`   Type: ${tokenData.type || 'N/A'}`);
    log(`   Valid: ${tokenData.is_valid ? '✅ Yes' : '❌ No'}`, tokenData.is_valid ? colors.green : colors.red);
    
    log('\n⏰ Expiration Info:', colors.blue);
    if (tokenData.expires_at === 0 || tokenData.data_access_expires_at === 0) {
      log(`   ✅ PERMANENT TOKEN (Never expires)`, colors.green);
      log(`   Expires At: ${tokenData.expires_at === 0 ? 'Never' : new Date(tokenData.expires_at * 1000).toLocaleString()}`, colors.green);
    } else {
      const expiresAt = new Date(tokenData.expires_at * 1000);
      const now = new Date();
      const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      log(`   ⚠️  TEMPORARY TOKEN`, colors.yellow);
      log(`   Expires At: ${expiresAt.toLocaleString()}`, colors.yellow);
      log(`   Days Until Expiry: ${daysUntilExpiry} days`, daysUntilExpiry < 30 ? colors.red : colors.yellow);
    }

    if (tokenData.data_access_expires_at) {
      if (tokenData.data_access_expires_at === 0) {
        log(`   Data Access: Never expires`, colors.green);
      } else {
        const dataExpiresAt = new Date(tokenData.data_access_expires_at * 1000);
        log(`   Data Access Expires: ${dataExpiresAt.toLocaleString()}`, colors.yellow);
      }
    }

    log('\n🔑 Token Permissions:', colors.blue);
    if (tokenData.scopes && tokenData.scopes.length > 0) {
      const importantScopes = [
        'whatsapp_business_management',
        'whatsapp_business_messaging',
        'business_management'
      ];
      
      importantScopes.forEach(scope => {
        if (tokenData.scopes.includes(scope)) {
          log(`   ✅ ${scope}`, colors.green);
        } else {
          log(`   ❌ ${scope} (MISSING!)`, colors.red);
        }
      });
      
      log(`\n   Total Scopes: ${tokenData.scopes.length}`);
    }

    log('\n👤 User Info:', colors.blue);
    log(`   User ID: ${tokenData.user_id || 'N/A'}`);
    log(`   Issued At: ${tokenData.issued_at ? new Date(tokenData.issued_at * 1000).toLocaleString() : 'N/A'}`);

    log('\n📄 Full Token Data:', colors.yellow);
    console.log(JSON.stringify(tokenData, null, 2));

    // Recommendations
    log('\n💡 Recommendations:', colors.bright);
    if (tokenData.expires_at === 0) {
      log('   ✅ You are using a PERMANENT System User token', colors.green);
      log('   ✅ This is the recommended token type for production', colors.green);
      log('   ✅ No need to refresh or regenerate', colors.green);
    } else {
      log('   ⚠️  You are using a TEMPORARY token', colors.yellow);
      log('   ⚠️  This token will expire and needs to be refreshed', colors.yellow);
      log('   💡 Consider generating a permanent System User token instead', colors.yellow);
      log('   📖 See: META-SETUP-CHECKLIST.md Step 2.3', colors.blue);
    }

  } catch (error: any) {
    log('\n❌ Request Failed', colors.red);
    log(`   Error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

checkToken().catch((error) => {
  log(`\n❌ Unexpected Error: ${error.message}`, colors.red);
  process.exit(1);
});

