# WhatsApp Embedded Signup Flow - Implementation Guide

## Overview

This document explains how the WhatsApp Embedded Signup flow works in the Croozer application, following Meta's official documentation and best practices.

## Flow Architecture

The implementation follows Meta's recommended dual-channel approach:

1. **FB.login()** - Returns OAuth `code` for token exchange
2. **postMessage** - Returns `phone_number_id` and `waba_id` for session info

Both channels are used together to create a complete registration flow.

## Step-by-Step Flow

### 1. User Initiates Signup

**Location**: [app/components/onboarding/WhatsAppConnectButton.tsx:39-150](app/components/onboarding/WhatsAppConnectButton.tsx#L39-L150)

```typescript
const launchWhatsAppSignup = () => {
  // Set up postMessage listener
  window.addEventListener('message', messageHandler);

  // Launch FB.login with config
  window.FB.login(fbLoginCallback, {
    config_id: configId,
    response_type: 'code',
    override_default_response_type: true,
    extras: {
      setup: { business: { id: businessId } },
      sessionInfoVersion: '3',
      version: 'v3'
    }
  });
};
```

**What happens**:
- Facebook SDK opens embedded signup popup
- User logs in with Facebook
- User creates/selects WhatsApp Business Account
- User registers phone number
- User verifies phone with OTP (SMS/Voice)

### 2. Receive Session Info (postMessage)

**Event Type**: `WA_EMBEDDED_SIGNUP`

**Possible Events**:

#### FINISH Event
```typescript
{
  type: 'WA_EMBEDDED_SIGNUP',
  event: 'FINISH',
  data: {
    phone_number_id: '123456789',
    waba_id: '987654321'
  }
}
```

#### CANCEL Event
```typescript
{
  type: 'WA_EMBEDDED_SIGNUP',
  event: 'CANCEL',
  data: {
    current_step: 'phone_verification' // or other step
  }
}
```

#### ERROR Event
```typescript
{
  type: 'WA_EMBEDDED_SIGNUP',
  event: 'ERROR',
  data: {
    error_message: 'Phone number already registered'
  }
}
```

### 3. Receive OAuth Code (FB.login callback)

```typescript
const fbLoginCallback = (response) => {
  if (response.authResponse) {
    const code = response.authResponse.code;
    // code is ready to exchange for access token
  }
};
```

### 4. Combine and Send to Backend

**Frontend combines**:
- `code` (from FB.login)
- `phone_number_id` (from postMessage)
- `waba_id` (from postMessage)
- `businessId` (from component props)

**API Call**:
```typescript
POST /api/meta/register-whatsapp
{
  "code": "AQB...",
  "phoneNumberId": "123456789",
  "wabaId": "987654321",
  "businessId": "60d5ec49f..."
}
```

### 5. Backend Processing

**Location**: [app/api/meta/register-whatsapp/route.ts](app/api/meta/register-whatsapp/route.ts)

#### Step 5.1: Exchange Code for Access Token

```typescript
const tokenResponse = await fetch(
  `https://graph.facebook.com/v22.0/oauth/access_token?` +
  `client_id=${appId}&` +
  `client_secret=${appSecret}&` +
  `code=${code}`
);

const { access_token } = await tokenResponse.json();
```

#### Step 5.2: Fetch Phone Number Details

```typescript
const phoneResponse = await fetch(
  `https://graph.facebook.com/v22.0/${phoneNumberId}?` +
  `fields=id,display_phone_number,verified_name,code_verification_status,quality_rating,account_mode&` +
  `access_token=${accessToken}`
);
```

**Response Example**:
```json
{
  "id": "123456789",
  "display_phone_number": "+1234567890",
  "verified_name": "My Business",
  "code_verification_status": "VERIFIED",
  "quality_rating": "GREEN",
  "account_mode": "LIVE"
}
```

#### Step 5.3: Fetch WABA Details

```typescript
const wabaResponse = await fetch(
  `https://graph.facebook.com/v22.0/${wabaId}?` +
  `fields=id,name,timezone_id,message_template_namespace&` +
  `access_token=${accessToken}`
);
```

#### Step 5.4: Validate Phone Status

```typescript
// Check verification status
if (phoneData.code_verification_status !== 'VERIFIED') {
  console.warn('⚠️ Phone number not fully verified');
}

// Check quality rating
if (phoneData.quality_rating === 'RED') {
  console.warn('⚠️ Phone number has RED quality rating');
}
```

#### Step 5.5: Store in Database

```typescript
// Encrypt access token
const encryptedToken = EncryptionService.encrypt(accessToken);

// Create BusinessWhatsAppAccount
await BusinessWhatsAppAccount.create({
  businessId,
  userId,
  whatsappBusinessAccountId: wabaId,
  phoneNumberId,
  phoneNumber: phoneData.display_phone_number,
  displayName: phoneData.verified_name,
  accessToken: encryptedToken,
  tokenType: 'user_access',
  status: 'active',
  connectedAt: new Date()
});
```

#### Step 5.6: Subscribe to Webhooks

```typescript
await fetch(
  `https://graph.facebook.com/v22.0/${wabaId}/subscribed_apps`,
  {
    method: 'POST',
    body: JSON.stringify({
      access_token: accessToken,
      subscribed_fields: ['messages', 'message_status']
    })
  }
);
```

### 6. Frontend Success Handling

```typescript
if (result.success) {
  // Update onboarding context
  updateData({
    whatsappConnected: true,
    whatsappAccountId: result.data.whatsappAccountId
  });

  // Proceed to next step
  nextStep();
}
```

## Data Flow Diagram

```
┌─────────────┐
│   User      │
│  Clicks     │
│  Button     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  FB.login()         │
│  + postMessage      │
│  Listener           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Meta Embedded      │
│  Signup Popup       │
│  - Login            │
│  - Create WABA      │
│  - Register Phone   │
│  - Verify OTP       │
└──────┬──────────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐   ┌──────────────┐
│ postMessage  │   │ FB.login     │
│ Returns:     │   │ Callback:    │
│ - phone_id   │   │ - code       │
│ - waba_id    │   │              │
└──────┬───────┘   └──────┬───────┘
       │                  │
       └────────┬─────────┘
                │
                ▼
        ┌───────────────┐
        │ registerWhatsApp│
        │ (Frontend)      │
        └───────┬─────────┘
                │
                ▼
        ┌───────────────────┐
        │ POST /api/meta/   │
        │ register-whatsapp │
        └───────┬───────────┘
                │
                ▼
        ┌───────────────────┐
        │ Exchange code     │
        │ for access_token  │
        └───────┬───────────┘
                │
                ▼
        ┌───────────────────┐
        │ Fetch phone +     │
        │ WABA details      │
        └───────┬───────────┘
                │
                ▼
        ┌───────────────────┐
        │ Validate status   │
        │ (verification,    │
        │  quality rating)  │
        └───────┬───────────┘
                │
                ▼
        ┌───────────────────┐
        │ Encrypt & Store   │
        │ in MongoDB        │
        └───────┬───────────┘
                │
                ▼
        ┌───────────────────┐
        │ Subscribe to      │
        │ Webhooks          │
        └───────┬───────────┘
                │
                ▼
        ┌───────────────────┐
        │ Return Success    │
        └───────────────────┘
```

## Error Handling

### Frontend Errors

1. **Facebook SDK not loaded**
   ```typescript
   if (!window.FB) {
     onError?.('Facebook SDK not loaded');
   }
   ```

2. **Configuration ID missing**
   ```typescript
   if (!configId) {
     onError?.('WhatsApp configuration not found');
   }
   ```

3. **User cancelled**
   ```typescript
   if (data.event === 'CANCEL') {
     onError?.('Signup cancelled by user');
   }
   ```

4. **Embedded signup error**
   ```typescript
   if (data.event === 'ERROR') {
     onError?.(data.data.error_message);
   }
   ```

### Backend Errors

1. **Token exchange failed**
   ```typescript
   if (!tokenData.access_token) {
     return NextResponse.json({
       error: tokenData.error?.message || 'Failed to exchange token'
     });
   }
   ```

2. **No WABA found**
   ```typescript
   if (wabas.length === 0) {
     return NextResponse.json({
       error: 'No WhatsApp Business Account found'
     });
   }
   ```

3. **Phone number not verified**
   - Log warning, don't fail
   - User can complete verification later

4. **Quality rating RED**
   - Log warning, don't fail
   - User can improve quality over time

## Security Considerations

### Token Encryption

All access tokens are encrypted before storage:

```typescript
import { EncryptionService } from '@/lib/services/EncryptionService';

const encryptedToken = EncryptionService.encrypt(accessToken);
```

### Authentication

All API endpoints verify user authentication:

```typescript
const session = await getServerSession();
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Business Ownership

Verify user owns the business before connecting WhatsApp:

```typescript
const business = await Business.findById(businessId);
if (business.userId !== session.user.id) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

## Testing

### Local Testing

1. **Start dev server**
   ```bash
   pnpm dev
   ```

2. **Open browser console** (F12)

3. **Navigate to** `/onboarding`

4. **Complete steps** 0-1

5. **Click** "חבר וואטסאפ עסקי"

6. **Watch console logs**:
   ```
   🚀 Launching WhatsApp Signup...
   📩 Received message from popup
   ✅ Session info received: { phone_number_id, waba_id }
   📥 FB.login response
   ✅ Got auth code: AQB...
   🔄 Registering WhatsApp with code and session info...
   📥 Registration result
   ✅ WhatsApp registered successfully
   📱 Phone Status: { isVerified: true, ... }
   ```

### Expected Console Logs

```javascript
// Frontend (Browser Console)
🚀 Launching WhatsApp Signup...
Config ID: 71488981
App ID: 1284378939762336
📩 Received message from popup: {...}
✅ Session info received: { phone_number_id: '...', waba_id: '...' }
📥 FB.login response: { authResponse: { code: '...' } }
✅ Got auth code: AQB...
🔄 Registering WhatsApp with code and session info...
📥 Registration result: { success: true, data: {...} }
✅ WhatsApp registered successfully
📱 Phone Status: { isVerified: true, isHealthy: true }

// Backend (Server Console)
🔄 Exchanging code for access token...
✅ Access token obtained from code
📱 Registering WhatsApp with: { phoneNumberId: '...', wabaId: '...' }
📞 Phone Number Details: { display_phone_number: '+...', verified_name: '...' }
✅ WABA Details: { id: '...', name: '...' }
📱 Phone Number Validation: { verificationStatus: 'VERIFIED', qualityRating: 'GREEN' }
✅ WhatsApp account created/updated
✅ Webhook subscription successful
```

## Troubleshooting

### Issue: "Got auth code: undefined"

**Cause**: FB.login not configured correctly

**Fix**: Ensure `response_type: 'code'` and `override_default_response_type: true`

### Issue: No session info received

**Cause**: postMessage listener not set up before FB.login

**Fix**: Add listener before calling FB.login

### Issue: Token exchange failed

**Cause**: Invalid or expired code

**Fix**: Check META_APP_ID and META_APP_SECRET are correct

### Issue: Phone not verified

**Cause**: User skipped OTP verification

**Fix**: Complete OTP verification in Meta dashboard or re-run flow

## References

- [Meta Embedded Signup Documentation](https://developers.facebook.com/docs/whatsapp/embedded-signup)
- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Facebook Login for Business](https://developers.facebook.com/docs/facebook-login/facebook-login-for-business)

---

**Last Updated**: December 8, 2025
**Implementation Version**: 2.0 (Following Meta Official Documentation)
