# WhatsApp Embedded Signup Fix Summary

## Problem
Error: "Invalid parameter: config_id is required" when trying to connect WhatsApp during onboarding.

## Root Cause
The `NEXT_PUBLIC_META_CONFIGURATION_ID` was set to `71488981` which doesn't exist or isn't properly configured in your Meta App.

## Solution Applied

### 1. Updated Configuration ID

Changed `.env` file:

```env
# OLD (incorrect):
NEXT_PUBLIC_META_CONFIGURATION_ID=71488981

# NEW (using existing FACEBOOK_CONFIGURATION value):
NEXT_PUBLIC_META_CONFIGURATION_ID=1354573019417648
```

### 2. Added System User Token

Added the missing variable that the backend needs:

```env
META_SYSTEM_USER_TOKEN=EAASQIsZA2JqABPkGxIVVsPl4K0Oj9EA4ZCKj0qA12wWTk7VPakj2XjQTi6G9AxaYsRPItzWZBYdMsFP6ACR4d4xbKsyxJRBlhBtSo7nYR10E0f87CbNb2lEJPcNZCXvfYzmsdMOlCZCsX55PkwP3ZBn4cklnxoZCzrwpoGRg3ptEdu6NycWFZBkaZBlTAtdA74ZCkKKgZDZD
```

### 3. Enhanced Error Messages

Updated [WhatsAppConnectButton.tsx](app/components/onboarding/WhatsAppConnectButton.tsx) with:
- Better console logging
- Alert messages if configuration is missing
- Check for Facebook SDK before launching signup

## Next Steps

### CRITICAL: Restart Dev Server

```bash
# Stop the current dev server (Ctrl+C or Cmd+C)
pnpm dev
```

**Why?** Environment variables starting with `NEXT_PUBLIC_` are embedded at build time. You MUST restart the server for changes to take effect.

### Test the Flow

1. **Hard Refresh Browser**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Open Browser Console** (F12)

3. **Navigate to** `/onboarding`

4. **Complete steps** 0-1 (Business Details, Category)

5. **Check Debug Info** (bottom of WhatsApp step):
   - SDK: ✅ Loaded
   - Config: ✅ Set
   - Business ID: ✅ Set

6. **Click** "חבר וואטסאפ עסקי"

7. **Watch Console Logs**:
   ```
   📋 Configuration Check:
     - Config ID: 1354573019417648
     - App ID: 1284378939762336
     - Business ID: 6931...
     - FB SDK Loaded: true
   ```

### Expected Behavior

The Facebook login popup should open WITHOUT the error "Invalid parameter: config_id is required".

### If Still Getting Error

The configuration ID `1354573019417648` might also be invalid. You need to:

1. **Go to Meta Developer Portal**: https://developers.facebook.com/apps/1284378939762336/

2. **Navigate to**: WhatsApp → Configuration → Embedded Signup

3. **Create New Configuration** or **Copy Existing Configuration ID**

4. **Update `.env`** with the correct ID

5. **Restart dev server** again

See [META-EMBEDDED-SIGNUP-CONFIG-SETUP.md](META-EMBEDDED-SIGNUP-CONFIG-SETUP.md) for detailed instructions.

## Alternative: Manual Configuration Check

If you want to verify which configuration IDs exist for your app:

### Method 1: Meta Developer Portal
1. Go to https://developers.facebook.com/apps/1284378939762336/
2. Click **WhatsApp** in left sidebar
3. Look for **Configuration** or **Embedded Signup** section
4. List of configurations should be visible

### Method 2: Check Your App Settings
1. Go to https://developers.facebook.com/apps/1284378939762336/settings/basic/
2. Scroll down to look for **WhatsApp** or **Business Configuration**
3. Look for Configuration ID or similar field

### Method 3: Ask Your Team
If someone else set up the WhatsApp integration, they should have the correct Configuration ID.

## Files Modified

1. [.env](.env) - Updated configuration ID and added system user token
2. [app/components/onboarding/WhatsAppConnectButton.tsx](app/components/onboarding/WhatsAppConnectButton.tsx) - Enhanced logging

## Documentation Created

1. [META-EMBEDDED-SIGNUP-CONFIG-SETUP.md](META-EMBEDDED-SIGNUP-CONFIG-SETUP.md) - How to create/find configuration ID
2. [WHATSAPP-EMBEDDED-SIGNUP-FLOW.md](WHATSAPP-EMBEDDED-SIGNUP-FLOW.md) - Complete flow documentation
3. [META-SYSTEM-USER-TOKEN-SETUP.md](META-SYSTEM-USER-TOKEN-SETUP.md) - System user token setup

## Quick Debug Checklist

Run these checks if the error persists:

- [ ] Dev server restarted after `.env` changes
- [ ] Browser hard refreshed (Cmd/Ctrl + Shift + R)
- [ ] Console shows correct Config ID (1354573019417648)
- [ ] Console shows FB SDK Loaded: true
- [ ] No TypeScript/build errors in terminal
- [ ] Configuration ID exists in Meta Developer Portal
- [ ] App is in correct mode (Development vs Live)
- [ ] Your Facebook account is added as tester (if app in Development mode)

---

**Last Updated**: December 8, 2025
