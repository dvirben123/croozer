# WhatsApp API - Quick Reference Card

## 🚀 Most Used Commands

```bash
# Send a message
npx tsx scripts/send-message.ts

# Check setup
npx tsx scripts/testing/test-meta-api.ts

# Check token
npx tsx scripts/testing/check-token-info.ts

# Check phone status
npx tsx scripts/testing/check-phone-status.ts
```

---

## 📋 Environment Variables (Copy-Paste Ready)

```env
# Verified Working Values
WHATSAPP_PHONE_NUMBER_ID=789427540931519
WHATSAPP_BUSINESS_ACCOUNT_ID=1980175552606363

# Your Tokens (Fill these in)
META_SYSTEM_USER_ACCESS_TOKEN=your_token_here
META_BUSINESS_MANAGER_ID=your_business_id
META_APP_ID=1284378939762336
META_APP_SECRET=your_app_secret
```

---

## 🔧 Common Fixes

### Wrong Phone Number ID

```bash
npx tsx scripts/utils/fix-phone-number-id.ts
```

### Update .env values

```bash
npx tsx scripts/utils/update-env-values.ts
```

---

## 📱 Phone Number Format

```typescript
// ✅ CORRECT
"972526581731";

// ❌ WRONG
"+972526581731";
"+972-52-658-1731";
"0526581731";
```

---

## 💬 Send Message (Code)

```typescript
// Template Message (Always works)
const response = await fetch(
  `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: "972526581731",
      type: "template",
      template: {
        name: "hello_world",
        language: { code: "en_US" },
      },
    }),
  }
);
```

---

## 🐛 Error Codes

| Code   | Meaning         | Fix                   |
| ------ | --------------- | --------------------- |
| 131026 | Not test number | Add in Meta dashboard |
| 131047 | 24h expired     | Use template          |
| 190    | Bad token       | Check .env            |
| 100    | Bad param       | Check phone format    |

## 💾 Database Connection

```typescript
// ✅ CORRECT
import dbConnect from "@/lib/mongodb";
await dbConnect();

// ❌ WRONG
import { connectDB } from "@/lib/mongodb";
```

---

## 🔗 Quick Links

- [Add Test Number](https://developers.facebook.com/apps/1284378939762336/whatsapp-business/wa-dev-console/)
- [App Dashboard](https://developers.facebook.com/apps/1284378939762336/)
- [Business Manager](https://business.facebook.com/)

---

## 📊 Token Info

```bash
# Check if permanent
npx tsx scripts/testing/check-token-info.ts

# Should show:
# ✅ PERMANENT TOKEN (Never expires)
# ✅ Expires At: Never
```

---

## 🎯 Current Setup Status

- ✅ Phone Number: +972 53-533-1770
- ✅ Phone Number ID: 789427540931519
- ✅ Status: VERIFIED
- ✅ Token: PERMANENT
- ✅ Template: hello_world (APPROVED)

---

**Print this and keep it handy!** 📌
