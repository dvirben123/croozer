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

    const { code, phoneNumberId, wabaId, businessId, facebookUserId } = await request.json();

    // Log Meta support information
    if (facebookUserId) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('📋 META SUPPORT INFORMATION (Backend):');
      console.log('═══════════════════════════════════════════════════════');
      console.log('1. Business Manager (BM) ID:', process.env.META_BUSINESS_MANAGER_ID);
      console.log('2. Facebook User ID:', facebookUserId);
      console.log('3. App ID:', process.env.META_APP_ID);
      console.log('4. Business ID (Croozer):', businessId);
      console.log('5. WABA ID:', wabaId);
      console.log('6. Phone Number ID:', phoneNumberId);
      console.log('═══════════════════════════════════════════════════════');
    }

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Either code OR (phoneNumberId + wabaId) must be provided
    if (!code && (!phoneNumberId || !wabaId)) {
      return NextResponse.json(
        { success: false, error: 'Either code or (phoneNumberId + wabaId) must be provided' },
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

    let accessToken: string;
    let finalPhoneNumberId = phoneNumberId;
    let finalWabaId = wabaId;

    // If code is provided, exchange it for an access token
    if (code) {
      console.log('🔄 Exchanging code for access token...');

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

      accessToken = tokenData.access_token;
      console.log('✅ Access token obtained from code');

      // If phoneNumberId and wabaId not provided, fetch them from the token
      if (!finalPhoneNumberId || !finalWabaId) {
        console.log('📞 Fetching WABA and phone number info from token...');

        const meResponse = await fetch(
          `https://graph.facebook.com/v22.0/me?fields=whatsapp_business_accounts{id,name,phone_numbers{id}}&access_token=${accessToken}`
        );

        const meData = await meResponse.json();
        const wabas = meData.whatsapp_business_accounts?.data || [];

        if (wabas.length === 0) {
          return NextResponse.json(
            { success: false, error: 'No WhatsApp Business Account found' },
            { status: 400 }
          );
        }

        const waba = wabas[0];
        finalWabaId = waba.id;

        const phoneNumbers = waba.phone_numbers?.data || [];
        if (phoneNumbers.length === 0) {
          return NextResponse.json(
            { success: false, error: 'No phone number found' },
            { status: 400 }
          );
        }

        finalPhoneNumberId = phoneNumbers[0].id;
        console.log('✅ Fetched WABA ID:', finalWabaId, 'Phone ID:', finalPhoneNumberId);
      }
    } else {
      // Use System User Token for direct registration (no code provided)
      const systemUserToken = process.env.META_SYSTEM_USER_TOKEN;

      if (!systemUserToken) {
        return NextResponse.json(
          { success: false, error: 'System user token not configured. Please generate a System User token in Meta Business Manager.' },
          { status: 500 }
        );
      }

      accessToken = systemUserToken;
      console.log('✅ Using system user token');
    }

    console.log('📱 Registering WhatsApp with:', { phoneNumberId: finalPhoneNumberId, wabaId: finalWabaId });

    // Get phone number details using access token
    const phoneResponse = await fetch(
      `https://graph.facebook.com/v22.0/${finalPhoneNumberId}?` +
      `fields=id,display_phone_number,verified_name,code_verification_status,quality_rating,account_mode&` +
      `access_token=${accessToken}`
    );

    if (!phoneResponse.ok) {
      const errorData = await phoneResponse.json();
      console.error('❌ Failed to fetch phone details:', errorData);
      return NextResponse.json(
        { success: false, error: errorData.error?.message || 'Failed to fetch phone number details' },
        { status: 400 }
      );
    }

    const phoneData = await phoneResponse.json();
    console.log('📞 Phone Number Details:', phoneData);

    // Get WABA details
    const wabaResponse = await fetch(
      `https://graph.facebook.com/v22.0/${finalWabaId}?` +
      `fields=id,name,timezone_id,message_template_namespace&` +
      `access_token=${accessToken}`
    );

    if (!wabaResponse.ok) {
      const errorData = await wabaResponse.json();
      console.error('❌ Failed to fetch WABA details:', errorData);
      return NextResponse.json(
        { success: false, error: errorData.error?.message || 'Failed to fetch WABA details' },
        { status: 400 }
      );
    }

    const wabaData = await wabaResponse.json();
    console.log('✅ WABA Details:', wabaData);

    // Validate phone number status
    console.log('📱 Phone Number Validation:', {
      id: phoneData.id,
      display: phoneData.display_phone_number,
      verified_name: phoneData.verified_name,
      quality_rating: phoneData.quality_rating,
      verification_status: phoneData.code_verification_status,
      account_mode: phoneData.account_mode
    });

    // Check if phone number is properly verified
    if (phoneData.code_verification_status && phoneData.code_verification_status !== 'VERIFIED') {
      console.warn('⚠️ Phone number not fully verified:', phoneData.code_verification_status);
      // Don't fail, but log the warning - user might need to verify later
    }

    // Check phone number quality
    if (phoneData.quality_rating && phoneData.quality_rating === 'RED') {
      console.warn('⚠️ Phone number has RED quality rating - may have restrictions');
    }

    // Encrypt access token
    const encryptedToken = EncryptionService.encrypt(accessToken);

    // Determine token type
    const tokenType = code ? 'user_access' : 'system_user';

    // Create or update WhatsApp account
    let whatsappAccount = await BusinessWhatsAppAccount.findOne({ businessId });

    if (whatsappAccount) {
      // Update existing
      whatsappAccount.whatsappBusinessAccountId = finalWabaId;
      whatsappAccount.phoneNumberId = finalPhoneNumberId;
      whatsappAccount.phoneNumber = phoneData.display_phone_number;
      whatsappAccount.displayName = phoneData.verified_name || business.name;
      whatsappAccount.accessToken = encryptedToken;
      whatsappAccount.tokenType = tokenType;
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
        whatsappBusinessAccountId: finalWabaId,
        phoneNumberId: finalPhoneNumberId,
        phoneNumber: phoneData.display_phone_number,
        displayName: phoneData.verified_name || business.name,
        accessToken: encryptedToken,
        tokenType: tokenType,
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
      await subscribeToWebhooks(finalWabaId, accessToken);
      whatsappAccount.webhookSubscribed = true;
      await whatsappAccount.save();
    } catch (webhookError) {
      console.error('Failed to subscribe to webhooks:', webhookError);
      // Don't fail the whole flow if webhook subscription fails
    }

    return NextResponse.json({
      success: true,
      data: {
        whatsappAccountId: whatsappAccount._id,
        phoneNumber: phoneData.display_phone_number,
        displayName: phoneData.verified_name || business.name,
        verificationStatus: phoneData.code_verification_status,
        qualityRating: phoneData.quality_rating,
      },
      message: 'WhatsApp connected successfully',
    });
  } catch (error: any) {
    console.error('Error registering WhatsApp:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register WhatsApp' },
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
