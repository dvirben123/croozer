import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PaymentProvider from '@/models/PaymentProvider';

// DELETE /api/payments/providers/[id] - Delete a payment provider
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const provider = await PaymentProvider.findOneAndDelete({
      _id: params.id,
      businessId,
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Payment provider not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment provider deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting payment provider:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete provider' },
      { status: 500 }
    );
  }
}

// PUT /api/payments/providers/[id] - Update a payment provider
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const body = await request.json();
    const { businessId, isPrimary, ...updateData } = body;

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // If setting as primary, unset other primary providers
    if (isPrimary) {
      await PaymentProvider.updateMany(
        { businessId },
        { $set: { isPrimary: false } }
      );
    }

    const provider = await PaymentProvider.findOneAndUpdate(
      { _id: params.id, businessId },
      { ...updateData, isPrimary },
      { new: true, runValidators: true }
    );

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Payment provider not found or unauthorized' },
        { status: 404 }
      );
    }

    // Return without sensitive data
    const { credentials, webhookSecret, ...safeProvider } = provider.toObject();

    return NextResponse.json({
      success: true,
      data: safeProvider,
      message: 'Payment provider updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating payment provider:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update provider' },
      { status: 500 }
    );
  }
}

