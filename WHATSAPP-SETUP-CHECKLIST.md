# WhatsApp Onboarding Setup Checklist

## ✅ Pre-Implementation Checklist

Before testing the WhatsApp onboarding flow, complete these steps:

### 1. Meta Business Platform Setup

- [ ] **Create Meta Business Manager**
  - Go to https://business.facebook.com/
  - Create or select a business manager

- [ ] **Create WhatsApp Business App**
  - Go to https://developers.facebook.com/apps/
  - Create a new app
  - Select "Business" as app type
  - Add "WhatsApp" product

- [ ] **Generate System User Token** ⚠️ CRITICAL
  - Go to Business Settings > Users > System Users
  - Create a new system user (e.g., "Croozer WhatsApp API")
  - Assign **Admin** role
  - Generate permanent token with permissions:
    - `whatsapp_business_management`
    - `whatsapp_business_messaging`
    - `business_management`
  - Assign your Meta App to the system user with **Full Control**
  - Copy token (you'll need this for `META_SYSTEM_USER_TOKEN`)
  - **See**: `META-SYSTEM-USER-TOKEN-SETUP.md` for detailed guide

### 2. Embedded Signup Configuration

- [ ] **Create Embedded Signup Config** ⚠️ CRITICAL
  - Go to your app in Meta Developer Portal
  - Navigate to: **WhatsApp > Configuration > Embedded Signup**
  - Click "Create Configuration"
  - Fill in required fields:
    - **Configuration Name**: "Production Embedded Signup" (or similar)
    - **Redirect URL**: Your app's callback URL
    - **Business Verification**: Enable if required
  - Click "Create"
  - **Copy the Configuration ID** - You need this for `.env`

### 3. Environment Variables Configuration

- [ ] **Update `.env` file** with the following:

```env
# ⚠️ CRITICAL: System User Token (Required for Embedded Signup)
# Get this from: Meta Business Manager > System Users > Generate Token
# See: META-SYSTEM-USER-TOKEN-SETUP.md for detailed setup guide
META_SYSTEM_USER_TOKEN=<your_permanent_system_user_token>

# WhatsApp Business App
META_APP_ID=1284378939762336  # Already set
META_APP_SECRET=b49d4d80a44a61481f99706961ee6719  # Already set

# ⚠️ CRITICAL: Embedded Signup Configuration
# Get this from: Meta Developer Portal > Your App > WhatsApp > Configuration > Embedded Signup
NEXT_PUBLIC_META_CONFIGURATION_ID=<your_embedded_signup_config_id>

# Security - Token Encryption (Already set)
ENCRYPTION_KEY=9cf7fc399c4d871a888f88d587d98675edafea91d22735eb47c82b4c60b8961e
ENCRYPTION_IV=a30674f855645fdca451e4775affa089

# Webhook Configuration (Already set)
WEBHOOK_VERIFY_TOKEN=f9ad8f287b3b25a4b597e1737093eaba31bd53fd024bc4677605c1ef1e7461e4
NEXT_PUBLIC_WEBHOOK_URL=https://your-domain.com/api/webhooks/whatsapp

# Facebook SDK (Already set)
NEXT_PUBLIC_FACEBOOK_APP_ID=1284378939762336
FACEBOOK_APP_ID=1284378939762336
FACEBOOK_APP_SECRET=b49d4d80a44a61481f99706961ee6719
```

### 4. Database Setup

- [ ] **Ensure MongoDB is running**
  ```bash
  # Connection string should be in .env
  MONGODB_URI=mongodb+srv://...
  ```

- [ ] **Verify collections exist**
  - `businesses` - For business records
  - `business_whatsapp_accounts` - For WhatsApp credentials (will be created automatically)

### 5. Verify File Structure

- [ ] **Backend API Routes**
  - ✅ `app/api/meta/register-whatsapp/route.ts` - Register WhatsApp from embedded signup
  - ✅ `app/api/meta/exchange-token/route.ts` - Legacy token exchange (deprecated)
  - ✅ `app/api/whatsapp/phone-status/route.ts` - Phone status check

- [ ] **Frontend Components**
  - ✅ `app/onboarding/page.tsx` - Loads Facebook SDK
  - ✅ `app/components/onboarding/WhatsAppSetupStep.tsx` - Step 3
  - ✅ `app/components/onboarding/WhatsAppConnectButton.tsx` - Connect button

- [ ] **Database Models**
  - ✅ `app/models/Business.ts` - Business model
  - ✅ `app/models/BusinessWhatsAppAccount.ts` - WhatsApp account model

- [ ] **Services**
  - ✅ `app/lib/services/EncryptionService.ts` - Token encryption

---

## 🧪 Testing Checklist

### Before Testing

- [ ] All environment variables are set (especially `NEXT_PUBLIC_META_CONFIGURATION_ID`)
- [ ] Development server is running (`pnpm dev`)
- [ ] MongoDB is connected
- [ ] Browser console is open (F12) for logs

### During Testing

- [ ] Navigate to `/onboarding`
- [ ] Complete Steps 0-1 (Business Details, Category)
- [ ] Navigate to Step 2 (WhatsApp Setup)
- [ ] Check console for: `✅ Facebook SDK initialized for WhatsApp Embedded Signup`
- [ ] Verify debug info shows:
  - SDK: ✅ Loaded
  - Config: ✅ Set
  - Business ID: ✅ Set
- [ ] Click "חבר וואטסאפ עסקי" (Connect WhatsApp Business)
- [ ] Embedded signup popup appears at `business.facebook.com`
- [ ] Login with Facebook account
- [ ] Select or create Meta Business Portfolio
- [ ] Create or select WhatsApp Business Account
- [ ] Enter phone number (must not be already registered with WhatsApp)
- [ ] Verify phone number with OTP (SMS or Voice)
- [ ] Complete the signup flow
- [ ] Popup closes automatically
- [ ] Check console for success messages:
  - `✅ Signup completed: { phone_number_id: '...', waba_id: '...' }`
  - `🔄 Registering WhatsApp with backend...`
  - `✅ WhatsApp registered successfully`
  - `📱 Phone Status: {...}`

### After Testing

- [ ] **Verify in Database**
  ```javascript
  // Check business_whatsapp_accounts collection
  db.business_whatsapp_accounts.findOne({ businessId: ObjectId("...") })
  ```

  Expected fields:
  - `phoneNumberId`: Set to WhatsApp phone number ID
  - `whatsappBusinessAccountId`: Set to WABA ID
  - `phoneNumber`: Display phone number (e.g., "+1234567890")
  - `displayName`: Business name
  - `accessToken`: Encrypted string
  - `tokenType`: "permanent"
  - `status`: "active"
  - `connectedAt`: Timestamp

- [ ] **Test Phone Status API**
  ```bash
  curl http://localhost:3000/api/whatsapp/phone-status?businessId=<business_id>
  ```

  Expected response:
  ```json
  {
    "success": true,
    "data": {
      "isVerified": true,
      "isHealthy": true,
      "verificationStatus": "VERIFIED",
      "qualityRating": "GREEN",
      "status": "active"
    }
  }
  ```

- [ ] **Verify in Meta Dashboard**
  - Go to https://business.facebook.com/
  - Check WhatsApp Manager
  - Verify new phone number is listed
  - Check quality rating

---

## 🚨 Troubleshooting

### Error: "Facebook SDK not loaded"

**Cause**: Script not loaded or blocked

**Fix**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_FACEBOOK_APP_ID` is set
3. Clear browser cache
4. Reload page

### Error: "META_CONFIGURATION_ID not configured"

**Cause**: Missing embedded signup configuration

**Fix**:
1. Go to Meta Developer Portal
2. Your App > WhatsApp > Configuration > Embedded Signup
3. Create configuration
4. Copy Configuration ID
5. Add to `.env` as `NEXT_PUBLIC_META_CONFIGURATION_ID`
6. Restart dev server (`pnpm dev`)

### Error: "No WhatsApp Business Account found"

**Cause**: User didn't complete the embedded signup flow

**Fix**:
- Don't close popup early
- Complete ALL steps in the flow
- Verify phone number with OTP

### Error: "Phone number not verified"

**Cause**: OTP verification failed or skipped

**Fix**:
- Re-enter phone number
- Request new OTP
- Try voice call option if SMS fails
- Ensure phone number can receive SMS

### Error: "Token exchange failed"

**Cause**: Authorization code expired or invalid

**Fix**:
- Try the flow again
- Check `META_APP_ID` and `META_APP_SECRET` are correct
- Verify app has WhatsApp permissions

### Warning: "Phone number quality rating is RED"

**Cause**: Phone number flagged for spam/violations

**Fix**:
- Use a different phone number
- Review WhatsApp Commerce Policy
- Contact Meta support for review

---

## 📋 Validation Criteria

For onboarding to be considered **successful**, verify:

### Database Validation

- ✅ `BusinessWhatsAppAccount` document exists
- ✅ `businessId` matches the business
- ✅ `phoneNumberId` is set (not empty)
- ✅ `whatsappBusinessAccountId` is set (not empty)
- ✅ `phoneNumber` matches what user entered
- ✅ `accessToken` is encrypted (long random string)
- ✅ `status` is "active"
- ✅ `tokenType` is "permanent"
- ✅ `connectedAt` timestamp is present

### API Validation

- ✅ Phone status endpoint returns success
- ✅ `isVerified` is true
- ✅ `isHealthy` is true
- ✅ `qualityRating` is GREEN or YELLOW (not RED)
- ✅ `verificationStatus` is "VERIFIED"

### Meta Dashboard Validation

- ✅ Phone number appears in WhatsApp Manager
- ✅ Business Portfolio is created/selected
- ✅ WABA is created/selected
- ✅ Phone number shows "Active" status
- ✅ Display name is set correctly

---

## 🎯 Success Criteria

Onboarding is complete when:

1. ✅ User completes embedded signup flow
2. ✅ Phone number is verified with OTP
3. ✅ Authorization code is exchanged for token
4. ✅ WABA and phone details are fetched
5. ✅ Access token is encrypted and stored
6. ✅ `BusinessWhatsAppAccount` is created
7. ✅ Phone status check returns healthy status
8. ✅ User can proceed to next onboarding step

---

## 📞 Support Resources

### Meta Support
- [WhatsApp Support](https://www.facebook.com/business/help)
- [Developer Forums](https://developers.facebook.com/community/)

### Documentation
- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Embedded Signup Guide](https://developers.facebook.com/docs/whatsapp/embedded-signup)
- [Phone Number Management](https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers)

### Internal Docs
- `WHATSAPP-ONBOARDING-SETUP.md` - Complete implementation guide
- `.cursor/rules/whatsapp-api.mdc` - Project rules and guidelines

---

**Last Updated**: December 4, 2025
