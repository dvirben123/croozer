import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { PaymentService } from '@/lib/services/PaymentService';
import { getServerSession } from '@/lib/auth';
import Business from '@/models/Business';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // CRITICAL: Verify authentication before creating payment links
    const session = await getServerSession(request);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { businessId, orderId, amount, currency, customerPhone, customerEmail, description } = body;

    if (!businessId || !orderId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Business ID, order ID, and amount are required' },
        { status: 400 }
      );
    }

    // Validate customerPhone is required
    if (!customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Customer phone is required' },
        { status: 400 }
      );
    }

    // CRITICAL: Verify business ownership before creating payment link
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

    const result = await PaymentService.createPaymentLink(businessId, {
      orderId,
      amount,
      currency: currency || 'ILS',
      customerPhone,
      customerEmail,
      description,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        paymentUrl: result.paymentUrl,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment link' },
      { status: 500 }
    );
  }
}

