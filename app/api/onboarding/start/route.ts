import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Business from '@/models/Business';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // TODO: Get userId from session (Facebook OAuth)
    // For now, we'll expect it in the request body
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      );
    }

    // Check if user already has a business
    const existingBusiness = await Business.findOne({ userId });

    if (existingBusiness) {
      return NextResponse.json({
        success: true,
        data: existingBusiness,
        message: 'Business already exists',
      });
    }

    // Create new business with pending_setup status
    // Use placeholder values that will be updated in step 1
    const business = await Business.create({
      userId,
      name: `Business_${userId.substring(0, 8)}`, // Temporary name
      type: 'restaurant',
      phone: '0000000000', // Temporary phone
      email: `${userId}@temp.local`, // Temporary email
      status: 'pending_setup',
      onboarding: {
        completed: false,
        currentStep: 0,
        stepsCompleted: [],
      },
    });

    return NextResponse.json({
      success: true,
      data: business,
      message: 'Onboarding started successfully',
    });
  } catch (error: any) {
    console.error('Error starting onboarding:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start onboarding' },
      { status: 500 }
    );
  }
}

