# Meta Support Debug Information Guide

## Overview

When Meta Support asks for information about WhatsApp Embedded Signup issues, they typically need three key pieces of information:

1. **Business Manager (BM) ID** - Your Meta Business Manager ID
2. **User ID** - The Facebook User ID of the person performing the signup
3. **App ID** - Your Meta App ID

---

## How to Find Each ID

### 1. Business Manager (BM) ID

**What is it?**
Your Meta Business Manager ID is the unique identifier for your business account in Meta Business Suite.

**How to find it:**
1. Go to [Meta Business Settings](https://business.facebook.com/settings/)
2. Look at the URL - it will be like: `https://business.facebook.com/settings/info?business_id=XXXXXXXXXX`
3. The number after `business_id=` is your BM ID

**In your code:**
```bash
# Check your .env file
META_BUSINESS_MANAGER_ID=your_bm_id_here
```

**Current value:** Check your `.env` file for `META_BUSINESS_MANAGER_ID`

---

### 2. Facebook User ID

**What is it?**
The Facebook User ID is the unique identifier for the person who is clicking "Connect WhatsApp Business" and going through the embedded signup flow.

**How it's captured:**
With the updates made today, the User ID is now automatically:
- ✅ Logged to the browser console during signup
- ✅ Sent to your backend API
- ✅ Stored in the database (BusinessWhatsAppAccount collection)

**How to find it:**

#### Method 1: Check Browser Console (During Signup)
When someone goes through the WhatsApp onboarding:
1. Open browser Developer Tools (F12)
2. Go to the Console tab
3. Click "Connect WhatsApp Business"
4. Look for the box with borders that says:
   ```
   ═══════════════════════════════════════════════════════
   📋 META SUPPORT INFORMATION (for debugging):
   ═══════════════════════════════════════════════════════
   1. App ID: XXXX
   2. Facebook User ID: XXXXXXXXXXXX  ← This is what you need!
   3. Business ID (Croozer): XXXX
   4. Auth Code: XXX
   ═══════════════════════════════════════════════════════
   ```

#### Method 2: Check Server Logs (After Signup)
Look at your server logs (Node.js console or deployment logs) for:
```
═══════════════════════════════════════════════════════
📋 META SUPPORT INFORMATION (Backend):
═══════════════════════════════════════════════════════
1. Business Manager (BM) ID: XXXX
2. Facebook User ID: XXXXXXXXXXXX  ← This is what you need!
3. App ID: XXXX
...
```

#### Method 3: Check Database
Query your database:
```javascript
// MongoDB query
db.business_whatsapp_accounts.findOne(
  { businessId: "YOUR_BUSINESS_ID" },
  { facebookUserId: 1 }
)
```

---

### 3. App ID

**What is it?**
Your Meta App ID is the unique identifier for your WhatsApp Business API app in the Meta Developer Portal.

**How to find it:**
1. Go to [Meta Developer Apps](https://developers.facebook.com/apps/)
2. Select your app
3. The App ID is displayed at the top of the page
4. Or go to **Settings → Basic** to see it

**In your code:**
```bash
# Check your .env file
META_APP_ID=your_app_id_here
NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id_here
```

**Current value:** Check your `.env` file for `META_APP_ID` or `NEXT_PUBLIC_FACEBOOK_APP_ID`

---

## Quick Summary for Meta Support

When replying to Meta Support, you can provide this information:

```
Hi Meta Support Team,

Here is the information you requested:

1. Business Manager (BM) ID: [YOUR_BM_ID]
2. Facebook User ID: [FACEBOOK_USER_ID_FROM_LOGS]
3. App ID: [YOUR_APP_ID]

Additional context:
- WABA ID: [IF_AVAILABLE_FROM_LOGS]
- Phone Number ID: [IF_AVAILABLE_FROM_LOGS]
- Timestamp of failed attempt: [DATE_AND_TIME]
- Error message (if any): [ERROR_MESSAGE]

Thank you for your assistance.
```

---

## What Changed Today

### Frontend (`WhatsAppConnectButton.tsx`)
- ✅ Now captures `userID` from `FB.login()` response
- ✅ Logs all Meta support information in a clear format to console
- ✅ Passes `facebookUserId` to backend APIs

### Backend APIs
- ✅ `register-whatsapp/route.ts` - Accepts and logs `facebookUserId`
- ✅ `exchange-token/route.ts` - Accepts and logs `facebookUserId`
- ✅ Both APIs log comprehensive debug information including BM ID

### Database Model (`BusinessWhatsAppAccount`)
- ✅ Added `facebookUserId` field to store the Facebook User ID
- ✅ Field is optional and won't break existing records

---

## Testing the Changes

1. **Start your development server:**
   ```bash
   pnpm dev
   ```

2. **Open the onboarding page:**
   ```
   http://localhost:3000/onboarding
   ```

3. **Open Developer Tools (F12) and go to Console tab**

4. **Click "Connect WhatsApp Business"**

5. **Go through the embedded signup process**

6. **Check the console for the debug information box**

7. **Copy the Facebook User ID and other information**

8. **Send it to Meta Support**

---

## Important Notes

### For Production
- The debug logs will appear in both development and production
- Make sure to check your server logs (deployment platform logs)
- Consider setting up log aggregation (e.g., Datadog, Loggly) to easily search logs

### For Meta Support
- Always provide timestamps in your timezone
- Include the full error message if there was one
- Include screenshots of the error if possible
- Include the step where the user got stuck (e.g., "phone verification")

### Privacy
- The Facebook User ID is **not** sensitive personal data
- It's a public identifier that Meta uses to identify accounts
- It's safe to share with Meta Support

---

## Troubleshooting

### "I don't see the Facebook User ID in logs"
- Make sure you're looking at the **browser console** (F12 → Console)
- The information is logged when the user **clicks the button** and **completes the flow**
- Check that you're running the latest code (after today's changes)

### "The embedded signup popup closes immediately"
- Check that `NEXT_PUBLIC_META_CONFIGURATION_ID` is set correctly
- Check that your App ID matches the configuration
- Check browser console for errors

### "I see the User ID in browser but not in server logs"
- This is normal if the signup failed before reaching the backend
- Send Meta Support the User ID from the browser console
- Include any error messages from the browser console

---

## Environment Variables Checklist

Make sure these are set in your `.env` file:

```bash
# Required for Meta Support
META_BUSINESS_MANAGER_ID=XXXXXXXXXX
META_APP_ID=XXXXXXXXXX
NEXT_PUBLIC_FACEBOOK_APP_ID=XXXXXXXXXX

# Required for embedded signup
NEXT_PUBLIC_META_CONFIGURATION_ID=XXXXXXXXXX
META_APP_SECRET=XXXXXXXXXX
META_SYSTEM_USER_TOKEN=XXXXXXXXXX
```

---

## Next Steps

1. ✅ Code has been updated to capture Facebook User ID
2. ✅ Console logging has been improved for debugging
3. ✅ Database model supports storing the User ID
4. 📝 Test the onboarding flow and check console logs
5. 📝 When you see the next error, copy the debug information
6. 📝 Reply to Meta Support with the three IDs they requested

Good luck! 🚀
