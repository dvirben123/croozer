# Common Issues & Solutions

## 💾 Database Connection Error

### Issue
```
TypeError: connectDB is not a function
```

### Root Cause
The MongoDB connection function in `app/lib/mongodb.ts` is exported as a **default export**, not a named export.

```typescript
// app/lib/mongodb.ts
export default dbConnect;  // ← Default export
```

### Solution

**✅ CORRECT - Use default import:**
```typescript
import dbConnect from '@/lib/mongodb';

async function handler() {
  await dbConnect();
  // ... rest of code
}
```

**❌ WRONG - Don't use named import:**
```typescript
import { connectDB } from '@/lib/mongodb';  // ERROR!
```

### Files That Need This

Any file that connects to MongoDB:
- `app/api/webhooks/whatsapp/route.ts`
- `app/api/messages/incoming/route.ts`
- All API routes
- All server components that query database

---

## 📱 Wrong Phone Number ID

### Issue
Messages sent but not delivered, API returns success but nothing arrives.

### Root Cause
Using wrong `WHATSAPP_PHONE_NUMBER_ID` in `.env`.

### Solution

**✅ CORRECT Phone Number ID:**
```env
WHATSAPP_PHONE_NUMBER_ID=789427540931519
```

**❌ WRONG (Old ID):**
```env
WHATSAPP_PHONE_NUMBER_ID=831563980046780
```

### How to Find Correct ID

1. Go to [Meta Console](https://developers.facebook.com/apps/1284378939762336/whatsapp-business/wa-dev-console/)
2. Look for "Phone number ID" in the API Setup section
3. Copy the ID (NOT the phone number itself)
4. Update `.env`

---

## 🔗 Webhook Verification Failed

### Issue
```
Webhook verification failed - token mismatch
```

### Root Cause
`WEBHOOK_VERIFY_TOKEN` in `.env` doesn't match the token in Meta dashboard.

### Solution

1. Check `.env` for `WEBHOOK_VERIFY_TOKEN`
2. Go to Meta dashboard webhook configuration
3. Ensure both tokens match exactly
4. Regenerate if needed:
   ```bash
   openssl rand -hex 32
   ```

---

## 🚫 Recipient Not Registered (Error 131026)

### Issue
```
Error Code: 131026
Message: Recipient phone number not registered
```

### Root Cause
Trying to send message to a number that's not added as a test recipient.

### Solution

1. Go to [WhatsApp API Setup](https://developers.facebook.com/apps/1284378939762336/whatsapp-business/wa-dev-console/)
2. Find "Send and receive messages" section
3. Click "Manage phone number list"
4. Add recipient number
5. Verify with code sent to WhatsApp

---

## ⏰ 24-Hour Window Expired (Error 131047)

### Issue
```
Error Code: 131047
Message: Re-engagement message
```

### Root Cause
Trying to send text message outside 24-hour window.

### Solution

**Use template messages instead:**
```typescript
{
  type: 'template',
  template: {
    name: 'hello_world',
    language: { code: 'en_US' }
  }
}
```

Template messages can be sent anytime, to anyone.

---

## 🔐 Invalid Access Token (Error 190)

### Issue
```
Error Code: 190
Message: Invalid OAuth access token
```

### Root Cause
- Token expired (if temporary)
- Token revoked
- Wrong token in `.env`

### Solution

1. Check token type:
   ```bash
   npx tsx scripts/testing/check-token-info.ts
   ```

2. If temporary, regenerate permanent token:
   - Go to Business Manager → System Users
   - Generate new token with "Never expire"
   - Update `.env`

3. Verify token has required permissions:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
   - `business_management`

---

## 📦 Import/Export Issues

### Issue
```
Module not found
Cannot find module '@/...'
```

### Common Causes & Solutions

**1. Wrong import path:**
```typescript
// ✅ CORRECT
import { Button } from '@/components/ui/button';

// ❌ WRONG
import { Button } from 'components/ui/button';
```

**2. Missing file extension in imports:**
```typescript
// ✅ CORRECT (TypeScript)
import dbConnect from '@/lib/mongodb';

// ❌ WRONG
import dbConnect from '@/lib/mongodb.ts';
```

**3. Default vs Named exports:**
```typescript
// If file exports: export default MyComponent
import MyComponent from './MyComponent';  // ✅

// If file exports: export const MyComponent
import { MyComponent } from './MyComponent';  // ✅
```

---

## 🔄 Webhook Not Receiving Messages

### Issue
Webhook verified but no messages arriving.

### Checklist

1. **ngrok still running?**
   ```bash
   # Check if ngrok is active
   curl http://localhost:4040/api/tunnels
   ```

2. **Correct webhook URL in Meta?**
   - Should be: `https://YOUR_NGROK_URL/api/webhooks/whatsapp`
   - NOT: `/webhook` or `/webhooks`

3. **Subscribed to correct fields?**
   - ✅ messages
   - ✅ message_status

4. **Dev server running?**
   ```bash
   pnpm dev
   ```

5. **Sending to correct number?**
   - Must send to: +972 53-533-1770

---

## 🗄️ MongoDB Connection Issues

### Issue
```
MongooseError: Operation buffering timed out
```

### Solutions

1. **Check MongoDB URI:**
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
   ```

2. **Verify network access:**
   - Check MongoDB Atlas → Network Access
   - Add your IP or allow all (0.0.0.0/0)

3. **Check database name:**
   - Ensure database exists
   - Check connection string includes database name

4. **Test connection:**
   ```bash
   npx tsx -e "import dbConnect from './app/lib/mongodb'; dbConnect().then(() => console.log('Connected!')).catch(console.error)"
   ```

---

## 📝 TypeScript Errors

### Issue
Type errors in components or API routes.

### Common Solutions

1. **Install types:**
   ```bash
   pnpm add -D @types/node @types/react
   ```

2. **Check tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./app/*"]
       }
     }
   }
   ```

3. **Restart TypeScript server:**
   - VS Code: Cmd+Shift+P → "Restart TypeScript Server"

---

## 🎯 Quick Diagnostic Commands

```bash
# Check token info
npx tsx scripts/testing/check-token-info.ts

# Check phone status
npx tsx scripts/testing/check-phone-status.ts

# Test Meta API
npx tsx scripts/testing/test-meta-api.ts

# Send test message
npx tsx scripts/send-message.ts
```

---

## 📚 Where to Find Help

1. **Project Rules**: `.cursor/rules/whatsapp-api.mdc`
2. **Quick Reference**: `.cursor/rules/quick-reference.md`
3. **Setup Guide**: `META-SETUP-CHECKLIST.md`
4. **Webhook Guide**: `WEBHOOK-SETUP-GUIDE.md`
5. **Meta Docs**: https://developers.facebook.com/docs/whatsapp

---

**Last Updated**: November 17, 2025  
**Add new issues here as they're discovered and solved**

