# Quick Start Guide - Testing Sprint 1

**Goal**: Verify your Meta Business Platform setup and test multi-tenant WhatsApp messaging

---

## Prerequisites

- ✅ Completed [META-SETUP-CHECKLIST.md](META-SETUP-CHECKLIST.md)
- ✅ All environment variables set in `.env`
- ✅ MongoDB running and connected

---

## Step 1: Verify Meta API Setup (5 minutes)

Run the verification script to ensure all Meta credentials are correct:

```bash
pnpm dlx tsx scripts/test-meta-api.ts
```

### Expected Output:
```
============================================================
  Meta Business API Verification
============================================================

✓ Environment Variables - All required variables present
✓ System User Token Validation - Token is valid
✓ Business Manager Access - Business Manager: [Your Business]
✓ WhatsApp Business Accounts List - Found 1 account(s)
✓ WhatsApp Phone Numbers - Found 1 phone number(s)
✓ Message Templates - Found X template(s)
✓ Send Test Message (Dry Run) - Endpoint configured
○ Webhook Configuration - Not reachable (OK for local)

============================================================
  Summary
============================================================
Total Tests: 8
✓ Passed: 7
✗ Failed: 0
○ Skipped: 1

✓ Meta Business API is properly configured!
You can proceed with Sprint 1 implementation.
```

**If any tests fail**: Review [META-SETUP-CHECKLIST.md](META-SETUP-CHECKLIST.md) and fix the configuration.

---

## Step 2: Test Encryption Service (1 minute)

Test that encryption keys are working correctly:

```bash
node -e "
const { EncryptionService } = require('./app/lib/services/EncryptionService.ts');
try {
  EncryptionService.validateConfiguration();
  const result = EncryptionService.test();
  console.log('✓ Encryption test passed:', result);
} catch (error) {
  console.error('✗ Encryption test failed:', error.message);
}
"
```

### Expected Output:
```
✓ Encryption test passed: true
```

---

## Step 3: Create Test Business in Database (5 minutes)

Create a test script to set up a business with WhatsApp connection:

### Create `scripts/create-test-business.ts`:

```typescript
#!/usr/bin/env tsx

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Business from '../app/models/Business';
import BusinessWhatsAppAccount from '../app/models/BusinessWhatsAppAccount';
import { EncryptionService } from '../app/lib/services/EncryptionService';

dotenv.config();

async function createTestBusiness() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✓ Connected to MongoDB');

    // Check if test business already exists
    const existing = await Business.findOne({ email: 'test@pizzeria.com' });
    if (existing) {
      console.log('✓ Test business already exists:', existing._id);
      return existing;
    }

    // Create test business
    const business = await Business.create({
      userId: 'test_user_fb_123',
      name: 'Test Pizzeria',
      type: 'pizzeria',
      phone: '+972501234567',
      email: 'test@pizzeria.com',
      status: 'active',
      settings: {
        currency: 'ILS',
        timezone: 'Asia/Jerusalem',
        language: 'he',
      },
      subscription: {
        plan: 'pro',
        startDate: new Date(),
        features: ['whatsapp_messaging', 'order_management'],
      },
    });

    console.log('✓ Business created:', business._id);

    // Encrypt access token
    const accessToken = process.env.META_SYSTEM_USER_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('No access token found in environment variables');
    }

    const encryptedToken = EncryptionService.encrypt(accessToken);
    console.log('✓ Access token encrypted');

    // Create WhatsApp account
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

    console.log('✓ WhatsApp account created:', whatsappAccount._id);
    console.log('\n✓ Test business setup complete!');
    console.log('Business ID:', business._id.toString());

    await mongoose.connection.close();
    return business;
  } catch (error) {
    console.error('✗ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createTestBusiness();
```

### Run the script:

```bash
pnpm dlx tsx scripts/create-test-business.ts
```

### Expected Output:
```
✓ Connected to MongoDB
✓ Business created: 67abc123def456789
✓ Access token encrypted
✓ WhatsApp account created: 67abc123def456790
✓ Test business setup complete!
Business ID: 67abc123def456789
```

**Save the Business ID** - you'll need it for testing!

---

## Step 4: Test Multi-Tenant WhatsApp Service (5 minutes)

Create a test script to send a message using the multi-tenant service:

### Create `scripts/test-whatsapp-service.ts`:

```typescript
#!/usr/bin/env tsx

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MultiTenantWhatsAppService from '../app/lib/services/MultiTenantWhatsAppService';

dotenv.config();

async function testWhatsAppService() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✓ Connected to MongoDB');

    // Use your business ID from Step 3
    const businessId = process.argv[2];
    if (!businessId) {
      throw new Error('Please provide business ID: pnpm dlx tsx scripts/test-whatsapp-service.ts <business_id>');
    }

    console.log('Testing WhatsApp service for business:', businessId);

    // Test 1: Check account status
    console.log('\n[Test 1] Checking account status...');
    const status = await MultiTenantWhatsAppService.getAccountStatus(businessId);
    console.log('Account Status:', status);

    // Test 2: Test connection
    console.log('\n[Test 2] Testing connection...');
    const connectionTest = await MultiTenantWhatsAppService.testConnection(businessId);
    console.log('Connection Test:', connectionTest);

    // Test 3: Get templates
    console.log('\n[Test 3] Fetching templates...');
    const templatesResult = await MultiTenantWhatsAppService.getTemplates(businessId);
    console.log('Templates:', templatesResult);

    // Test 4: Send test message (IMPORTANT: Add recipient to test numbers in Meta dashboard)
    const testPhoneNumber = process.argv[3];
    if (testPhoneNumber) {
      console.log('\n[Test 4] Sending test message to:', testPhoneNumber);
      const messageResult = await MultiTenantWhatsAppService.sendTextMessage(businessId, {
        phoneNumber: testPhoneNumber,
        message: '🎉 Hello from Croozer Multi-Tenant WhatsApp Service!\n\nThis is a test message from your new order management system.',
      });
      console.log('Message Result:', messageResult);
    } else {
      console.log('\n[Test 4] Skipped (no phone number provided)');
      console.log('To test message sending, run:');
      console.log(`pnpm dlx tsx scripts/test-whatsapp-service.ts ${businessId} +972501234567`);
    }

    console.log('\n✓ All tests completed!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('✗ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testWhatsAppService();
```

### Run the test:

```bash
# Test without sending message
pnpm dlx tsx scripts/test-whatsapp-service.ts <YOUR_BUSINESS_ID>

# Test with message sending (make sure phone number is in test numbers list)
pnpm dlx tsx scripts/test-whatsapp-service.ts <YOUR_BUSINESS_ID> +972501234567
```

### Expected Output:
```
✓ Connected to MongoDB
Testing WhatsApp service for business: 67abc123def456789

[Test 1] Checking account status...
Account Status: {
  connected: true,
  status: 'active',
  phoneNumber: '+972501234567',
  displayName: 'Test Pizzeria'
}

[Test 2] Testing connection...
Connection Test: {
  success: true,
  data: {
    id: '821921634328544',
    display_phone_number: '+972 50 123 4567',
    verified_name: 'Test Pizzeria',
    quality_rating: 'GREEN'
  },
  message: 'Connection successful'
}

[Test 3] Fetching templates...
Templates: {
  success: true,
  data: [ ... ],
  message: 'Templates retrieved successfully'
}

[Test 4] Sending test message to: +972501234567
Message Result: {
  success: true,
  data: {
    messaging_product: 'whatsapp',
    contacts: [ { input: '972501234567', wa_id: '972501234567' } ],
    messages: [ { id: 'wamid.HBgNMTIzNDU2Nzg5...' } ]
  },
  message: 'Message sent successfully'
}

✓ All tests completed!
```

---

## Step 5: Verify Message Received (1 minute)

Check your WhatsApp to confirm you received the test message!

✅ You should see: **"🎉 Hello from Croozer Multi-Tenant WhatsApp Service!..."**

---

## Troubleshooting

### Issue: "WhatsApp account not configured for this business"
**Solution**: Run Step 3 to create the test business and WhatsApp account

### Issue: "Failed to decrypt access token"
**Solution**: Regenerate encryption keys with `pnpm dlx tsx scripts/generate-encryption-keys.ts` and update `.env`

### Issue: "Cannot send text message: 24-hour window expired"
**Solution**:
1. Add your phone number to test numbers in Meta App Dashboard
2. Or use template messages instead of text messages

### Issue: "Access token expired or invalid" (Error 190)
**Solution**:
1. Regenerate System User token in Meta Business Manager
2. Update `META_SYSTEM_USER_ACCESS_TOKEN` in `.env`
3. Recreate test business (Step 3)

---

## What's Next?

Once all tests pass successfully:

### ✅ You've completed Sprint 1!

### Next: Complete Meta Business Platform Setup for Production

1. **Business Verification**: Verify your Meta Business Manager account
2. **App Review**: Submit your app for `whatsapp_business_messaging` permission review
3. **Production Phone Number**: Add a production WhatsApp Business phone number
4. **Webhook Setup**: Configure webhook in production (not localhost/ngrok)

### Then: Proceed to Sprint 2

Sprint 2 will add:
- Embedded Signup UI for businesses to connect their own WhatsApp accounts
- Webhook receiver for incoming messages
- Order creation from WhatsApp messages
- Order management dashboard

---

## Quick Reference

### Important Environment Variables
```env
# Required for testing
META_SYSTEM_USER_ACCESS_TOKEN=your_token_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
ENCRYPTION_KEY=your_encryption_key
ENCRYPTION_IV=your_iv
```

### Key Commands
```bash
# Verify Meta API
pnpm dlx tsx scripts/test-meta-api.ts

# Generate encryption keys
pnpm dlx tsx scripts/generate-encryption-keys.ts

# Create test business
pnpm dlx tsx scripts/create-test-business.ts

# Test WhatsApp service
pnpm dlx tsx scripts/test-whatsapp-service.ts <business_id> <phone_number>
```

---

**Status**: Ready for testing! 🚀

Follow the steps above and you'll have a fully functional multi-tenant WhatsApp messaging system!
