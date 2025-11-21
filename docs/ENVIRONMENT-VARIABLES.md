# Environment Variables Setup Guide

## Required Environment Variables

### `RESEND_API_KEY`

**Purpose:** API key for Resend email service (used for sending magic link return emails and alerts)

**How to get a Resend API key:**
1. Go to [https://resend.com](https://resend.com)
2. Sign up or log in
3. Navigate to **API Keys** in the dashboard
4. Click **Create API Key**
5. Give it a name (e.g., "Serenity+ Production")
6. Copy the API key (starts with `re_...`)

## Setting Environment Variables

### For Vercel (Production/Staging)

1. **Go to your Vercel project:**
   - Visit [https://vercel.com](https://vercel.com)
   - Select your project (serenity-plus)

2. **Navigate to Settings:**
   - Click on your project
   - Go to **Settings** tab
   - Click **Environment Variables** in the sidebar

3. **Add the variable:**
   - Click **Add New**
   - **Name:** `RESEND_API_KEY`
   - **Value:** Paste your Resend API key (starts with `re_...`)
   - **Environment:** Select all environments (Production, Preview, Development)
   - Click **Save**

4. **Redeploy:**
   - After adding the variable, you may need to redeploy for it to take effect
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**

### For Local Development

1. **Create a `.env.local` file** in the project root (if it doesn't exist):
   ```bash
   touch .env.local
   ```

2. **Add the variable:**
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   ```

3. **Restart your development server:**
   - Stop the server (Ctrl+C)
   - Start it again: `npm run dev`

**Note:** `.env.local` is already in `.gitignore`, so it won't be committed to git.

### Optional: Other Environment Variables

#### `ALERT_EMAIL` (Optional)
- **Purpose:** Email address to receive system alerts (week creation monitoring)
- **Format:** `your-email@example.com`
- **Where to set:** Same as `RESEND_API_KEY` (Vercel Settings or `.env.local`)

#### `NEXT_PUBLIC_APP_URL` (Optional)
- **Purpose:** Base URL for return links in emails
- **Format:** `https://your-domain.com` (production) or `https://your-app.vercel.app` (staging)
- **Where to set:** Same as above
- **Note:** If not set, the system will use Vercel's `VERCEL_URL` automatically

## Verifying Setup

### Check if variable is set (local development):
```bash
# In your terminal
echo $RESEND_API_KEY
```

### Check in code (for debugging):
Add this temporarily to any API route:
```typescript
console.log('RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
```

### Test email sending:
1. Complete onboarding with a real email address
2. Check your email inbox for the magic link
3. If email doesn't arrive:
   - Check spam folder
   - Check Resend dashboard for delivery status
   - Check server logs for errors

## Troubleshooting

### "Email service not configured" warning
- **Cause:** `RESEND_API_KEY` is not set or is empty
- **Solution:** Follow the setup steps above

### Email not sending
1. **Check Resend dashboard:**
   - Go to [https://resend.com/emails](https://resend.com/emails)
   - Check if emails are being sent
   - Look for error messages

2. **Check API key:**
   - Verify the key is correct (starts with `re_...`)
   - Make sure it's not expired or revoked

3. **Check domain verification:**
   - Resend requires domain verification for production
   - For testing, you can use Resend's default domain
   - Check Resend dashboard → Domains

4. **Check server logs:**
   - Look for error messages in Vercel deployment logs
   - Check browser console for client-side errors

### Environment variable not working after setting
1. **Redeploy:** Vercel requires a redeploy for new environment variables
2. **Restart dev server:** Local development requires restart
3. **Check spelling:** Variable name must be exactly `RESEND_API_KEY`
4. **Check environment:** Make sure variable is set for the correct environment (Production/Preview/Development)

## Security Notes

- **Never commit `.env.local` to git** (already in `.gitignore`)
- **Never share API keys** in public channels
- **Rotate keys** if accidentally exposed
- **Use different keys** for production and development if possible

