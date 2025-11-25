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

    // Use custom domain if configured, otherwise fall back to Resend's default
    // For production, you should verify your own domain in Resend and use it here
    let fromEmail = process.env.RESEND_FROM_EMAIL || 'Serenity+ <onboarding@resend.dev>';
    
    // If using custom domain, we'll try it first, but fall back to Resend default if it fails
    // This prevents 403 errors during development/testing when domain isn't verified yet
    const isCustomDomain = fromEmail.includes('@') && !fromEmail.includes('@resend.dev');
    if (isCustomDomain) {
      // Extract domain from email
      const domainMatch = fromEmail.match(/@([^\s>]+)/);
      if (domainMatch) {
        const domain = domainMatch[1];
        console.log(`Attempting to use custom domain: ${domain}`);
        console.log('Note: If domain is not verified in Resend, email will fail with 403');
      }
    }
    
    // Build email payload
    const emailPayload: any = {
      from: fromEmail,
      to: [options.email],
      subject: subject,
      html: htmlBody,
      text: textBody,
    };
    
    // Add reply-to only if explicitly set (optional field)
    const replyTo = process.env.RESEND_REPLY_TO;
    if (replyTo) {
      emailPayload.reply_to = replyTo;
    }

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
      
      // Try to parse error response for better logging
      let errorData: any = null;
      try {
        errorData = JSON.parse(responseText);
        console.error('Parsed error data:', errorData);
      } catch (e) {
        // Response is not JSON, log as-is
        console.error('Non-JSON error response:', responseText);
      }
      
      // If it's a 403 domain verification error and we're using a custom domain,
      // automatically retry with Resend's default domain
      if (response.status === 403 && errorData?.message?.includes('domain is not verified') && isCustomDomain) {
        console.log('⚠️ Custom domain not verified, retrying with Resend default domain...');
        const fallbackFromEmail = 'Serenity+ <onboarding@resend.dev>';
        
        // Retry with default domain
        const fallbackPayload: any = {
          from: fallbackFromEmail,
          to: [options.email],
          subject: subject,
          html: htmlBody,
          text: textBody,
        };
        
        if (process.env.RESEND_REPLY_TO) {
          fallbackPayload.reply_to = process.env.RESEND_REPLY_TO;
        }
        
        const fallbackResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fallbackPayload),
        });
        
        const fallbackResponseText = await fallbackResponse.text();
        console.log('Fallback email response status:', fallbackResponse.status);
        console.log('Fallback email response:', fallbackResponseText);
        
        if (fallbackResponse.ok) {
          try {
            const fallbackData = JSON.parse(fallbackResponseText);
            console.log(`✅ Return link email sent using fallback domain to ${options.email}. Email ID:`, fallbackData.id);
            console.log('⚠️ Note: Custom domain not verified. Please verify your domain in Resend to use custom email address.');
            return true;
          } catch (e) {
            console.error('Failed to parse fallback response as JSON:', e);
            return false;
          }
        } else {
          console.error('Fallback email also failed. Status:', fallbackResponse.status);
          console.error('Fallback error response:', fallbackResponseText);
          return false;
        }
      }
      
      return false;
    }

    // Parse successful response
    try {
      const responseData = JSON.parse(responseText);
      console.log(`✅ Return link email sent to ${options.email}. Email ID:`, responseData.id);
      return true;
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      console.error('Response text:', responseText);
      return false;
    }
  } catch (error: any) {
    console.error('Error sending return link email:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    return false;
  }
}

