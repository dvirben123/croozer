import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/logout
 * Clear session and logout user
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Delete all session cookies
    cookieStore.delete('session');
    cookieStore.delete('dev_session');

    console.log('✅ User logged out successfully');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to logout' },
      { status: 500 }
    );
  }
}
