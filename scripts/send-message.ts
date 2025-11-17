#!/usr/bin/env tsx
/**
 * Send WhatsApp Message - Main Script
 * 
 * Usage:
 *   npx tsx scripts/send-message.ts
 * 
 * This is the main script for sending WhatsApp messages.
 * It will guide you through sending either text or template messages.
 */

import 'dotenv/config';
import * as readline from 'readline';

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

function ask(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

async function sendMessage() {
  log('\n📱 WhatsApp Message Sender', colors.bright);
  log('═'.repeat(60), colors.blue);

  // Configuration from .env
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.META_SYSTEM_USER_ACCESS_TOKEN;

  // Validate
  if (!ACCESS_TOKEN) {
    log('\n❌ ERROR: META_SYSTEM_USER_ACCESS_TOKEN not found in .env', colors.red);
    process.exit(1);
  }

  if (!PHONE_NUMBER_ID) {
    log('\n❌ ERROR: WHATSAPP_PHONE_NUMBER_ID not found in .env', colors.red);
    process.exit(1);
  }

  log('\n📋 Configuration:', colors.blue);
  log(`   From Phone ID: ${PHONE_NUMBER_ID}`);
  log(`   Token: ${ACCESS_TOKEN.substring(0, 20)}...`);

  // Get recipient
  log('\n📞 Recipient Phone Number:', colors.yellow);
  log('   Format: Country code + number (no + or spaces)', colors.yellow);
  log('   Example: 972526581731', colors.yellow);
  
  const recipient = await ask('\n   Enter phone number: ');

  if (!recipient || recipient.trim().length < 10) {
    log('\n❌ Invalid phone number', colors.red);
    process.exit(1);
  }

  // Choose message type
  log('\n📝 Message Type:', colors.blue);
  log('   1. Template message (hello_world) - Recommended', colors.green);
  log('   2. Custom text message', colors.yellow);
  
  const choice = await ask('\n   Choose (1 or 2): ');

  let requestBody: any;
  let messageDescription: string;

  if (choice === '2') {
    // Text message
    const text = await ask('\n   Enter message text: ');
    
    if (!text || text.trim().length === 0) {
      log('\n❌ Message cannot be empty', colors.red);
      process.exit(1);
    }

    requestBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient.trim(),
      type: 'text',
      text: {
        preview_url: false,
        body: text.trim(),
      },
    };
    messageDescription = `Text: "${text.trim()}"`;
  } else {
    // Template message (default)
    requestBody = {
      messaging_product: 'whatsapp',
      to: recipient.trim(),
      type: 'template',
      template: {
        name: 'hello_world',
        language: {
          code: 'en_US',
        },
      },
    };
    messageDescription = 'Template: hello_world';
  }

  // Send message
  const url = `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}/messages`;

  log('\n🔄 Sending message...', colors.yellow);
  log(`   To: +${recipient.trim()}`, colors.blue);
  log(`   Message: ${messageDescription}`, colors.blue);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      log('\n❌ Message Send Failed', colors.red);
      log('═'.repeat(60), colors.red);
      
      if (data.error) {
        log(`\nError Code: ${data.error.code}`, colors.red);
        log(`Message: ${data.error.message}`, colors.red);
        
        // Helpful error messages
        if (data.error.code === 131026) {
          log('\n💡 Solution:', colors.yellow);
          log('   Add this number as a test recipient in Meta dashboard:', colors.yellow);
          log('   https://developers.facebook.com/apps/whatsapp-business/wa-dev-console/', colors.yellow);
        } else if (data.error.code === 131047) {
          log('\n💡 Solution:', colors.yellow);
          log('   Use template messages (option 1) instead of text messages', colors.yellow);
        }
      }

      log('\n📄 Full Response:', colors.yellow);
      console.log(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    // Success!
    log('\n✅ Message Sent Successfully!', colors.green);
    log('═'.repeat(60), colors.green);
    
    if (data.messages && data.messages[0]) {
      log(`\n   Message ID: ${data.messages[0].id}`, colors.green);
      log(`   Status: ${data.messages[0].message_status || 'sent'}`, colors.green);
    }
    log(`   Recipient: +${recipient.trim()}`, colors.green);

    log('\n🎉 Done!', colors.bright);
    log('   Check WhatsApp to see the message!', colors.green);

  } catch (error: any) {
    log('\n❌ Request Failed', colors.red);
    log(`   Error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run
sendMessage().catch((error) => {
  log(`\n❌ Unexpected Error: ${error.message}`, colors.red);
  process.exit(1);
});

