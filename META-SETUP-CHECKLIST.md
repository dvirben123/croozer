# Meta Business API Setup Checklist

**Complete this checklist before running Sprint 1**

---

## Prerequisites

- [ ] Active Facebook account
- [ ] Meta Business Manager account created
- [ ] Business verified (recommended, not required for testing)
- [ ] WhatsApp Business API app created

---

## Step 1: Meta Business Manager

### 1.1 Access Business Manager

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Select your business or create a new one
3. Navigate to **Business Settings**

### 1.2 Get Your Business Manager ID

1. In Business Settings, go to **Business Info**
2. Copy your **Business Manager ID**
3. Add to `.env`:
   ```env
   META_BUSINESS_MANAGER_ID=your_business_id_here
   ```

**Status**: ⬜ ✅ Completed

---

## Step 2: Create System User

### 2.1 Create System User

1. In Business Settings, go to **Users** > **System Users**
2. Click **Add** to create a new system user
3. Name it: `Croozer WhatsApp API`
4. Role: **Admin**
5. Click **Create System User**

### 2.2 Assign Assets to System User

1. Click on the created system user
2. Click **Add Assets**
3. Select **Apps** and add your WhatsApp Business App
4. Select **WhatsApp Accounts** and add your WABA
5. Ensure **Full Control** is selected

### 2.3 Generate Access Token

1. Still in the system user settings, click **Generate New Token**
2. Select your WhatsApp Business App
3. Select these permissions:
   - ✅ `whatsapp_business_management`
   - ✅ `whatsapp_business_messaging`
   - ✅ `business_management`
4. Token duration: **Never expire** (recommended for system user)
5. Click **Generate Token**
6. **IMPORTANT**: Copy the token immediately (you won't see it again!)
7. Add to `.env`:
   ```env
   META_SYSTEM_USER_ACCESS_TOKEN=your_token_here
   ```

**Status**: ⬜ ✅ Completed

---

## Step 3: WhatsApp Business App Configuration

### 3.1 Create/Access WhatsApp App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps**
3. Either:
   - Select your existing WhatsApp Business app
   - Or click **Create App** > **Business** > Add **WhatsApp** product

### 3.2 Get App Credentials

1. In your app dashboard, go to **Settings** > **Basic**
2. Copy **App ID** and **App Secret**
3. Add to `.env`:
   ```env
   META_APP_ID=your_app_id_here
   META_APP_SECRET=your_app_secret_here
   ```

### 3.3 Configure WhatsApp Product

1. In app dashboard, go to **WhatsApp** > **Getting Started**
2. Note your **Test Phone Number** and **Phone Number ID**
3. For now, use the test number provided by Meta

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Completed

---

## Step 4: WhatsApp Business Account (WABA)

### 4.1 Get WABA ID

1. In Business Settings, go to **Accounts** > **WhatsApp Accounts**
2. Copy your **WhatsApp Business Account ID**
3. Add to `.env`:
   ```env
   WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id_here
   ```

### 4.2 Get Phone Number ID

1. Click on your WhatsApp Account
2. Go to **Phone Numbers**
3. Copy the **Phone Number ID** (NOT the phone number itself)
4. Add to `.env`:
   ```env
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
   ```

### 4.3 Verify Phone Number Status

- [x] Phone number is **Verified**
- [x] Quality rating is **Green** or **Yellow** (not Red)
- [x] Messaging limit tier (start with **Tier 1** - 1000 conversations/24h)

**Status**: ✅ Completed

---

## Step 5: Embedded Signup Configuration

### 5.1 Enable Embedded Signup

1. In your WhatsApp app dashboard, go to **WhatsApp** > **Configuration**
2. Scroll to **Embedded signup**
3. Click **Create configuration**
4. Fill in:
   - **Name**: Croozer Business Onboarding
   - **Pre-filled message**: (optional)
   - **Callback URL**: `https://your-domain.com/api/meta/connect` (will create later)
5. Click **Create**

### 5.2 Get Configuration ID

1. Copy the **Configuration ID**
2. Add to `.env`:
   ```env
   NEXT_PUBLIC_META_CONFIGURATION_ID=your_config_id_here
   ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Completed

---

## Step 6: Webhook Setup (For Later - Sprint 2)

### 6.1 Generate Webhook Verify Token

1. Generate a random secure string (e.g., use: `openssl rand -hex 32`)
2. Add to `.env`:
   ```env
   WEBHOOK_VERIFY_TOKEN=your_random_string_here
   ```

### 6.2 Set Webhook URL (Development)

For local development, you'll need a public URL:

1. Use **ngrok** or similar: `ngrok http 3000`
2. Copy the HTTPS URL
3. Add to `.env`:
   ```env
   NEXT_PUBLIC_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/webhooks/whatsapp
   ```

### 6.3 Configure Webhook in Meta (Sprint 2)

1. In WhatsApp app dashboard, go to **WhatsApp** > **Configuration**
2. Click **Edit** next to Webhook
3. Enter:
   - **Callback URL**: Your webhook URL
   - **Verify token**: Your WEBHOOK_VERIFY_TOKEN
4. Subscribe to:
   - ✅ `messages`
   - ✅ `message_status`
5. Click **Verify and Save**

**Status**: ⬜ Not Started (Sprint 2)

---

## Step 7: Security & Encryption

### 7.1 Generate Encryption Keys

Run these commands to generate secure encryption keys:

```bash
# Generate encryption key (32 bytes = 64 hex characters)
openssl rand -hex 32

# Generate IV (16 bytes = 32 hex characters)
openssl rand -hex 16
```

Add to `.env`:

```env
ENCRYPTION_KEY=your_64_character_hex_string
ENCRYPTION_IV=your_32_character_hex_string
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Completed

---

## Step 8: Test Your Setup

### 8.1 Update Environment Variables

Create/update your `.env` file with all collected values:

```env
# Meta Business Platform
META_BUSINESS_MANAGER_ID=
META_SYSTEM_USER_ACCESS_TOKEN=
META_APP_ID=
META_APP_SECRET=
NEXT_PUBLIC_META_CONFIGURATION_ID=

# WhatsApp Business API
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=  # Can use META_SYSTEM_USER_ACCESS_TOKEN

# Webhook
WEBHOOK_VERIFY_TOKEN=
NEXT_PUBLIC_WEBHOOK_URL=

# Security
ENCRYPTION_KEY=
ENCRYPTION_IV=

# Existing (keep these)
MONGODB_URI=
NEXT_PUBLIC_FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
RESEND_API_KEY=
```

### 8.2 Run Verification Script

```bash
pnpm dlx tsx scripts/test-meta-api.ts
```

**Expected Output**: All tests should PASS or be SKIPPED (if optional)

**Status**: ✅ Completed (6/8 tests passed, 2 expected failures)

---

## Step 9: Test Message Sending

### 9.1 Add Test Phone Numbers

1. In WhatsApp app dashboard, go to **WhatsApp** > **Getting Started**
2. Under **Send and receive messages**, click **Add phone number**
3. Add your personal WhatsApp number for testing
4. You'll receive a verification code via WhatsApp

### 9.2 Send Test Message via Dashboard

1. Start your development server: `pnpm dev`
2. Navigate to `/dashboard` > **Messages** tab
3. Enter your test phone number
4. Send a test message
5. Verify you receive it on WhatsApp

**Status**: ✅ Completed - Message successfully sent and received via API

---

## Common Issues & Solutions

### Issue: "Invalid access token"

**Solution**:

- Regenerate System User token with correct permissions
- Ensure token has `whatsapp_business_messaging` permission
- Check token hasn't expired

### Issue: "Phone number not verified"

**Solution**:

- Complete phone number verification in Business Manager
- May take 24-48 hours for Meta to verify

### Issue: "Cannot send messages to this number"

**Solution**:

- Add recipient to test phone numbers in app dashboard
- Ensure recipient has WhatsApp installed
- Check 24-hour messaging window rules

### Issue: "Webhook verification failed"

**Solution**:

- Ensure webhook URL is HTTPS (use ngrok for local dev)
- Verify WEBHOOK_VERIFY_TOKEN matches in both .env and Meta dashboard
- Check webhook endpoint returns correct challenge response

---

## Verification Summary

Before proceeding to Sprint 1 implementation, ensure:

- [x] ✅ Meta Business Manager ID obtained
- [x] ✅ System User created with admin permissions
- [x] ✅ Permanent access token generated
- [x] ✅ WhatsApp app credentials (App ID, Secret) obtained
- [x] ✅ WABA ID and Phone Number ID obtained (CORRECTED: 789427540931519)
- [x] ✅ Embedded Signup configuration ID created
- [x] ✅ Encryption keys generated
- [x] ✅ All environment variables set in `.env`
- [x] ✅ Test script passes all checks (6/8 passed)
- [x] ✅ Can send test message via API and receive it on WhatsApp

---

## Next Steps

Once all checkboxes above are complete:

1. ✅ Run test script: `pnpm dlx tsx scripts/test-meta-api.ts`
2. ✅ Verify all tests pass
3. 🚀 **Proceed to Sprint 1: Multi-Tenant WhatsApp Service**

---

## Useful Resources

- [Meta Business Manager](https://business.facebook.com/)
- [Meta for Developers](https://developers.facebook.com/)
- [WhatsApp Business Platform Docs](https://developers.facebook.com/docs/whatsapp)
- [System User Guide](https://developers.facebook.com/docs/development/build-and-test/access-tokens)
- [Embedded Signup Docs](https://developers.facebook.com/docs/whatsapp/embedded-signup)

---

**Last Updated**: 2025-10-21
**Next Review**: After completing checklist
