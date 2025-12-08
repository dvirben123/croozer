# Meta Embedded Signup Configuration Setup Guide

## Error: "Invalid parameter: config_id is required"

This error occurs when the `config_id` passed to `FB.login()` doesn't match a valid Embedded Signup configuration in your Meta App.

## Step-by-Step Setup

### 1. Access Meta Developer Portal

Go to: https://developers.facebook.com/apps/

Select your app: **App ID 1284378939762336**

### 2. Navigate to WhatsApp Product

1. In the left sidebar, click **WhatsApp**
2. Click **Configuration** (or **Getting Started**)

### 3. Find Embedded Signup Section

Look for one of these sections:
- **Embedded Signup**
- **Configuration Builder**
- **Signup Configuration**

### 4. Create Configuration

#### Option A: If you see "Embedded Signup" section:

1. Click **"Create Configuration"** or **"Add Configuration"**
2. Fill in the form:

   **Configuration Name**: `Production Embedded Signup`

   **Redirect URL**: `https://monitors-wearing-mention-ways.trycloudflare.com/onboarding`

   (Also add: `http://localhost:3000/onboarding` for local testing)

   **Prefill Business Info**: Toggle ON

   **Prefill WABA**: Toggle OFF (let user create new WABA)

   **Phone Number Selection**: Toggle ON

3. Click **Create** or **Save**

4. **COPY THE CONFIGURATION ID** - This is the number you need!

#### Option B: If you see a different interface:

The Meta Developer Portal UI changes frequently. Look for:

1. **WhatsApp** → **API Setup** → **Embedded Signup**
2. Or: **WhatsApp** → **Getting Started** → **Embedded Signup Builder**
3. Or: Check under **App Settings** → **Basic** → Look for WhatsApp configuration

### 5. Verify Configuration ID

The Configuration ID should be a number like:
- ✅ `1354573019417648` (this is what you have in FACEBOOK_CONFIGURATION)
- ❌ `71488981` (this might not exist)

### 6. Alternative: Use Business Configuration ID

If you can't find "Embedded Signup" configuration:

1. Go to **Meta Business Manager**: https://business.facebook.com/
2. Click **Business Settings**
3. Under **Accounts**, click **WhatsApp Business Accounts**
4. Select your WABA or create one
5. Look for **Configuration ID** or **Business Portfolio ID**

### 7. Update Environment Variable

Update `.env` with the correct Configuration ID:

```env
NEXT_PUBLIC_META_CONFIGURATION_ID=1354573019417648
```

Or use the one from your existing `FACEBOOK_CONFIGURATION` variable.

### 8. Restart Dev Server

```bash
# Stop the server (Ctrl+C)
pnpm dev
```

## Troubleshooting

### Error: "It looks like this app isn't available"

**Causes**:
1. Configuration ID doesn't exist
2. Configuration ID belongs to a different app
3. App doesn't have WhatsApp product enabled
4. App is in Development Mode and you're not a tester

**Solutions**:

#### Check App Mode
1. Go to: https://developers.facebook.com/apps/1284378939762336/settings/basic/
2. Check if app is in **Development Mode** or **Live Mode**
3. If in Development Mode, add your Facebook account as a tester:
   - **Roles** → **Test Users** → Add your Facebook account

#### Verify WhatsApp Product
1. Go to your app dashboard
2. Check if **WhatsApp** is listed under **Products**
3. If not, click **Add Product** → **WhatsApp**

#### Check Configuration Ownership
1. The Configuration ID must belong to YOUR app (1284378939762336)
2. If you copied it from documentation, it won't work
3. You must create your own configuration

### Error: "config_id is required"

This means the `config_id` parameter is empty or undefined.

**Check**:
```javascript
// In browser console when on /onboarding
console.log(process.env.NEXT_PUBLIC_META_CONFIGURATION_ID)
```

If it shows `undefined`:
1. Check `.env` file has `NEXT_PUBLIC_META_CONFIGURATION_ID=...`
2. Restart dev server
3. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

### Configuration Not Found in Meta Portal

If you can't find the Embedded Signup configuration section:

1. **Check WhatsApp Product Version**:
   - Go to **WhatsApp** in left sidebar
   - Look for version number (should be v22.0 or higher)
   - If old version, try updating the product

2. **Use Alternative Method**:
   Instead of Embedded Signup, you can use direct phone number registration:
   - Go to **WhatsApp** → **API Setup**
   - Click **Add Phone Number**
   - Follow manual setup process

3. **Contact Meta Support**:
   - If Embedded Signup is not available for your app
   - Check if your Business Verification is complete
   - Some features require Business Verification

## What the Configuration ID Controls

The Configuration ID tells Meta:
- Which app is requesting access
- What permissions to request
- Where to redirect after signup
- What data to prefill
- Which business portfolio to use

## Testing the Configuration

After setting the correct Configuration ID:

1. **Test in Browser Console**:
   ```javascript
   // Should show your config ID
   console.log(process.env.NEXT_PUBLIC_META_CONFIGURATION_ID)
   ```

2. **Test FB.login**:
   ```javascript
   FB.login((response) => {
     console.log('Response:', response);
   }, {
     config_id: '1354573019417648', // Your actual config ID
     response_type: 'code',
     override_default_response_type: true
   });
   ```

3. **Check Network Tab**:
   - Open DevTools → Network
   - Click "חבר וואטסאפ עסקי"
   - Look for request to `facebook.com/dialog/oauth`
   - Check if `config_id` parameter is present in URL

## Next Steps

Once you have the correct Configuration ID:

1. Update `.env`:
   ```env
   NEXT_PUBLIC_META_CONFIGURATION_ID=YOUR_ACTUAL_CONFIG_ID
   ```

2. Restart server:
   ```bash
   pnpm dev
   ```

3. Test signup flow:
   - Navigate to `/onboarding`
   - Click WhatsApp connect button
   - Should open Meta signup popup

## Quick Fix (If Desperate)

If you can't find or create the configuration, try using the value from `FACEBOOK_CONFIGURATION`:

```env
NEXT_PUBLIC_META_CONFIGURATION_ID=1354573019417648
```

This is already in your `.env` file as `FACEBOOK_CONFIGURATION`, so it might be the correct value.

---

**Last Updated**: December 8, 2025
