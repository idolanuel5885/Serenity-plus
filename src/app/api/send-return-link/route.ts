import { NextRequest, NextResponse } from 'next/server';
import { sendReturnLinkEmail } from '../../../lib/email-service';

export async function POST(request: NextRequest) {
  console.log('=== SEND RETURN LINK API CALLED ===');
  
  try {
    const body = await request.json();
    const { email, returnToken, userName } = body;

    console.log('Request body:', { email, returnToken: returnToken ? `${returnToken.substring(0, 10)}...` : null, userName });

    if (!email || !returnToken) {
      console.error('Missing required fields:', { email: !!email, returnToken: !!returnToken });
      return NextResponse.json(
        { error: 'Missing required fields: email and returnToken' },
        { status: 400 }
      );
    }

    // Check if RESEND_API_KEY is set
    const resendApiKey = process.env.RESEND_API_KEY;
    console.log('RESEND_API_KEY configured:', !!resendApiKey);
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Email service not configured. RESEND_API_KEY is missing.' },
        { status: 500 }
      );
    }

    // Send the email
    console.log('Calling sendReturnLinkEmail...');
    try {
      const success = await sendReturnLinkEmail({
        email,
        returnToken,
        userName,
      });

      console.log('Email send result:', success);

      if (success) {
        return NextResponse.json({ success: true, message: 'Return link email sent successfully' });
      } else {
        console.error('sendReturnLinkEmail returned false - email sending failed');
        return NextResponse.json(
          { error: 'Failed to send email. Check server logs for details.' },
          { status: 500 }
        );
      }
    } catch (emailError: any) {
      console.error('Exception in sendReturnLinkEmail:', emailError);
      console.error('Exception message:', emailError?.message);
      console.error('Exception stack:', emailError?.stack);
      return NextResponse.json(
        { error: 'Failed to send email', details: emailError?.message || 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in send-return-link API:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

