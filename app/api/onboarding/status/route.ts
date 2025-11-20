import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Business from '@/models/Business';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const userId = searchParams.get('userId');

    if (!businessId && !userId) {
      return NextResponse.json(
        { success: false, error: 'Business ID or User ID is required' },
        { status: 400 }
      );
    }

    let business;
    if (businessId) {
      business = await Business.findById(businessId);
    } else {
      business = await Business.findOne({ userId });
    }

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        businessId: business._id,
        onboarding: business.onboarding,
        status: business.status,
        hasWhatsApp: !!business.whatsappAccountId,
        hasPaymentProvider: business.paymentProviders?.length > 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch status' },
      { status: 500 }
    );
  }
}

