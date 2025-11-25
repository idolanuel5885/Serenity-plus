# Email Deliverability Guide

## Problem: Emails Going to Spam

If your emails are going to spam, it's usually because:
1. Using unverified/default sender domain (`onboarding@resend.dev`)
2. Missing SPF, DKIM, and DMARC DNS records
3. Email content triggering spam filters
4. Low sender reputation

## Solution: Verify Your Domain in Resend

### Step 1: Add Domain in Resend

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain (e.g., `serenity-plus.app` or your custom domain)
4. Resend will provide DNS records to add

### Step 2: Add DNS Records

Resend will show you the DNS records to add. You need to add these to your domain's DNS settings:

#### SPF Record (TXT)
```
v=spf1 include:resend.com ~all
```

#### DKIM Record (TXT)
Resend will provide a unique DKIM record like:
```
resend._domainkey.yourdomain.com
```

#### DMARC Record (TXT)
```
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

**Where to add these:**
- If using Vercel domain: Vercel doesn't support custom DNS records directly
- If using custom domain: Add to your domain registrar's DNS settings (e.g., Namecheap, GoDaddy, Cloudflare)

### Step 3: Verify Domain in Resend

1. After adding DNS records, wait a few minutes for propagation
2. Go back to Resend dashboard
3. Click **"Verify"** next to your domain
4. Resend will check the DNS records

### Step 4: Update Environment Variables

Once your domain is verified:

1. **Set `RESEND_FROM_EMAIL` in Vercel:**
   - Go to Vercel → Project → Settings → Environment Variables
   - Add: `RESEND_FROM_EMAIL` = `Serenity+ <noreply@yourdomain.com>`
   - Use your verified domain (e.g., `noreply@serenity-plus.app`)

2. **Optional: Set `RESEND_REPLY_TO`:**
   - Add: `RESEND_REPLY_TO` = `support@yourdomain.com`
   - This is where replies will go

3. **Redeploy** your application

### Step 5: Test

1. Complete onboarding again
2. Check if email arrives in inbox (not spam)
3. Check Resend dashboard for delivery status

## Alternative: Use Resend's Verified Domain

If you don't have a custom domain yet, you can:

1. Use Resend's default domain temporarily (`onboarding@resend.dev`)
2. Ask users to mark emails as "Not Spam" to improve deliverability
3. Set up a custom domain later when ready

## Improving Email Content

To avoid spam filters, make sure your email:

1. **Has clear, personal content** (not generic)
2. **Includes unsubscribe link** (if required by law)
3. **Avoids spam trigger words** (FREE, CLICK NOW, etc.)
4. **Has proper HTML structure**
5. **Includes plain text version** (we already do this)

## Monitoring Deliverability

1. **Check Resend Dashboard:**
   - Go to [Resend Emails](https://resend.com/emails)
   - See delivery status, bounces, complaints

2. **Check Spam Rates:**
   - Monitor bounce rates in Resend
   - If bounce rate > 5%, investigate

3. **Test with Multiple Providers:**
   - Gmail, Outlook, Yahoo, etc.
   - Some providers are stricter than others

## Quick Fix (Temporary)

If you need emails working immediately while setting up domain verification:

1. Ask users to:
   - Check spam folder
   - Mark as "Not Spam"
   - Add sender to contacts

2. This helps improve sender reputation over time

## Long-term Solution

For production, you should:
1. ✅ Verify your own domain in Resend
2. ✅ Set up SPF, DKIM, DMARC records
3. ✅ Use verified domain for "from" address
4. ✅ Monitor deliverability metrics
5. ✅ Warm up your domain (send gradually increasing volume)

