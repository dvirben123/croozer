/**
 * API endpoint to send WhatsApp messages
 * This runs on the server where environment variables are available
 */

import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v24.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.META_SYSTEM_USER_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, message, type = 'text', templateName, languageCode } = body;

    // Validate
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!PHONE_NUMBER_ID) {
      return NextResponse.json(
        { success: false, error: 'WHATSAPP_PHONE_NUMBER_ID not configured' },
        { status: 500 }
      );
    }

    if (!ACCESS_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Access token not configured' },
        { status: 500 }
      );
    }

    let payload: any;

    if (type === 'template') {
      // Template message
      payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber.replace(/^\+/, ''),
        type: 'template',
        template: {
          name: templateName || 'hello_world',
          language: {
            code: languageCode || 'en_US',
          },
        },
      };
    } else {
      // Text message
      if (!message) {
        return NextResponse.json(
          { success: false, error: 'Message content is required' },
          { status: 400 }
        );
      }

      payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber.replace(/^\+/, ''),
        type: 'text',
        text: {
          body: message,
        },
      };
    }

    console.log('📤 Sending WhatsApp message:', {
      phoneNumberId: PHONE_NUMBER_ID,
      to: phoneNumber,
      type,
    });

    // Send to WhatsApp API
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ WhatsApp API Error:', data);
      
      const errorMessage = data.error?.message || 'Failed to send message';
      const errorCode = data.error?.code;
      const errorSubcode = data.error?.error_subcode;

      // Provide helpful error messages
      let userMessage = errorMessage;
      
      if (errorCode === 131026) {
        userMessage = 'מספר הטלפון לא רשום כמספר בדיקה. הוסף אותו ב-Meta Dashboard';
      } else if (errorCode === 131047) {
        userMessage = 'חלון 24 שעות פג תוקף. השתמש בתבנית הודעה במקום';
      } else if (errorCode === 190) {
        userMessage = 'שגיאת אימות. בדוק את ה-Access Token';
      } else if (errorCode === 100) {
        userMessage = 'פרמטר לא תקין. בדוק את מספר הטלפון או ההגדרות';
      }

      return NextResponse.json(
        {
          success: false,
          error: userMessage,
          details: {
            code: errorCode,
            subcode: errorSubcode,
            message: errorMessage,
          },
        },
        { status: response.status }
      );
    }

    console.log('✅ Message sent successfully:', data.messages?.[0]?.id);

    return NextResponse.json({
      success: true,
      data,
      message: 'Message sent successfully',
    });

  } catch (error) {
    console.error('❌ Error in send message API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

