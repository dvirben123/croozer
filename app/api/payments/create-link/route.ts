import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { PaymentService } from '@/lib/services/PaymentService';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { businessId, orderId, amount, currency, customerPhone, customerEmail, description } = body;

    if (!businessId || !orderId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Business ID, order ID, and amount are required' },
        { status: 400 }
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

