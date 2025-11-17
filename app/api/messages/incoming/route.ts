/**
 * API endpoint to fetch incoming WhatsApp messages
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { IncomingMessage } from '@/models/IncomingMessage';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const from = searchParams.get('from'); // Filter by sender

    // Build query
    const query: any = {};
    if (from) {
      query.from = from;
    }

    // Fetch messages
    const messages = await IncomingMessage.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: messages.length,
      data: messages,
    });

  } catch (error) {
    console.error('Error fetching incoming messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch messages',
      },
      { status: 500 }
    );
  }
}

