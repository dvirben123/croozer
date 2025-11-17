/**
 * Check which phone numbers are available with the current access token
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ACCESS_TOKEN = process.env.META_SYSTEM_USER_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '1980175552606363';

async function checkAvailableNumbers() {
  if (!ACCESS_TOKEN) {
    console.error('❌ No access token found in environment variables');
    process.exit(1);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('🔍 CHECKING AVAILABLE PHONE NUMBERS');
  console.log('═'.repeat(60));
  console.log('📋 WABA ID:', WABA_ID);
  console.log('🔑 Token:', ACCESS_TOKEN.substring(0, 20) + '...');
  console.log('═'.repeat(60) + '\n');

  try {
    // Get phone numbers for this WABA
    const url = `https://graph.facebook.com/v24.0/${WABA_ID}/phone_numbers`;
    
    console.log('📞 Fetching phone numbers...\n');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data);
      console.error('\nPossible issues:');
      console.error('  1. WABA ID is incorrect');
      console.error('  2. Access token doesn\'t have permission to access this WABA');
      console.error('  3. Access token has expired');
      process.exit(1);
    }

    if (!data.data || data.data.length === 0) {
      console.log('⚠️  No phone numbers found for this WABA');
      console.log('\nThis could mean:');
      console.log('  1. No phone numbers are registered');
      console.log('  2. The WABA ID is incorrect');
      process.exit(0);
    }

    console.log('✅ Found', data.data.length, 'phone number(s):\n');
    
    for (const phone of data.data) {
      console.log('─'.repeat(60));
      console.log('📱 Display Phone Number:', phone.display_phone_number);
      console.log('🆔 Phone Number ID:', phone.id);
      console.log('📊 Quality Rating:', phone.quality_rating || 'N/A');
      console.log('✅ Verified Name:', phone.verified_name || 'N/A');
      console.log('📈 Code Verification Status:', phone.code_verification_status || 'N/A');
      
      // Check if this is the one in .env
      const envPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      if (envPhoneId === phone.id) {
        console.log('🎯 THIS IS THE PHONE NUMBER ID IN YOUR .ENV FILE');
      }
      
      console.log('─'.repeat(60) + '\n');
    }

    console.log('\n💡 To use a phone number, update your .env file:');
    console.log('   WHATSAPP_PHONE_NUMBER_ID=<Phone Number ID from above>');
    console.log('   WHATSAPP_BUSINESS_ACCOUNT_ID=' + WABA_ID);
    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAvailableNumbers();

