import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Business from '@/models/Business';
import BusinessWhatsAppAccount from '@/models/BusinessWhatsAppAccount';
import { EncryptionService } from '@/lib/services/EncryptionService';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { code, businessId } = await request.json();

    if (!code || !businessId) {
      return NextResponse.json(
        { success: false, error: 'Code and business ID are required' },
        { status: 400 }
      );
    }

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!appId || !appSecret) {
      return NextResponse.json(
        { success: false, error: 'Meta app credentials not configured' },
        { status: 500 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `code=${code}`
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.json(
        { success: false, error: tokenData.error?.message || 'Failed to exchange token' },
        { status: 400 }
      );
    }

    const accessToken = tokenData.access_token;

    // Get WhatsApp Business Account details
    const wabaResponse = await fetch(
      `https://graph.facebook.com/v22.0/debug_token?input_token=${accessToken}&access_token=${accessToken}`
    );

    const wabaDebug = await wabaResponse.json();
    console.log('WABA Debug:', wabaDebug);

    // Get WABA ID and phone number from the embedded signup response
    // Note: The actual WABA ID and phone number ID should be obtained from the signup callback
    // For now, we'll need to make additional API calls to get this information

    // Get business's WhatsApp Business Accounts
    const businessResponse = await fetch(
      `https://graph.facebook.com/v22.0/me/businesses?access_token=${accessToken}`
    );

    const businessData = await businessResponse.json();
    console.log('Business Data:', businessData);

    // For embedded signup, the WABA info is typically in the signup response
    // We'll need to get it from the user's granted permissions

    // Get phone numbers associated with the token
    const phoneNumbersResponse = await fetch(
      `https://graph.facebook.com/v22.0/me?fields=whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name}}&access_token=${accessToken}`
    );

    const phoneNumbersData = await phoneNumbersResponse.json();
    console.log('Phone Numbers Data:', phoneNumbersData);

    // Extract WABA and phone number info
    const wabas = phoneNumbersData.whatsapp_business_accounts?.data || [];
    
    if (wabas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No WhatsApp Business Account found' },
        { status: 400 }
      );
    }

    const waba = wabas[0]; // Use first WABA
    const phoneNumbers = waba.phone_numbers?.data || [];

    if (phoneNumbers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No phone number found' },
        { status: 400 }
      );
    }

    const phoneNumber = phoneNumbers[0]; // Use first phone number

    // Find business
    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    // Encrypt access token
    const encryptedToken = EncryptionService.encrypt(accessToken);

    // Create or update WhatsApp account
    let whatsappAccount = await BusinessWhatsAppAccount.findOne({ businessId });

    if (whatsappAccount) {
      // Update existing
      whatsappAccount.whatsappBusinessAccountId = waba.id;
      whatsappAccount.phoneNumberId = phoneNumber.id;
      whatsappAccount.phoneNumber = phoneNumber.display_phone_number;
      whatsappAccount.displayName = phoneNumber.verified_name || business.name;
      whatsappAccount.accessToken = encryptedToken;
      whatsappAccount.tokenType = 'permanent';
      whatsappAccount.status = 'active';
      whatsappAccount.connectedAt = new Date();
      await whatsappAccount.save();
    } else {
      // Create new
      whatsappAccount = await BusinessWhatsAppAccount.create({
        businessId,
        userId: business.userId,
        whatsappBusinessAccountId: waba.id,
        phoneNumberId: phoneNumber.id,
        phoneNumber: phoneNumber.display_phone_number,
        displayName: phoneNumber.verified_name || business.name,
        accessToken: encryptedToken,
        tokenType: 'permanent',
        webhookVerifyToken: crypto.randomBytes(32).toString('hex'),
        webhookSubscribed: false,
        status: 'active',
        connectedAt: new Date(),
      });
    }

    // Update business with WhatsApp account reference
    business.whatsappAccountId = whatsappAccount._id as any;
    await business.save();

    // Subscribe to webhooks
    try {
      await subscribeToWebhooks(waba.id, accessToken);
    } catch (webhookError) {
      console.error('Failed to subscribe to webhooks:', webhookError);
      // Don't fail the whole flow if webhook subscription fails
    }

    return NextResponse.json({
      success: true,
      data: {
        whatsappAccountId: whatsappAccount._id,
        phoneNumber: phoneNumber.display_phone_number,
        displayName: phoneNumber.verified_name,
      },
      message: 'WhatsApp connected successfully',
    });
  } catch (error: any) {
    console.error('Error exchanging token:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to connect WhatsApp' },
      { status: 500 }
    );
  }
}

async function subscribeToWebhooks(wabaId: string, accessToken: string) {
  const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://your-domain.com/api/webhooks/whatsapp';
  const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;

  const response = await fetch(
    `https://graph.facebook.com/v22.0/${wabaId}/subscribed_apps`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
        subscribed_fields: ['messages', 'message_status'],
        callback_url: webhookUrl,
        verify_token: verifyToken,
      }),
    }
  );

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to subscribe to webhooks');
  }

  return result;
}

