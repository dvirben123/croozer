# WhatsApp Webhook Setup Guide

**How to Receive Messages from WhatsApp**

---

## 🎯 What Are Webhooks?

Webhooks allow WhatsApp to send incoming messages and status updates to your application in real-time.

```
User sends message → WhatsApp Cloud API → Your Webhook → Your App
```

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Configure Webhook

```bash
npx tsx scripts/setup/configure-webhook.ts
```

This will:
- ✅ Generate a webhook verify token
- ✅ Save it to `.env`
- ✅ Show you setup instructions

### Step 2: Expose Your Local Server

**Option A: Using ngrok (Recommended)**

```bash
# Install ngrok: https://ngrok.com/download
# Then run:
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

**Option B: Using localtunnel**

```bash
pnpm add -g localtunnel
lt --port 3000
```

### Step 3: Configure in Meta Dashboard

1. Go to: [WhatsApp Configuration](https://developers.facebook.com/apps/1284378939762336/whatsapp-business/wa-settings/)

2. Click **"Configuration"** tab

3. Find **"Webhook"** section → Click **"Edit"**

4. Enter:
   - **Callback URL**: `https://YOUR_NGROK_URL/api/webhooks/whatsapp`
   - **Verify Token**: (from `.env` file - `WEBHOOK_VERIFY_TOKEN`)

5. Click **"Verify and Save"**

6. Subscribe to fields:
   - ✅ `messages`
   - ✅ `message_status`

---

## 🧪 Test It

### 1. Start Your Server

```bash
pnpm dev
```

### 2. Send a Test Message

Send a WhatsApp message to: **+972 53-533-1770**

### 3. Check Terminal

You should see:

```
📨 Webhook received: {...}
📬 Processing incoming messages: 1
📨 Incoming message: {
  from: "972526581731",
  type: "text",
  text: "Hello!",
  timestamp: 2025-11-17T10:00:00.000Z
}
✅ Message processed: wamid.xxx
```

---

## 📋 What's Already Implemented

### Webhook Endpoint

**File**: `app/api/webhooks/whatsapp/route.ts`

**Features**:
- ✅ Webhook verification (GET)
- ✅ Receive messages (POST)
- ✅ Handle message statuses
- ✅ Parse different message types (text, image, video, etc.)
- ✅ Error handling
- ✅ Logging

### Supported Message Types

- ✅ Text messages
- ✅ Images
- ✅ Videos
- ✅ Audio
- ✅ Documents
- ✅ Location
- ✅ Contacts

### Status Updates

- ✅ Sent
- ✅ Delivered
- ✅ Read
- ✅ Failed

---

## 🔧 Configuration

### Environment Variables

Add to `.env`:

```env
# Webhook Configuration
WEBHOOK_VERIFY_TOKEN=your_generated_token_here
NEXT_PUBLIC_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/webhooks/whatsapp
```

### Webhook URL Structure

```
Development:  https://abc123.ngrok-free.app/api/webhooks/whatsapp
Production:   https://your-domain.com/api/webhooks/whatsapp
```

---

## 📊 Webhook Payload Examples

### Incoming Text Message

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WABA_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "972535331770",
          "phone_number_id": "789427540931519"
        },
        "messages": [{
          "from": "972526581731",
          "id": "wamid.xxx",
          "timestamp": "1700222400",
          "type": "text",
          "text": {
            "body": "Hello from customer!"
          }
        }]
      }
    }]
  }]
}
```

### Message Status Update

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "statuses": [{
          "id": "wamid.xxx",
          "status": "delivered",
          "timestamp": "1700222400",
          "recipient_id": "972526581731"
        }]
      }
    }]
  }]
}
```

---

## 🔐 Security

### Webhook Verification

Meta verifies your webhook by:
1. Sending a GET request with `hub.mode`, `hub.verify_token`, `hub.challenge`
2. Your endpoint checks if `hub.verify_token` matches `WEBHOOK_VERIFY_TOKEN`
3. If match, return `hub.challenge`

**Already implemented** in `route.ts`

### Best Practices

1. ✅ **Use HTTPS only** - Required by Meta
2. ✅ **Keep verify token secret** - Don't commit to git
3. ✅ **Always return 200 OK** - Even on errors (to prevent retries)
4. ✅ **Process async** - Don't block webhook response
5. ✅ **Validate payload** - Check `object === 'whatsapp_business_account'`

---

## 🚧 Next Steps (TODO)

### 1. Save Messages to Database

```typescript
// In handleIncomingMessages()
import { IncomingMessage } from '@/models/IncomingMessage';

await IncomingMessage.create({
  messageId: message.id,
  from: message.from,
  to: metadata.phone_number_id,
  type: message.type,
  content: message.text?.body,
  timestamp: new Date(parseInt(message.timestamp) * 1000),
  businessId: business._id,
});
```

### 2. Auto-Reply Logic

```typescript
// In handleIncomingMessages()
if (message.text?.body.toLowerCase().includes('help')) {
  await sendAutoReply(message.from, 'How can we help you?');
}
```

### 3. Update Dashboard UI

- Show incoming messages in MessagesTab
- Real-time updates using WebSocket or polling
- Notification for new messages

### 4. Message History

- Store all incoming/outgoing messages
- Display conversation threads
- Search and filter messages

---

## 🐛 Troubleshooting

### Webhook Verification Fails

**Problem**: Meta says "Verification failed"

**Solutions**:
1. Check `WEBHOOK_VERIFY_TOKEN` matches in both `.env` and Meta dashboard
2. Ensure webhook URL is HTTPS
3. Check ngrok is running
4. Verify dev server is running (`pnpm dev`)
5. Check terminal for errors

### Not Receiving Messages

**Problem**: Webhook verified but no messages received

**Solutions**:
1. Check ngrok is still running (URLs expire)
2. Send message to correct number (+972 53-533-1770)
3. Check terminal for webhook logs
4. Verify webhook fields are subscribed (messages, message_status)
5. Check Meta dashboard for webhook errors

### ngrok URL Changes

**Problem**: ngrok URL changes every restart

**Solutions**:
1. **Free plan**: Update webhook URL in Meta dashboard each time
2. **Paid plan**: Use static domain
3. **Production**: Use your actual domain

---

## 📖 Resources

### Meta Documentation
- [Webhooks Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Webhook Payload Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples)
- [Message Types](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components)

### Tools
- [ngrok](https://ngrok.com/) - Expose local server
- [localtunnel](https://localtunnel.github.io/www/) - Alternative to ngrok
- [Webhook.site](https://webhook.site/) - Test webhooks

### Project Files
- `app/api/webhooks/whatsapp/route.ts` - Webhook implementation
- `scripts/setup/configure-webhook.ts` - Setup script
- `.cursor/rules/whatsapp-api.mdc` - Development rules

---

## ✅ Checklist

Before going live:

- [ ] Webhook verify token generated
- [ ] Webhook endpoint implemented
- [ ] ngrok or production domain configured
- [ ] Webhook verified in Meta dashboard
- [ ] Subscribed to `messages` and `message_status`
- [ ] Test message sent and received
- [ ] Logs show incoming messages
- [ ] Database model created (optional)
- [ ] Auto-reply logic implemented (optional)
- [ ] Dashboard UI updated (optional)

---

## 🎉 Success!

Once setup is complete, you'll be able to:

✅ Receive messages from customers in real-time  
✅ Get delivery status updates  
✅ Build two-way conversations  
✅ Implement auto-replies  
✅ Store message history  
✅ Create chatbot logic  

---

**Last Updated**: November 17, 2025  
**Status**: Ready to implement  
**Estimated Setup Time**: 15 minutes

