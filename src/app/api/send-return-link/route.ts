import { NextRequest, NextResponse } from 'next/server';
import { sendReturnLinkEmail } from '../../../lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, returnToken, userName } = body;

    if (!email || !returnToken) {
      return NextResponse.json(
        { error: 'Missing required fields: email and returnToken' },
        { status: 400 }
      );
    }

    // Send the email
    const success = await sendReturnLinkEmail({
      email,
      returnToken,
      userName,
    });

    if (success) {
      return NextResponse.json({ success: true, message: 'Return link email sent successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email. Check server logs for details.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in send-return-link API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

