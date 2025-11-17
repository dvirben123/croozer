# Croozer Scripts

Organized scripts for WhatsApp Business API management.

---

## 📱 Main Script - Send Messages

### `send-message.ts` ⭐ **USE THIS ONE**

**The main script for sending WhatsApp messages.**

```bash
npx tsx scripts/send-message.ts
```

**Features:**
- ✅ Interactive prompts
- ✅ Send template messages (hello_world)
- ✅ Send custom text messages
- ✅ Reads from `.env` automatically
- ✅ Error handling with helpful messages

**When to use:**
- Testing message delivery
- Sending messages to customers
- Verifying WhatsApp API is working

---

## 📁 Folder Structure

```
scripts/
├── send-message.ts          ⭐ Main script - Use this!
├── README.md                📖 This file
│
├── setup/                   🔧 Setup & Configuration
│   ├── register-phone-number.ts
│   ├── generate-encryption-keys.ts
│   └── create-test-business.ts
│
├── testing/                 🧪 Testing & Verification
│   ├── test-meta-api.ts
│   ├── test-whatsapp-service.ts
│   ├── check-phone-status.ts
│   ├── check-token-info.ts
│   └── check-message-status.ts
│
└── utils/                   🛠️ Utilities
    ├── update-env-values.ts
    └── fix-phone-number-id.ts
```

---

## 🔧 Setup Scripts

### Initial Setup (One-time)

#### 1. Generate Encryption Keys
```bash
npx tsx scripts/setup/generate-encryption-keys.ts
```
Creates secure encryption keys for storing customer tokens.

#### 2. Register Phone Number
```bash
npx tsx scripts/setup/register-phone-number.ts
```
Registers your WhatsApp Business phone number with the API.

#### 3. Create Test Business
```bash
npx tsx scripts/setup/create-test-business.ts
```
Creates a test business account in MongoDB for development.

---

## 🧪 Testing Scripts

### Verify Your Setup

#### Check Meta API Connection
```bash
npx tsx scripts/testing/test-meta-api.ts
```
Runs comprehensive tests on your Meta Business API setup.

#### Check Phone Number Status
```bash
npx tsx scripts/testing/check-phone-status.ts
```
Shows your phone number verification status and details.

#### Check Access Token
```bash
npx tsx scripts/testing/check-token-info.ts
```
Verifies if your token is permanent and shows expiration info.

#### Test WhatsApp Service
```bash
npx tsx scripts/testing/test-whatsapp-service.ts
```
Tests the multi-tenant WhatsApp service functionality.

---

## 🛠️ Utility Scripts

### Fix Configuration Issues

#### Update Environment Values
```bash
npx tsx scripts/utils/update-env-values.ts
```
Updates `.env` file with correct WhatsApp credentials.

#### Fix Phone Number ID
```bash
npx tsx scripts/utils/fix-phone-number-id.ts
```
Corrects the WHATSAPP_PHONE_NUMBER_ID in `.env`.

---

## 📋 Quick Reference

### Most Common Tasks

| Task | Command |
|------|---------|
| **Send a message** | `npx tsx scripts/send-message.ts` |
| **Check if setup is working** | `npx tsx scripts/testing/test-meta-api.ts` |
| **Verify phone number** | `npx tsx scripts/testing/check-phone-status.ts` |
| **Check token expiration** | `npx tsx scripts/testing/check-token-info.ts` |

---

## 🔐 Environment Variables Required

Make sure your `.env` file has these values:

```env
# Required for all scripts
META_SYSTEM_USER_ACCESS_TOKEN=your_permanent_token
WHATSAPP_PHONE_NUMBER_ID=789427540931519
WHATSAPP_BUSINESS_ACCOUNT_ID=1980175552606363

# Required for encryption
ENCRYPTION_KEY=your_64_char_hex
ENCRYPTION_IV=your_32_char_hex

# Required for database
MONGODB_URI=your_mongodb_connection_string
```

---

## 💡 Tips

### Sending Messages

1. **Always use template messages first** - They work with any number
2. **Text messages require 24h window** - User must message you first
3. **Add test numbers in Meta dashboard** - Required for testing

### Troubleshooting

- **Error 131026**: Add recipient as test number in Meta dashboard
- **Error 131047**: Use template messages instead of text
- **Error 190**: Access token is invalid or expired
- **Error 100**: Check phone number format (no + or spaces)

### Meta Dashboard Links

- [WhatsApp API Setup](https://developers.facebook.com/apps/1284378939762336/whatsapp-business/wa-dev-console/)
- [Business Settings](https://business.facebook.com/settings/)
- [App Dashboard](https://developers.facebook.com/apps/1284378939762336/)

---

## 🚀 Next Steps

After running scripts successfully:

1. ✅ Test `send-message.ts` with a test number
2. ✅ Verify message delivery on WhatsApp
3. ✅ Test your dashboard UI at `http://localhost:3000/dashboard`
4. ✅ Proceed to Sprint 1: Multi-Tenant WhatsApp Service

---

## 📖 Documentation

For detailed setup instructions, see:
- `META-SETUP-CHECKLIST.md` - Complete setup guide
- `IMPLEMENTATION-ROADMAP.md` - Development roadmap
- `QUICK-START.md` - Quick start guide

---

**Last Updated**: November 17, 2025

