#!/usr/bin/env tsx

/**
 * Create Test Business
 *
 * This script creates a test business with a WhatsApp account connection
 * for testing the multi-tenant WhatsApp service.
 *
 * Usage:
 *   pnpm dlx tsx scripts/create-test-business.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Business from '../app/models/Business';
import BusinessWhatsAppAccount from '../app/models/BusinessWhatsAppAccount';
import { EncryptionService } from '../app/lib/services/EncryptionService';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function createTestBusiness() {
  try {
    log('\n='.repeat(60), colors.cyan);
    log('  Creating Test Business', colors.cyan);
    log('='.repeat(60) + '\n', colors.cyan);

    // Connect to MongoDB
    log('Connecting to MongoDB...', colors.yellow);
    await mongoose.connect(process.env.MONGODB_URI!);
    log('✓ Connected to MongoDB\n', colors.green);

    // Check if test business already exists
    const existing = await Business.findOne({ email: 'test@pizzeria.com' });
    if (existing) {
      log('⚠️  Test business already exists!', colors.yellow);
      log(`Business ID: ${existing._id}`, colors.cyan);
      log(`Name: ${existing.name}`, colors.cyan);
      log(`Status: ${existing.status}\n`, colors.cyan);

      // Check for WhatsApp account
      const whatsappAccount = await BusinessWhatsAppAccount.findOne({ businessId: existing._id });
      if (whatsappAccount) {
        log('WhatsApp Account Status:', colors.cyan);
        log(`  Phone: ${whatsappAccount.phoneNumber}`, colors.reset);
        log(`  Status: ${whatsappAccount.status}`, colors.reset);
        log(`  Display Name: ${whatsappAccount.displayName}\n`, colors.reset);
      }

      log('To create a new test business, delete the existing one first.', colors.yellow);
      await mongoose.connection.close();
      return;
    }

    // Create test business
    log('Creating test business...', colors.yellow);
    const business = await Business.create({
      userId: 'test_user_fb_123',
      name: 'Test Pizzeria',
      type: 'pizzeria',
      phone: '+972501234567',
      email: 'test@pizzeria.com',
      address: {
        street: '123 Test Street',
        city: 'Tel Aviv',
        country: 'Israel',
      },
      status: 'active',
      settings: {
        currency: 'ILS',
        timezone: 'Asia/Jerusalem',
        language: 'he',
        businessHours: {
          sunday: { open: '10:00', close: '22:00' },
          monday: { open: '10:00', close: '22:00' },
          tuesday: { open: '10:00', close: '22:00' },
          wednesday: { open: '10:00', close: '22:00' },
          thursday: { open: '10:00', close: '22:00' },
          friday: { open: '10:00', close: '15:00' },
        },
      },
      subscription: {
        plan: 'pro',
        startDate: new Date(),
        features: ['whatsapp_messaging', 'order_management', 'customer_management'],
      },
      onboarding: {
        completed: true,
        currentStep: 3,
        stepsCompleted: ['business_info', 'whatsapp_setup', 'menu_setup'],
      },
    });

    log('✓ Business created!', colors.green);
    log(`  ID: ${business._id}`, colors.cyan);
    log(`  Name: ${business.name}`, colors.cyan);
    log(`  Type: ${business.type}`, colors.cyan);
    log(`  Status: ${business.status}\n`, colors.cyan);

    // Encrypt access token
    log('Encrypting access token...', colors.yellow);
    const accessToken = process.env.META_SYSTEM_USER_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error(
        'No access token found! Set META_SYSTEM_USER_ACCESS_TOKEN or WHATSAPP_ACCESS_TOKEN in .env'
      );
    }

    const encryptedToken = EncryptionService.encrypt(accessToken);
    log('✓ Access token encrypted\n', colors.green);

    // Create WhatsApp account
    log('Creating WhatsApp account connection...', colors.yellow);
    const whatsappAccount = await BusinessWhatsAppAccount.create({
      businessId: business._id,
      userId: business.userId,
      whatsappBusinessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      phoneNumber: '+972501234567', // Update with your actual number
      displayName: 'Test Pizzeria',
      accessToken: encryptedToken,
      tokenType: 'permanent',
      webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN!,
      webhookSubscribed: false,
      subscribedFields: ['messages', 'message_status'],
      permissions: ['whatsapp_business_messaging', 'whatsapp_business_management'],
      tier: 'free',
      messagingLimit: 1000,
      status: 'active',
    });

    log('✓ WhatsApp account created!', colors.green);
    log(`  ID: ${whatsappAccount._id}`, colors.cyan);
    log(`  Phone: ${whatsappAccount.phoneNumber}`, colors.cyan);
    log(`  Display Name: ${whatsappAccount.displayName}`, colors.cyan);
    log(`  Status: ${whatsappAccount.status}\n`, colors.cyan);

    // Update business with WhatsApp account reference
    business.whatsappAccountId = whatsappAccount._id;
    await business.save();

    log('='.repeat(60), colors.green);
    log('  ✓ Test Business Setup Complete!', colors.green);
    log('='.repeat(60) + '\n', colors.green);

    log('Business Details:', colors.cyan);
    log(`  Business ID: ${business._id.toString()}`, colors.reset);
    log(`  Email: ${business.email}`, colors.reset);
    log(`  WhatsApp: ${whatsappAccount.phoneNumber}`, colors.reset);
    log(`  Status: ${business.status}\n`, colors.reset);

    log('Next Steps:', colors.yellow);
    log('  1. Test the WhatsApp service with:', colors.reset);
    log(`     pnpm dlx tsx scripts/test-whatsapp-service.ts ${business._id.toString()}\n`, colors.cyan);
    log('  2. Send a test message with:', colors.reset);
    log(`     pnpm dlx tsx scripts/test-whatsapp-service.ts ${business._id.toString()} +972501234567\n`, colors.cyan);

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

createTestBusiness();
