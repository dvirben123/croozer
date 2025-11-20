import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import PaymentProvider from '@/models/PaymentProvider';
import Business from '@/models/Business';
import { EncryptionService } from '@/lib/services/EncryptionService';

// GET /api/payments/providers - List all payment providers for a business
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const providers = await PaymentProvider.find({ businessId })
      .sort({ isPrimary: -1, createdAt: 1 })
      .lean();

    // Don't return credentials in list view
    const sanitizedProviders = providers.map(({ credentials, webhookSecret, ...provider }) => provider);

    return NextResponse.json({
      success: true,
      count: sanitizedProviders.length,
      data: sanitizedProviders,
    });
  } catch (error: any) {
    console.error('Error fetching payment providers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

// POST /api/payments/providers - Add a new payment provider
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { businessId, provider, providerName, credentials, testMode, isPrimary, ...otherData } = body;

    if (!businessId || !provider || !credentials) {
      return NextResponse.json(
        { success: false, error: 'Business ID, provider type, and credentials are required' },
        { status: 400 }
      );
    }

    // Validate provider type
    const allowedProviders = ['stripe', 'paypal', 'tranzila', 'meshulam', 'cardcom'];
    if (!allowedProviders.includes(provider)) {
      return NextResponse.json(
        { success: false, error: `Invalid provider type. Allowed: ${allowedProviders.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate credentials is an object
    if (typeof credentials !== 'object' || credentials === null || Array.isArray(credentials)) {
      return NextResponse.json(
        { success: false, error: 'Credentials must be an object' },
        { status: 400 }
      );
    }

    // CRITICAL: Verify business exists before creating provider
    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    // Encrypt credentials
    const encryptedCredentials = EncryptionService.encrypt(JSON.stringify(credentials));
    
    // Generate webhook secret
    const webhookSecret = crypto.randomBytes(32).toString('hex');

    // If this is set as primary, unset other primary providers
    if (isPrimary) {
      await PaymentProvider.updateMany(
        { businessId },
        { $set: { isPrimary: false } }
      );
    }

    // Create payment provider
    const paymentProvider = await PaymentProvider.create({
      businessId,
      provider,
      providerName: providerName || provider,
      credentials: encryptedCredentials,
      webhookSecret,
      testMode: testMode !== false, // Default to true
      isPrimary: isPrimary || false,
      ...otherData,
    });

    // Add to business's payment providers array
    business.paymentProviders.addToSet(paymentProvider._id);
    await business.save();

    // Return without sensitive data
    const { credentials: _, webhookSecret: __, ...safeProvider } = paymentProvider.toObject();

    return NextResponse.json({
      success: true,
      data: safeProvider,
      message: 'Payment provider added successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding payment provider:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add provider' },
      { status: 500 }
    );
  }
}

