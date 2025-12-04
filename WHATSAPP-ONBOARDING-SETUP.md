# WhatsApp Business Onboarding Setup - Complete Guide

## Overview

This document explains the complete WhatsApp Business API integration for the onboarding process, including embedded signup, phone number registration, and validation under your main Meta Business account.

## Architecture

The WhatsApp onboarding flow uses **Meta's Embedded Signup** to allow businesses to register their WhatsApp Business numbers under your main Meta app. This multi-tenant architecture ensures:

1. **Single Meta App**: All businesses connect through your main WhatsApp Business App
2. **Individual WABA**: Each business gets their own WhatsApp Business Account (WABA)
3. **Encrypted Tokens**: Business access tokens are encrypted and stored securely
4. **Automated Validation**: Phone numbers are validated and verified during signup

---

## Prerequisites

### 1. Meta Business Platform Setup

You need the following from Meta:

- **Meta Business Manager ID**: Your main business manager account
- **WhatsApp Business App**: Created in Meta Developer Portal
- **System User Token**: Permanent token for platform operations
- **Embedded Signup Configuration**: Configuration ID for the embedded signup flow

### 2. Environment Variables

Add these to your `.env` file:

```env
# Meta Business Platform
META_BUSINESS_MANAGER_ID=your_business_manager_id
META_SYSTEM_USER_ACCESS_TOKEN=your_permanent_system_user_token
META_APP_ID=your_whatsapp_app_id
META_APP_SECRET=your_whatsapp_app_secret

# Embedded Signup Configuration (CRITICAL)
NEXT_PUBLIC_META_CONFIGURATION_ID=your_embedded_signup_config_id

# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=your_main_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_main_waba_id

# Security
ENCRYPTION_KEY=generate_with_openssl_rand_hex_32
ENCRYPTION_IV=generate_with_openssl_rand_hex_16

# Webhooks
WEBHOOK_VERIFY_TOKEN=generate_random_secure_token
NEXT_PUBLIC_WEBHOOK_URL=https://your-domain.com/api/webhooks/whatsapp
```

### 3. Get Embedded Signup Configuration ID

1. Go to [Meta App Dashboard](https://developers.facebook.com/apps/)
2. Select your WhatsApp Business App
3. Navigate to **WhatsApp > Configuration**
4. Find **"Embedded Signup"** section
5. Create a new configuration or use existing
6. Copy the **Configuration ID** and add to `NEXT_PUBLIC_META_CONFIGURATION_ID`

---

## Implementation Flow

### Step 1: User Clicks "Connect WhatsApp" in Onboarding

Location: `app/components/onboarding/WhatsAppSetupStep.tsx`

```typescript
<WhatsAppConnectButton
  businessId={data.businessId}
  onSuccess={handleWhatsAppSuccess}
  onError={handleWhatsAppError}
/>
```

### Step 2: Facebook SDK Launches Embedded Signup

Location: `app/components/onboarding/WhatsAppConnectButton.tsx`

```typescript
window.FB.login(
  (response) => {
    if (response.authResponse) {
      const code = response.authResponse.code;
      exchangeCodeForToken(code);
    }
  },
  {
    config_id: process.env.NEXT_PUBLIC_META_CONFIGURATION_ID,
    response_type: 'code',
    override_default_response_type: true,
  }
);
```

**What happens in the popup:**
1. User logs in with Facebook
2. Selects or creates a Meta Business Portfolio
3. Creates or selects a WhatsApp Business Account (WABA)
4. Enters phone number for WhatsApp
5. Verifies phone number via SMS/Voice OTP
6. Meta returns an authorization code

### Step 3: Exchange Code for Access Token

Location: `app/api/meta/exchange-token/route.ts`

The backend:
1. Exchanges the authorization code for an access token
2. Fetches WABA and phone number details
3. Validates phone number status (verification, quality rating)
4. Encrypts and stores access token in database
5. Creates `BusinessWhatsAppAccount` record
6. Subscribes to webhooks automatically

```typescript
// Key validation checks:
- Phone number must exist in WABA
- Verification status (VERIFIED is best)
- Quality rating (GREEN/YELLOW acceptable, RED has restrictions)
- Account mode (LIVE vs SANDBOX)
```

### Step 4: Phone Number Validation

The system validates:

**Required Fields:**
- `phoneNumberId`: WhatsApp phone number ID (not the actual phone number!)
- `whatsappBusinessAccountId`: WABA ID
- `display_phone_number`: The actual phone number (e.g., "+1234567890")
- `verified_name`: Business display name

**Status Checks:**
- `code_verification_status`: Should be "VERIFIED"
- `quality_rating`: Should NOT be "RED"
- `account_mode`: "LIVE" for production

### Step 5: Store in Database

Schema: `app/models/BusinessWhatsAppAccount.ts`

```typescript
{
  businessId: ObjectId,
  userId: string,
  whatsappBusinessAccountId: string,  // WABA ID
  phoneNumberId: string,               // CRITICAL: Used for API calls
  phoneNumber: string,                 // Display number
  displayName: string,                 // Business name
  accessToken: string,                 // ENCRYPTED
  tokenType: 'permanent',
  status: 'active',
  qualityRating: string,
  verificationStatus: string,
  connectedAt: Date
}
```

### Step 6: Verify Status (Optional)

Location: `app/api/whatsapp/phone-status/route.ts`

```bash
GET /api/whatsapp/phone-status?businessId=xxx
```

Returns:
```json
{
  "success": true,
  "data": {
    "phoneNumberId": "123456789",
    "displayPhoneNumber": "+1234567890",
    "verifiedName": "My Business",
    "verificationStatus": "VERIFIED",
    "qualityRating": "GREEN",
    "isVerified": true,
    "isHealthy": true,
    "status": "active"
  }
}
```

---

## File Structure

```
app/
├── onboarding/
│   └── page.tsx                              # Loads Facebook SDK
├── components/onboarding/
│   ├── WhatsAppSetupStep.tsx                 # Step 3 of onboarding
│   └── WhatsAppConnectButton.tsx             # Launches embedded signup
├── api/
│   ├── meta/
│   │   └── exchange-token/route.ts           # Exchanges code for token
│   └── whatsapp/
│       └── phone-status/route.ts             # Checks phone status
├── models/
│   ├── Business.ts
│   └── BusinessWhatsAppAccount.ts            # WhatsApp credentials storage
└── lib/
    └── services/
        └── EncryptionService.ts              # Token encryption
```

---

## Security Best Practices

### 1. Token Encryption

**ALWAYS** encrypt access tokens before storing:

```typescript
import { EncryptionService } from '@/lib/services/EncryptionService';

// Encrypt before saving
const encryptedToken = EncryptionService.encrypt(accessToken);
await BusinessWhatsAppAccount.create({ accessToken: encryptedToken });

// Decrypt when using
const decryptedToken = EncryptionService.decrypt(account.accessToken);
```

### 2. Business Ownership Verification

**ALWAYS** verify the user owns the business before allowing WhatsApp connection:

```typescript
const business = await Business.findById(businessId);
if (business.userId !== session.user.id) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

### 3. Never Expose Tokens to Frontend

- Use encrypted storage
- Only decrypt server-side
- Use environment variables for app secrets
- Never log tokens in production

---

## Testing the Flow

### 1. Development Testing

1. Start the dev server:
   ```bash
   pnpm dev
   ```

2. Go to `/onboarding` in your browser

3. Navigate to Step 3 (WhatsApp Setup)

4. Open browser console (F12) for detailed logs

5. Click "חבר וואטסאפ עסקי" (Connect WhatsApp Business)

6. Complete the embedded signup flow:
   - Login with Facebook
   - Select/Create Business Portfolio
   - Add phone number
   - Verify with OTP

7. Check console logs for:
   - ✅ Facebook SDK initialized
   - ✅ Got auth code
   - ✅ WhatsApp connected successfully
   - ✅ Phone Status: {...}

### 2. Verify in Database

```javascript
// Check BusinessWhatsAppAccount collection
db.business_whatsapp_accounts.findOne({ businessId: ObjectId("...") })
```

Expected fields:
- `phoneNumberId`: Set
- `whatsappBusinessAccountId`: Set
- `accessToken`: Encrypted string
- `status`: "active"
- `tokenType`: "permanent"

### 3. Test Phone Status API

```bash
curl http://localhost:3000/api/whatsapp/phone-status?businessId=YOUR_BUSINESS_ID
```

---

## Common Issues & Solutions

### Issue 1: "Facebook SDK not loaded"

**Cause**: SDK script not loaded or blocked

**Solution**:
- Check browser console for script loading errors
- Verify `NEXT_PUBLIC_FACEBOOK_APP_ID` is set
- Clear cache and reload

### Issue 2: "META_CONFIGURATION_ID not configured"

**Cause**: Missing embedded signup configuration ID

**Solution**:
1. Go to Meta App Dashboard > WhatsApp > Configuration
2. Create embedded signup configuration
3. Copy Configuration ID to `.env`
4. Restart dev server

### Issue 3: "No WhatsApp Business Account found"

**Cause**: User didn't complete the embedded signup flow

**Solution**:
- User must complete ALL steps in the popup
- Don't close popup early
- Ensure phone number is verified with OTP

### Issue 4: "Phone number not verified"

**Cause**: User didn't enter OTP or verification failed

**Solution**:
- User needs to complete OTP verification in Meta's flow
- Check phone number can receive SMS
- Try voice call option if SMS fails

### Issue 5: "Quality rating is RED"

**Cause**: Phone number has been flagged for spam or violations

**Solution**:
- Use a different phone number
- Review WhatsApp Commerce Policy
- Contact Meta support for review

---

## Phone Number Requirements

### Valid Phone Numbers

✅ **Can use:**
- New phone number (never used with WhatsApp)
- Number not registered in WhatsApp app
- Virtual/VoIP numbers (some restrictions apply)
- Land line numbers

❌ **Cannot use:**
- Number already in WhatsApp personal app
- Number already in WhatsApp Business app
- Number registered to another WABA

### Verification Process

1. **SMS Verification** (Recommended)
   - Enter phone number
   - Receive 6-digit code via SMS
   - Enter code in popup

2. **Voice Call Verification** (Alternative)
   - Request voice call
   - Receive automated call with code
   - Enter code in popup

---

## API Endpoints Reference

### POST /api/meta/exchange-token

Exchanges authorization code for access token and sets up WhatsApp account.

**Request:**
```json
{
  "code": "authorization_code_from_facebook",
  "businessId": "mongodb_business_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "whatsappAccountId": "...",
    "phoneNumber": "+1234567890",
    "displayName": "My Business"
  },
  "message": "WhatsApp connected successfully"
}
```

### GET /api/whatsapp/phone-status

Checks the current status of a registered phone number.

**Query Parameters:**
- `businessId`: MongoDB business ID

**Response:**
```json
{
  "success": true,
  "data": {
    "phoneNumberId": "123456789",
    "displayPhoneNumber": "+1234567890",
    "verifiedName": "My Business",
    "verificationStatus": "VERIFIED",
    "qualityRating": "GREEN",
    "accountMode": "LIVE",
    "isVerified": true,
    "isHealthy": true,
    "status": "active",
    "connectedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## Debugging Checklist

When troubleshooting WhatsApp onboarding:

- [ ] Facebook SDK loaded (`window.FB` exists)
- [ ] `NEXT_PUBLIC_FACEBOOK_APP_ID` set correctly
- [ ] `NEXT_PUBLIC_META_CONFIGURATION_ID` set correctly
- [ ] User completes full embedded signup flow
- [ ] Phone number verified with OTP
- [ ] Authorization code received from Facebook
- [ ] Token exchange successful
- [ ] WABA and phone number fetched from API
- [ ] Access token encrypted and stored
- [ ] `BusinessWhatsAppAccount` created in database
- [ ] Webhooks subscribed (optional, can fail without breaking flow)

---

## Multi-Tenant Architecture

### How It Works

1. **Your Meta App** = Master app that hosts all businesses
2. **Each Business** = Gets their own WABA (WhatsApp Business Account)
3. **Each WABA** = Can have multiple phone numbers (usually 1)
4. **Token Storage** = Each business's token encrypted separately

### Benefits

- ✅ Single Meta app to manage
- ✅ Automated onboarding for customers
- ✅ No manual phone number setup
- ✅ Each business isolated
- ✅ Secure token management

---

## Next Steps

After successful WhatsApp connection:

1. ✅ Business can send/receive messages
2. ✅ Webhooks receive incoming messages
3. ✅ Message templates can be created
4. ✅ Business profile can be updated

---

## Additional Resources

### Official Documentation
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Embedded Signup](https://developers.facebook.com/docs/whatsapp/embedded-signup)
- [Phone Number Registration](https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers)

### Sources from Research
- [Embedded Signup - Chatwoot Developer Docs](https://developers.chatwoot.com/self-hosted/configuration/features/integrations/whatsapp-embedded-signup)
- [WhatsApp Embedded Signup - Braze](https://www.braze.com/docs/user_guide/message_building_by_channel/whatsapp/overview/embedded_signup)
- [Setting up WhatsApp Embedded Flow - Bird API](https://docs.bird.com/api/channels-api/supported-channels/programmable-whatsapp/whatsapp-isv-integration/whatsapp-channel-onboarding/setting-up-the-whatsapp-embedded-flow)
- [How to Register Phone Number - Stack Overflow](https://stackoverflow.com/questions/79125415/how-to-register-phone-number-in-new-whatsapp-cloud-api)
- [Embedded Signup Guide - Frejun](https://frejun.com/whatsapp-business-embedded-signup-guide/)

---

**Last Updated**: December 4, 2025
**Tested With**: WhatsApp Cloud API v22.0
