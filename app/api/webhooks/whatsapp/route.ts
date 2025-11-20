/**
 * WhatsApp Webhook Handler
 * 
 * This endpoint receives incoming messages and status updates from WhatsApp Cloud API.
 * 
 * Webhook Events:
 * - messages: Incoming messages from users
 * - message_status: Delivery status updates (sent, delivered, read, failed)
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { IncomingMessage } from '@/models/IncomingMessage';
import BusinessWhatsAppAccount from '@/models/BusinessWhatsAppAccount';
import { ConversationFlowService } from '@/lib/services/ConversationFlowService';
import mongoose from 'mongoose';

// Webhook verify token - must match the one in Meta dashboard
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'your_verify_token_here';

/**
 * GET - Webhook Verification
 * Meta calls this endpoint to verify the webhook URL
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('📞 Webhook verification request:', { mode, token: token?.substring(0, 10) + '...' });

  // Verify the token
  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    // Respond with the challenge to verify the webhook
    return new NextResponse(challenge, { status: 200 });
  }

  console.error('❌ Webhook verification failed - token mismatch');
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/**
 * POST - Receive Webhook Events
 * WhatsApp sends incoming messages and status updates here
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('\n' + '═'.repeat(60));
    console.log('📨 WEBHOOK RECEIVED');
    console.log('═'.repeat(60));
    console.log(JSON.stringify(body, null, 2));
    console.log('═'.repeat(60) + '\n');

    // Verify this is a WhatsApp webhook
    if (body.object !== 'whatsapp_business_account') {
      console.log('⚠️  Not a WhatsApp webhook, ignoring');
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    // Process each entry
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;

        // Handle incoming messages
        if (value.messages) {
          await handleIncomingMessages(value);
        }

        // Handle message status updates
        if (value.statuses) {
          await handleMessageStatuses(value);
        }
      }
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}

/**
 * Handle incoming messages from users
 */
async function handleIncomingMessages(value: any) {
  const messages = value.messages || [];
  const metadata = value.metadata;

  console.log('📬 Processing incoming messages:', messages.length);

  for (const message of messages) {
    const messageData = {
      // Message identifiers
      messageId: message.id,
      whatsappBusinessAccountId: metadata.phone_number_id,

      // Sender information
      from: message.from,

      // Message content
      type: message.type,
      timestamp: new Date(parseInt(message.timestamp) * 1000),

      // Message body based on type
      text: message.text?.body,
      image: message.image,
      video: message.video,
      audio: message.audio,
      document: message.document,
      location: message.location,
      contacts: message.contacts,

      // Context (if it's a reply)
      context: message.context,
    };

    console.log('\n🎉 NEW MESSAGE RECEIVED!');
    console.log('─'.repeat(60));
    console.log('📱 From:', messageData.from);
    console.log('📝 Type:', messageData.type);
    console.log('💬 Text:', messageData.text || '(non-text message)');
    console.log('🕐 Time:', messageData.timestamp.toLocaleString());
    console.log('🆔 Message ID:', messageData.messageId);
    console.log('─'.repeat(60) + '\n');

    // Save to database
    try {
      await dbConnect();

      await IncomingMessage.create({
        messageId: messageData.messageId,
        whatsappBusinessAccountId: messageData.whatsappBusinessAccountId,
        from: messageData.from,
        type: messageData.type,
        timestamp: messageData.timestamp,
        text: messageData.text,
        context: messageData.context,
        processed: false,
      });

      console.log('💾 Message saved to database');
    } catch (dbError) {
      console.error('❌ Failed to save to database:', dbError);
      // Continue processing even if DB save fails
    }

    // Process message through conversation flow
    if (messageData.type === 'text' && messageData.text) {
      try {
        // Find business by phone number ID
        const whatsappAccount = await BusinessWhatsAppAccount.findOne({
          phoneNumberId: messageData.whatsappBusinessAccountId,
        });

        if (whatsappAccount) {
          console.log('🤖 Processing message through conversation flow...');

          await ConversationFlowService.handleMessage(
            whatsappAccount.businessId,
            messageData.from,
            messageData.text,
            messageData.messageId
          );

          console.log('✅ Conversation flow processed successfully');
        } else {
          console.log('⚠️  No business found for phone number ID:', messageData.whatsappBusinessAccountId);
        }
      } catch (flowError) {
        console.error('❌ Conversation flow error:', flowError);
        // Don't fail the webhook if conversation flow fails
      }
    }

    console.log('✅ Message processed successfully\n');
  }
}

/**
 * Handle message status updates (sent, delivered, read, failed)
 */
async function handleMessageStatuses(value: any) {
  const statuses = value.statuses || [];

  console.log('📊 Processing status updates:', statuses.length);

  for (const status of statuses) {
    const statusData = {
      messageId: status.id,
      recipientId: status.recipient_id,
      status: status.status, // sent, delivered, read, failed
      timestamp: new Date(parseInt(status.timestamp) * 1000),
      errors: status.errors,
    };

    console.log('📊 Status update:', {
      messageId: statusData.messageId,
      status: statusData.status,
      recipient: statusData.recipientId,
    });

    // TODO: Update message status in database
    // await updateMessageStatus(statusData);

    // For now, just log it
    console.log('✅ Status updated:', statusData.messageId);
  }
}

