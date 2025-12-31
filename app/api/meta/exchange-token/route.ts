import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Business from '@/models/Business';
import BusinessWhatsAppAccount from '@/models/BusinessWhatsAppAccount';
import { EncryptionService } from '@/lib/services/EncryptionService';
import { getServerSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // CRITICAL: Verify authentication before any operations
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { code, businessId, facebookUserId } = await request.json();

    // Log Meta support information
    if (facebookUserId) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('📋 META SUPPORT INFORMATION (Exchange Token):');
      console.log('═══════════════════════════════════════════════════════');
      console.log('1. Business Manager (BM) ID:', process.env.META_BUSINESS_MANAGER_ID);
      console.log('2. Facebook User ID:', facebookUserId);
      console.log('3. App ID:', process.env.META_APP_ID);
      console.log('4. Business ID (Croozer):', businessId);
      console.log('═══════════════════════════════════════════════════════');
    }

    if (!code || !businessId) {
      return NextResponse.json(
        { success: false, error: 'Code and business ID are required' },
        { status: 400 }
      );
    }

    // CRITICAL: Verify business ownership before allowing WhatsApp connection
    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    if (business.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
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
      `https://graph.facebook.com/v22.0/me?fields=whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,account_mode}}&access_token=${accessToken}`
    );

    const phoneNumbersData = await phoneNumbersResponse.json();
    console.log('📞 Phone Numbers Data:', JSON.stringify(phoneNumbersData, null, 2));

    // Extract WABA and phone number info
    const wabas = phoneNumbersData.whatsapp_business_accounts?.data || [];

    if (wabas.length === 0) {
      console.error('❌ No WABA found');
      return NextResponse.json(
        { success: false, error: 'No WhatsApp Business Account found. Please complete the embedded signup process.' },
        { status: 400 }
      );
    }

    const waba = wabas[0]; // Use first WABA
    console.log('✅ WABA Found:', { id: waba.id, name: waba.name });

    const phoneNumbers = waba.phone_numbers?.data || [];

    if (phoneNumbers.length === 0) {
      console.error('❌ No phone number found');
      return NextResponse.json(
        { success: false, error: 'No phone number found. Please register a phone number through the embedded signup flow.' },
        { status: 400 }
      );
    }

    const phoneNumber = phoneNumbers[0]; // Use first phone number

    // Validate phone number status
    console.log('📱 Phone Number Details:', {
      id: phoneNumber.id,
      display: phoneNumber.display_phone_number,
      verified_name: phoneNumber.verified_name,
      quality_rating: phoneNumber.quality_rating,
      verification_status: phoneNumber.code_verification_status,
      account_mode: phoneNumber.account_mode
    });

    // Check if phone number is properly verified
    if (phoneNumber.code_verification_status && phoneNumber.code_verification_status !== 'VERIFIED') {
      console.warn('⚠️ Phone number not fully verified:', phoneNumber.code_verification_status);
      // Don't fail, but log the warning - user might need to verify later
    }

    // Check phone number quality
    if (phoneNumber.quality_rating && phoneNumber.quality_rating === 'RED') {
      console.warn('⚠️ Phone number has RED quality rating - may have restrictions');
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
      if (facebookUserId) {
        (whatsappAccount as any).facebookUserId = facebookUserId;
      }
      await whatsappAccount.save();
    } else {
      // Create new
      const accountData: any = {
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
      };
      
      if (facebookUserId) {
        accountData.facebookUserId = facebookUserId;
      }
      
      whatsappAccount = await BusinessWhatsAppAccount.create(accountData);
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
        displayName: phoneNumber.verified_name || business.name,
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

