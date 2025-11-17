# 📥 Receive WhatsApp Messages - Quick Start

## ✅ What's Already Done

1. ✅ **Webhook endpoint created**: `app/api/webhooks/whatsapp/route.ts`
2. ✅ **Configuration script ready**: `scripts/setup/configure-webhook.ts`
3. ✅ **Complete guide created**: `WEBHOOK-SETUP-GUIDE.md`

---

## 🚀 3-Step Setup

### Step 1: Generate Webhook Token

Run this command:

```bash
npx tsx scripts/setup/configure-webhook.ts
```

Or manually add to `.env`:

```env
WEBHOOK_VERIFY_TOKEN=<generate_random_64_char_string>
```

Generate token:
```bash
openssl rand -hex 32
```

---

### Step 2: Expose Your Server

**Install ngrok**:
```bash
# Download from: https://ngrok.com/download
# Or install via brew:
brew install ngrok
```

**Run ngrok**:
```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

---

### Step 3: Configure in Meta

1. **Go to**: https://developers.facebook.com/apps/1284378939762336/whatsapp-business/wa-settings/

2. **Click**: "Configuration" tab

3. **Find**: "Webhook" section → Click "Edit"

4. **Enter**:
   - Callback URL: `https://YOUR_NGROK_URL/api/webhooks/whatsapp`
   - Verify Token: (from your `.env` - `WEBHOOK_VERIFY_TOKEN`)

5. **Click**: "Verify and Save"

6. **Subscribe to**:
   - ✅ messages
   - ✅ message_status

---

## 🧪 Test It

### 1. Start Server
```bash
pnpm dev
```

### 2. Start ngrok (in another terminal)
```bash
ngrok http 3000
```

### 3. Send Message

Send a WhatsApp message to: **+972 53-533-1770**

### 4. Check Terminal

You should see:
```
📨 Webhook received: {...}
📬 Processing incoming messages: 1
📨 Incoming message: { from: "972526581731", text: "Hello!" }
✅ Message processed
```

---

## 📋 What Happens Now

When someone sends a message to your WhatsApp number:

```
User → WhatsApp → Your Webhook → Console Log
```

The webhook endpoint (`app/api/webhooks/whatsapp/route.ts`) will:
1. ✅ Receive the message
2. ✅ Log it to console
3. ✅ Parse message content
4. ⏳ TODO: Save to database
5. ⏳ TODO: Show in dashboard
6. ⏳ TODO: Send auto-reply

---

## 🔧 Current Implementation

### Webhook Endpoint

**File**: `app/api/webhooks/whatsapp/route.ts`

**What it does**:
- Verifies webhook (GET request from Meta)
- Receives messages (POST request from WhatsApp)
- Parses message data
- Logs to console
- Returns 200 OK

**Message types supported**:
- Text
- Images
- Videos
- Audio
- Documents
- Location
- Contacts

---

## 📝 Next Steps (TODO)

### 1. Save Messages to Database

Create a model:
```typescript
// app/models/Message.ts
interface Message {
  messageId: string;
  from: string;
  to: string;
  type: string;
  content: string;
  timestamp: Date;
  businessId: ObjectId;
}
```

### 2. Show in Dashboard

Update `MessagesTab.tsx` to:
- Fetch messages from database
- Display incoming messages
- Real-time updates

### 3. Auto-Reply

Add logic in webhook:
```typescript
if (message.text?.body.toLowerCase().includes('help')) {
  await sendMessage(message.from, 'How can we help?');
}
```

---

## 🐛 Troubleshooting

### Webhook Verification Fails

1. Check `WEBHOOK_VERIFY_TOKEN` in `.env`
2. Ensure ngrok is running
3. Verify dev server is running
4. Check URL is HTTPS

### Not Receiving Messages

1. Check ngrok is still running
2. Send to correct number: +972 53-533-1770
3. Check terminal for logs
4. Verify webhook subscriptions in Meta

---

## 📖 Full Documentation

For complete details, see:
- `WEBHOOK-SETUP-GUIDE.md` - Complete guide
- `app/api/webhooks/whatsapp/route.ts` - Implementation
- `.cursor/rules/whatsapp-api.mdc` - Development rules

---

## ✅ Quick Checklist

- [ ] Generate `WEBHOOK_VERIFY_TOKEN`
- [ ] Add to `.env`
- [ ] Install ngrok
- [ ] Run `ngrok http 3000`
- [ ] Copy ngrok URL
- [ ] Configure in Meta dashboard
- [ ] Subscribe to webhook fields
- [ ] Start dev server (`pnpm dev`)
- [ ] Send test message
- [ ] Check terminal logs

---

**Estimated Time**: 10-15 minutes  
**Difficulty**: Easy  
**Status**: Ready to implement

