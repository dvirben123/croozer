import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * POST /api/auth/facebook/callback
 * Create backend session after successful Facebook login
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { accessToken, userID } = body;

    if (!accessToken || !userID) {
      return NextResponse.json(
        { success: false, error: 'Access token and user ID are required' },
        { status: 400 }
      );
    }

    // Verify token with Facebook and get user info
    const fbResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${accessToken}&fields=id,name,email,picture.type(large)`
    );

    if (!fbResponse.ok) {
      console.error('Facebook API error:', await fbResponse.text());
      return NextResponse.json(
        { success: false, error: 'Failed to verify Facebook token' },
        { status: 401 }
      );
    }

    const fbUser = await fbResponse.json();

    // Validate that the token belongs to the claimed user
    if (fbUser.error || fbUser.id !== userID) {
      console.error('Token validation failed:', fbUser);
      return NextResponse.json(
        { success: false, error: 'Invalid Facebook token' },
        { status: 401 }
      );
    }

    // Create or update user in database
    let user = await User.findOne({ facebookId: fbUser.id });

    if (user) {
      // Update existing user
      user.name = fbUser.name;
      user.email = fbUser.email;
      user.picture = fbUser.picture?.data?.url;
      await user.updateLastLogin();
    } else {
      // Create new user
      user = await User.create({
        facebookId: fbUser.id,
        name: fbUser.name,
        email: fbUser.email,
        picture: fbUser.picture?.data?.url,
        lastLoginAt: new Date(),
      });
    }

    // Create session object matching our SessionUser interface
    const sessionUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email || '',
      picture: {
        data: {
          url: user.picture || '',
        },
      },
    };

    // Set production session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('✅ Facebook login successful for user:', user.name);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (error: any) {
    console.error('Facebook callback error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
