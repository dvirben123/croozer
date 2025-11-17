#!/usr/bin/env tsx
/**
 * Configure WhatsApp Webhook
 * 
 * This script helps you set up webhooks to receive incoming messages.
 * 
 * Steps:
 * 1. Generate webhook verify token
 * 2. Start ngrok tunnel (for local development)
 * 3. Configure webhook in Meta dashboard
 */

import 'dotenv/config';
import * as crypto from 'crypto';
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

async function configureWebhook() {
  log('\n🔗 WhatsApp Webhook Configuration', colors.bright);
  log('═'.repeat(60), colors.blue);

  // Check if webhook token exists
  let webhookToken = process.env.WEBHOOK_VERIFY_TOKEN;

  if (!webhookToken) {
    log('\n📝 Generating webhook verify token...', colors.yellow);
    webhookToken = crypto.randomBytes(32).toString('hex');
    
    // Update .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    if (envContent.includes('WEBHOOK_VERIFY_TOKEN=')) {
      envContent = envContent.replace(
        /WEBHOOK_VERIFY_TOKEN=.*/,
        `WEBHOOK_VERIFY_TOKEN=${webhookToken}`
      );
    } else {
      envContent += `\nWEBHOOK_VERIFY_TOKEN=${webhookToken}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    log('✅ Webhook token generated and saved to .env', colors.green);
  } else {
    log('\n✅ Webhook token already exists in .env', colors.green);
  }

  log('\n📋 Webhook Configuration:', colors.blue);
  log(`   Verify Token: ${webhookToken.substring(0, 20)}...`, colors.green);

  // Instructions
  log('\n🚀 Setup Instructions:', colors.bright);
  log('═'.repeat(60), colors.blue);

  log('\n📍 Step 1: Expose Your Local Server (Development)', colors.yellow);
  log('   For local development, you need a public URL.');
  log('   Option A - Using ngrok (Recommended):', colors.blue);
  log('   1. Install ngrok: https://ngrok.com/download');
  log('   2. Run: ngrok http 3000');
  log('   3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)');
  log('');
  log('   Option B - Using localtunnel:', colors.blue);
  log('   1. Install: pnpm add -g localtunnel');
  log('   2. Run: lt --port 3000');
  log('   3. Copy the URL');

  log('\n📍 Step 2: Configure Webhook in Meta Dashboard', colors.yellow);
  log('   1. Go to: https://developers.facebook.com/apps/1284378939762336/whatsapp-business/wa-settings/');
  log('   2. Click "Configuration" tab');
  log('   3. Find "Webhook" section');
  log('   4. Click "Edit"');
  log('');
  log('   5. Enter Callback URL:', colors.blue);
  log('      https://YOUR_NGROK_URL/api/webhooks/whatsapp', colors.green);
  log('      (Replace YOUR_NGROK_URL with your actual ngrok URL)');
  log('');
  log('   6. Enter Verify Token:', colors.blue);
  log(`      ${webhookToken}`, colors.green);
  log('');
  log('   7. Click "Verify and Save"');
  log('');
  log('   8. Subscribe to webhook fields:', colors.blue);
  log('      ✅ messages');
  log('      ✅ message_status');

  log('\n📍 Step 3: Start Your Development Server', colors.yellow);
  log('   pnpm dev');

  log('\n📍 Step 4: Test Webhook', colors.yellow);
  log('   1. Send a WhatsApp message to: +972 53-533-1770');
  log('   2. Check your terminal for incoming webhook events');
  log('   3. You should see: "📨 Webhook received"');

  log('\n💡 Production Setup:', colors.bright);
  log('   For production, use your actual domain:');
  log('   https://your-domain.com/api/webhooks/whatsapp');

  log('\n🔐 Security Notes:', colors.yellow);
  log('   • Keep WEBHOOK_VERIFY_TOKEN secret');
  log('   • Use HTTPS only (required by Meta)');
  log('   • Webhook endpoint is already implemented in:');
  log('     app/api/webhooks/whatsapp/route.ts');

  log('\n📖 Next Steps:', colors.bright);
  log('   1. Set up ngrok or localtunnel');
  log('   2. Configure webhook in Meta dashboard');
  log('   3. Start dev server (pnpm dev)');
  log('   4. Send a test message to your WhatsApp number');
  log('   5. Check terminal for incoming messages');

  log('\n✅ Webhook configuration ready!', colors.green);
  log('═'.repeat(60), colors.green);
}

configureWebhook().catch((error) => {
  log(`\n❌ Error: ${error.message}`, colors.red);
  process.exit(1);
});

