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

    const business = await Business.findById(businessId);

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    // Update business with step data
    if (data) {
      Object.assign(business, data);
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

    return NextResponse.json({
      success: true,
      data: business,
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

