import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BusinessWhatsAppAccount from '@/models/BusinessWhatsAppAccount';
import { EncryptionService } from '@/lib/services/EncryptionService';
import { getServerSession } from '@/lib/auth';

/**
 * GET /api/whatsapp/phone-status
 * Check the status of a registered WhatsApp phone number
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Find WhatsApp account
    const whatsappAccount = await BusinessWhatsAppAccount.findOne({ businessId });

    if (!whatsappAccount) {
      return NextResponse.json(
        { success: false, error: 'No WhatsApp account found for this business' },
        { status: 404 }
      );
    }

    // Decrypt access token
    const accessToken = EncryptionService.decrypt(whatsappAccount.accessToken);

    // Get phone number details from WhatsApp API
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${whatsappAccount.phoneNumberId}?` +
      `fields=id,display_phone_number,verified_name,code_verification_status,quality_rating,account_mode&` +
      `access_token=${accessToken}`
    );

    const phoneData = await response.json();

    if (phoneData.error) {
      console.error('WhatsApp API Error:', phoneData.error);
      return NextResponse.json(
        { success: false, error: phoneData.error.message || 'Failed to fetch phone status' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        phoneNumberId: phoneData.id,
        displayPhoneNumber: phoneData.display_phone_number,
        verifiedName: phoneData.verified_name,
        verificationStatus: phoneData.code_verification_status,
        qualityRating: phoneData.quality_rating,
        accountMode: phoneData.account_mode,
        isVerified: phoneData.code_verification_status === 'VERIFIED',
        isHealthy: phoneData.quality_rating !== 'RED',
        status: whatsappAccount.status,
        connectedAt: whatsappAccount.connectedAt
      }
    });
  } catch (error: any) {
    console.error('Error checking phone status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to check phone status' },
      { status: 500 }
    );
  }
}
