# WhatsApp Connect Button Troubleshooting

## Issue: Button Click Does Nothing

### Quick Checklist

1. **Open Browser Console (F12)** - Look for debug logs starting with 🚀, ✅, or ❌

2. **Check Debug Panel** (in development mode) - Shows:
   - SDK Status
   - Config ID Status
   - Business ID Status

### Common Issues & Solutions

#### 1. Facebook SDK Not Loaded ❌

**Symptoms:**
- Debug panel shows "SDK: ❌ Not Loaded"
- Console shows "Facebook SDK not loaded"

**Solutions:**
- Refresh the page
- Check if `NEXT_PUBLIC_FACEBOOK_APP_ID` is set in `.env`
- Check browser console for SDK loading errors
- Verify network connection (SDK loads from Facebook CDN)

**To Fix:**
```bash
# Check .env file has:
NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id_here
```

#### 2. Configuration ID Missing ❌

**Symptoms:**
- Debug panel shows "Config: ❌ Missing"
- Console shows "META_CONFIGURATION_ID not configured"

**Solutions:**
- Add `NEXT_PUBLIC_META_CONFIGURATION_ID` to `.env`
- Get Configuration ID from Meta Business Manager

**To Fix:**
```bash
# Add to .env:
NEXT_PUBLIC_META_CONFIGURATION_ID=your_config_id_here
```

**How to Get Configuration ID:**
1. Go to https://business.facebook.com/
2. Navigate to Business Settings > WhatsApp Manager
3. Click on "Embedded Signup"
4. Copy the Configuration ID

#### 3. Business ID Missing ❌

**Symptoms:**
- Debug panel shows "Business ID: ❌ Missing"
- Yellow warning: "חסר מזהה עסק"

**Solutions:**
- Go back to Step 1 (Business Details)
- Fill in all required fields
- Click "Continue" to save
- Return to WhatsApp Setup step

**Root Cause:**
The onboarding context doesn't have `businessId` yet. This happens when:
- User skipped Step 1
- Step 1 didn't save properly
- Business wasn't created in database

#### 4. Button Disabled

**Symptoms:**
- Button is grayed out
- Can't click it

**Reasons:**
- SDK still loading (wait a few seconds)
- Already connecting (isLoading = true)

#### 5. Popup Blocked

**Symptoms:**
- Button clicks but nothing happens
- No console errors

**Solutions:**
- Check if browser blocked the popup
- Allow popups for this site
- Try clicking again

### Debug Logs Explained

When you click the button, you should see:

```
🚀 Launching WhatsApp Signup...
SDK Loaded: true
window.FB: true
Business ID: 507f1f77bcf86cd799439011
Config ID: ✅ Set
📞 Calling FB.login with config: { config_id: "...", businessId: "..." }
```

If successful:
```
📥 FB.login response: { authResponse: { code: "..." } }
✅ Got auth code: AQD...
```

If cancelled:
```
❌ User cancelled login or did not fully authorize.
```

### Manual Test

Run this in browser console to test SDK:

```javascript
// Check if SDK loaded
console.log('FB SDK:', typeof window.FB);

// Check config
console.log('Config ID:', process.env.NEXT_PUBLIC_META_CONFIGURATION_ID);

// Test FB.login (will open popup)
if (window.FB) {
  window.FB.login(
    (response) => console.log('Response:', response),
    { scope: 'public_profile,email' }
  );
}
```

### Environment Variables Required

```bash
# .env file must have:

# Facebook App ID (for SDK)
NEXT_PUBLIC_FACEBOOK_APP_ID=123456789012345

# Meta Configuration ID (for Embedded Signup)
NEXT_PUBLIC_META_CONFIGURATION_ID=987654321098765

# Backend Meta credentials (not needed for button click)
META_APP_ID=123456789012345
META_APP_SECRET=abc123def456...
META_SYSTEM_USER_ACCESS_TOKEN=EAABsb...
```

### Still Not Working?

1. **Clear browser cache** and refresh
2. **Try incognito/private mode**
3. **Check Facebook App Status**:
   - Go to https://developers.facebook.com/apps/
   - Verify app is not in Development Mode restrictions
   - Check if WhatsApp Business Management permission is granted
4. **Verify Meta Business Account**:
   - You must be an admin of the Meta Business Account
   - Business account must be verified
5. **Check browser compatibility**:
   - Use Chrome, Firefox, or Edge (latest versions)
   - Safari may have issues with third-party cookies

### Development vs Production

**Development:**
- Shows debug panel with status indicators
- Detailed console logs
- Can test with Meta test numbers

**Production:**
- No debug panel
- Minimal console logs
- Requires verified business account

### Next Steps After Successful Connection

1. User completes Meta's Embedded Signup flow
2. Meta redirects back with authorization code
3. Code is exchanged for access token via `/api/meta/exchange-token`
4. Token is encrypted and stored in database
5. WhatsApp account is linked to business
6. User can proceed to next onboarding step

### API Endpoint Status

Check if the backend endpoint exists:

```bash
# Should exist:
app/api/meta/exchange-token/route.ts
```

If missing, the button will work but token exchange will fail.

### Contact Support

If none of the above works, provide:
- Browser console logs (F12 > Console tab)
- Network tab showing failed requests (F12 > Network tab)
- Screenshot of debug panel
- Your `.env` file (WITHOUT sensitive values)

---

**Last Updated:** 2025-11-20  
**Related Files:**
- `app/components/onboarding/WhatsAppConnectButton.tsx`
- `app/components/onboarding/WhatsAppSetupStep.tsx`
- `app/layout.tsx` (Facebook SDK initialization)
- `app/api/meta/exchange-token/route.ts`






