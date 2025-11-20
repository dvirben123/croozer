import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Business from '@/models/Business';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { businessId, stepNumber, stepName, data } = body;

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Validate stepNumber range
    if (typeof stepNumber !== 'number' || stepNumber < 0 || stepNumber > 7) {
      return NextResponse.json(
        { success: false, error: 'Invalid step number (must be 0-7)' },
        { status: 400 }
      );
    }

    const business = await Business.findById(businessId);

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    // CRITICAL: Whitelist allowed fields to prevent arbitrary business modifications
    if (data) {
      const allowedFields = [
        'name',
        'phone',
        'email',
        'address',
        'businessHours',
        'category',
        'description',
        'settings',
      ];

      allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
          business[field] = data[field];
        }
      });
    }

    // Update onboarding progress
    business.onboarding.currentStep = stepNumber;
    
    if (stepName && !business.onboarding.stepsCompleted.includes(stepName)) {
      business.onboarding.stepsCompleted.push(stepName);
    }

    // Check if all steps are completed (7 steps total)
    if (stepNumber >= 7) {
      business.onboarding.completed = true;
      business.status = 'active';
    }

    await business.save();

    // Return only safe fields (avoid exposing sensitive data)
    return NextResponse.json({
      success: true,
      data: {
        businessId: business._id,
        onboarding: business.onboarding,
        status: business.status,
        name: business.name,
      },
      message: 'Step progress saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving step progress:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save progress' },
      { status: 500 }
    );
  }
}

