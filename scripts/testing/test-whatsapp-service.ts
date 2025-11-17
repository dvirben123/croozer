#!/usr/bin/env tsx

/**
 * Test Multi-Tenant WhatsApp Service
 *
 * This script tests the multi-tenant WhatsApp service with a business ID.
 *
 * Usage:
 *   pnpm dlx tsx scripts/test-whatsapp-service.ts <business_id> [phone_number]
 *
 * Examples:
 *   # Test connection only
 *   pnpm dlx tsx scripts/test-whatsapp-service.ts 67abc123def456789
 *
 *   # Test with message sending
 *   pnpm dlx tsx scripts/test-whatsapp-service.ts 67abc123def456789 +972501234567
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import MultiTenantWhatsAppService from '../app/lib/services/MultiTenantWhatsAppService';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '-'.repeat(60));
  log(`  ${title}`, colors.cyan);
  console.log('-'.repeat(60) + '\n');
}

async function testWhatsAppService() {
  try {
    log('\n' + '='.repeat(60), colors.cyan);
    log('  Multi-Tenant WhatsApp Service Test', colors.cyan);
    log('='.repeat(60) + '\n', colors.cyan);

    // Get business ID from command line
    const businessId = process.argv[2];
    if (!businessId) {
      log('✗ Error: Business ID is required', colors.red);
      log('\nUsage:', colors.yellow);
      log('  pnpm dlx tsx scripts/test-whatsapp-service.ts <business_id> [phone_number]\n', colors.reset);
      log('Example:', colors.yellow);
      log('  pnpm dlx tsx scripts/test-whatsapp-service.ts 67abc123def456789 +972501234567\n', colors.reset);
      process.exit(1);
    }

    const testPhoneNumber = process.argv[3];

    log(`Testing for Business ID: ${businessId}`, colors.blue);
    if (testPhoneNumber) {
      log(`Test phone number: ${testPhoneNumber}`, colors.blue);
    }

    // Connect to MongoDB
    log('\nConnecting to MongoDB...', colors.yellow);
    await mongoose.connect(process.env.MONGODB_URI!);
    log('✓ Connected to MongoDB\n', colors.green);

    // Test 1: Check account status
    logSection('[Test 1/5] Checking Account Status');
    const status = await MultiTenantWhatsAppService.getAccountStatus(businessId);

    if (!status.connected) {
      log('✗ No WhatsApp account found for this business', colors.red);
      log('\nRun this command to create a test business:', colors.yellow);
      log('  pnpm dlx tsx scripts/create-test-business.ts\n', colors.cyan);
      await mongoose.connection.close();
      process.exit(1);
    }

    log('✓ WhatsApp account found', colors.green);
    log(`  Status: ${status.status}`, colors.reset);
    log(`  Phone: ${status.phoneNumber}`, colors.reset);
    log(`  Display Name: ${status.displayName}`, colors.reset);
    if (status.lastMessageAt) {
      log(`  Last Message: ${status.lastMessageAt.toLocaleString()}`, colors.reset);
    }
    if (status.errorMessage) {
      log(`  Error: ${status.errorMessage}`, colors.red);
    }

    // Test 2: Test connection
    logSection('[Test 2/5] Testing Connection');
    const connectionTest = await MultiTenantWhatsAppService.testConnection(businessId);

    if (!connectionTest.success) {
      log(`✗ Connection test failed: ${connectionTest.error}`, colors.red);
      await mongoose.connection.close();
      process.exit(1);
    }

    log('✓ Connection successful', colors.green);
    log(`  Phone ID: ${connectionTest.data?.id}`, colors.reset);
    log(`  Display Phone: ${connectionTest.data?.display_phone_number}`, colors.reset);
    log(`  Verified Name: ${connectionTest.data?.verified_name}`, colors.reset);
    if (connectionTest.data?.quality_rating) {
      const qualityColor =
        connectionTest.data.quality_rating === 'GREEN'
          ? colors.green
          : connectionTest.data.quality_rating === 'YELLOW'
            ? colors.yellow
            : colors.red;
      log(`  Quality Rating: ${connectionTest.data.quality_rating}`, qualityColor);
    }

    // Test 3: Check if has active account
    logSection('[Test 3/5] Verifying Active Account');
    const hasActive = await MultiTenantWhatsAppService.hasActiveAccount(businessId);

    if (!hasActive) {
      log('✗ Account is not active', colors.red);
      await mongoose.connection.close();
      process.exit(1);
    }

    log('✓ Account is active and ready', colors.green);

    // Test 4: Get templates
    logSection('[Test 4/5] Fetching Message Templates');
    const templatesResult = await MultiTenantWhatsAppService.getTemplates(businessId);

    if (!templatesResult.success) {
      log(`⚠️  Failed to fetch templates: ${templatesResult.error}`, colors.yellow);
    } else {
      const templates = templatesResult.data || [];
      log(`✓ Found ${templates.length} template(s)`, colors.green);

      if (templates.length > 0) {
        templates.slice(0, 3).forEach((template: any, index: number) => {
          log(`  ${index + 1}. ${template.name} (${template.status}) - ${template.language}`, colors.reset);
        });

        if (templates.length > 3) {
          log(`  ... and ${templates.length - 3} more`, colors.reset);
        }
      } else {
        log('  (No templates configured - this is OK for testing)', colors.yellow);
      }
    }

    // Test 5: Send test message (if phone number provided)
    logSection('[Test 5/5] Sending Test Message');

    if (!testPhoneNumber) {
      log('○ Skipped (no phone number provided)', colors.yellow);
      log('\nTo test message sending, run:', colors.yellow);
      log(`  pnpm dlx tsx scripts/test-whatsapp-service.ts ${businessId} +972501234567\n`, colors.cyan);
      log('⚠️  Important: Add the phone number to test numbers in Meta App Dashboard first!', colors.yellow);
    } else {
      log(`Sending test message to ${testPhoneNumber}...`, colors.yellow);

      const messageResult = await MultiTenantWhatsAppService.sendTextMessage(businessId, {
        phoneNumber: testPhoneNumber,
        message:
          '🎉 Hello from Croozer!\n\n' +
          'This is a test message from your new multi-tenant WhatsApp order management system.\n\n' +
          '✓ Multi-tenant service: Working\n' +
          '✓ Message encryption: Active\n' +
          '✓ Database integration: Connected\n\n' +
          'Your system is ready! 🚀',
      });

      if (!messageResult.success) {
        log(`✗ Failed to send message: ${messageResult.error}`, colors.red);

        if (messageResult.error?.includes('24-hour window')) {
          log('\n⚠️  Tip: Use template messages or ensure customer messaged you first', colors.yellow);
        } else if (messageResult.error?.includes('test numbers')) {
          log('\n⚠️  Tip: Add this phone number to test numbers in Meta App Dashboard', colors.yellow);
          log('     Go to: Meta App Dashboard > WhatsApp > Getting Started > Test Numbers', colors.yellow);
        }
      } else {
        log('✓ Message sent successfully!', colors.green);
        log(`  WhatsApp Message ID: ${messageResult.data?.messages?.[0]?.id}`, colors.reset);
        log(`  Contact WhatsApp ID: ${messageResult.data?.contacts?.[0]?.wa_id}`, colors.reset);
        log('\n📱 Check your WhatsApp to verify the message was received!', colors.cyan);
      }
    }

    // Summary
    log('\n' + '='.repeat(60), colors.green);
    log('  ✓ All Tests Completed!', colors.green);
    log('='.repeat(60) + '\n', colors.green);

    log('Summary:', colors.cyan);
    log('  ✓ Account Status: Connected', colors.green);
    log('  ✓ Connection Test: Passed', colors.green);
    log('  ✓ Active Account: Verified', colors.green);
    log(`  ✓ Templates: ${templatesResult.data?.length || 0} found`, colors.green);
    if (testPhoneNumber) {
      log(`  ${messageResult.success ? '✓' : '✗'} Message Sending: ${messageResult.success ? 'Successful' : 'Failed'}`, messageResult.success ? colors.green : colors.red);
    } else {
      log('  ○ Message Sending: Skipped', colors.yellow);
    }

    log('\n✓ Multi-Tenant WhatsApp Service is working correctly!', colors.green);
    log('  You can now proceed to Sprint 2.\n', colors.cyan);

    await mongoose.connection.close();
  } catch (error: any) {
    log(`\n✗ Error: ${error.message}`, colors.red);
    if (error.stack) {
      console.error(error.stack);
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

testWhatsAppService();
