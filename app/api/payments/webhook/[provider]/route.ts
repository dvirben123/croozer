import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { PaymentService } from '@/lib/services/PaymentService';
import PaymentProvider from '@/models/PaymentProvider';

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    await dbConnect();

    const provider = params.provider;

    // CRITICAL: Get raw body for signature verification
    const rawBody = await request.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    console.log(`💳 Payment webhook received from ${provider}:`, body);

    // CRITICAL: Extract signature from headers based on provider
    let signature: string | null = null;
    switch (provider) {
      case 'stripe':
        signature = request.headers.get('stripe-signature');
        break;
      case 'paypal':
        signature = request.headers.get('x-paypal-transmission-sig');
        break;
      case 'tranzila':
      case 'meshulam':
      case 'cardcom':
        signature = request.headers.get('x-webhook-signature');
        break;
    }

    let orderId: string | null = null;
    let transactionId: string | null = null;
    let status: string | null = null;

    // Parse webhook data based on provider
    switch (provider) {
      case 'stripe':
        orderId = body.data?.object?.metadata?.order_id;
        transactionId = body.data?.object?.id;
        status = body.type === 'checkout.session.completed' ? 'completed' : 'pending';
        break;

      case 'paypal':
        orderId = body.resource?.purchase_units?.[0]?.custom_id;
        transactionId = body.resource?.id;
        status = body.event_type === 'PAYMENT.CAPTURE.COMPLETED' ? 'completed' : 'pending';
        break;

      case 'tranzila':
        orderId = body.order_id;
        transactionId = body.transaction_id;
        status = body.response === '000' ? 'completed' : 'failed';
        break;

      case 'meshulam':
        orderId = body.customFields?.orderId;
        transactionId = body.transactionId;
        status = body.status === 'success' ? 'completed' : 'failed';
        break;

      case 'cardcom':
        orderId = body.CustomFields?.OrderId;
        transactionId = body.InternalDealNumber;
        status = body.ResponseCode === '0' ? 'completed' : 'failed';
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown payment provider' },
          { status: 400 }
        );
    }

    if (!orderId || !transactionId) {
      console.error('Missing order ID or transaction ID in webhook');
      return NextResponse.json(
        { success: false, error: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    // CRITICAL: Verify webhook signature before processing payment
    // Get the payment provider to retrieve webhook secret
    const paymentProvider = await PaymentProvider.findOne({
      provider,
      isActive: true,
    });

    if (!paymentProvider) {
      console.error(`No active payment provider found for ${provider}`);
      return NextResponse.json(
        { success: false, error: 'Payment provider not configured' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = await PaymentService.verifyWebhookSignature(
      provider,
      rawBody,
      signature,
      paymentProvider.webhookSecret
    );

    if (!isValid) {
      console.error(`Invalid webhook signature from ${provider}`);
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    console.log(`✅ Webhook signature verified for ${provider}`);

    // Handle payment completion
    if (status === 'completed') {
      await PaymentService.handlePaymentComplete(orderId, transactionId);
      
      console.log(`✅ Payment completed for order ${orderId}`);
    } else {
      console.log(`⚠️  Payment status: ${status} for order ${orderId}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('Error processing payment webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

