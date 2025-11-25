/**
 * Email service for sending magic link return emails
 * Uses Resend API (same as alerting system)
 */

interface SendReturnLinkOptions {
  email: string;
  returnToken: string;
  userName?: string;
}

/**
 * Get the base URL for return links (staging or production)
 */
function getBaseUrl(): string {
  // In production, use the actual domain
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback to Vercel URL if available
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Development fallback
  return 'http://localhost:3000';
}

/**
 * Send a magic link return email to the user
 */
export async function sendReturnLinkEmail(options: SendReturnLinkOptions): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  console.log('sendReturnLinkEmail called with:', {
    email: options.email,
    returnToken: options.returnToken ? `${options.returnToken.substring(0, 10)}...` : null,
    userName: options.userName,
  });

  if (!resendApiKey) {
    console.error('Email service not configured: RESEND_API_KEY not set');
    return false;
  }

  try {
    const baseUrl = getBaseUrl();
    const returnLink = `${baseUrl}/return?token=${options.returnToken}`;
    
    console.log('Base URL:', baseUrl);
    console.log('Return link:', returnLink);
    
    const userName = options.userName || 'there';
    const subject = 'Your SerenityPlus link';
    
    // Simple, friendly email template
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a; margin-bottom: 20px;">Hi ${userName},</h2>
        
        <p style="color: #4a4a4a; line-height: 1.6; margin-bottom: 20px;">
          Here's your link to return to your lotus and partner from any device.
        </p>
        
        <p style="color: #4a4a4a; line-height: 1.6; margin-bottom: 20px;">
          If you ever lose access or change phone, just open this link:
        </p>
        
        <div style="margin: 30px 0;">
          <a 
            href="${returnLink}" 
            style="display: inline-block; background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;"
          >
            Return to Serenity+
          </a>
        </div>
        
        <p style="color: #8a8a8a; font-size: 14px; line-height: 1.6; margin-top: 30px;">
          Or copy and paste this link into your browser:<br/>
          <span style="word-break: break-all; color: #4a4a4a;">${returnLink}</span>
        </p>
        
        <p style="color: #8a8a8a; font-size: 14px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
          No passwords, no spam — just this link. Keep it safe.
        </p>
      </div>
    `;
    
    const textBody = `
Hi ${userName},

Here's your link to return to your lotus and partner from any device.

If you ever lose access or change phone, just open this link:

${returnLink}

No passwords, no spam — just this link. Keep it safe.
    `.trim();

    const emailPayload = {
      from: 'Serenity+ <onboarding@resend.dev>', // Use Resend's default domain for testing
      to: [options.email],
      subject: subject,
      html: htmlBody,
      text: textBody,
    };

    console.log('Sending email via Resend API...');
    console.log('Email payload:', {
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject,
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const responseText = await response.text();
    console.log('Resend API response status:', response.status);
    console.log('Resend API response:', responseText);

    if (!response.ok) {
      console.error('Failed to send return link email. Status:', response.status);
      console.error('Error response:', responseText);
      return false;
    }

    const responseData = JSON.parse(responseText);
    console.log(`✅ Return link email sent to ${options.email}. Email ID:`, responseData.id);
    return true;
  } catch (error) {
    console.error('Error sending return link email:', error);
    return false;
  }
}

