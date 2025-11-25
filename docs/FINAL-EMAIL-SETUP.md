# Final Step: Enable Custom Domain for Emails

## What You've Done So Far

✅ Bought domain  
✅ Added domain to Vercel  
✅ Added Vercel DNS records to Namecheap  
✅ Added domain to Resend  
✅ Added Resend DNS records to Namecheap  
✅ Verified domain in Resend  

## Final Step: Set Environment Variable

To actually use your custom domain for sending emails, you need to:

### 1. Set Environment Variable in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Name:** `RESEND_FROM_EMAIL`
   - **Value:** `Serenity+ <noreply@yourdomain.com>` 
     - Replace `yourdomain.com` with your actual domain
     - Example: `Serenity+ <noreply@serenityplus.app>`
   - **Environment:** Select all (Production, Preview, Development)
5. Click **Save**

### 2. Redeploy

After adding the environment variable:

**Option A: Automatic (if enabled)**
- Vercel might auto-redeploy when you add env vars
- Check the Deployments tab to see if a new deployment started

**Option B: Manual Redeploy**
- Go to **Deployments** tab
- Click the three dots (⋯) on the latest deployment
- Click **Redeploy**

### 3. Test

1. Complete onboarding with a real email
2. Check your inbox (should arrive in inbox, not spam!)
3. Check Resend dashboard to confirm email was sent from your domain

---

## Verify It's Working

### Check Environment Variable

1. Go to Vercel → Settings → Environment Variables
2. Confirm `RESEND_FROM_EMAIL` is set correctly
3. Make sure it's enabled for the right environments

### Check Email Headers

When you receive the email:
1. Open the email
2. View email headers/source
3. Check "From:" field - should show `noreply@yourdomain.com` (not `onboarding@resend.dev`)

### Check Resend Dashboard

1. Go to [Resend Emails](https://resend.com/emails)
2. Check recent emails
3. Should show your custom domain as sender

---

## Troubleshooting

### "Still using onboarding@resend.dev"

- **Check:** Is `RESEND_FROM_EMAIL` set in Vercel?
- **Check:** Did you redeploy after adding the env var?
- **Check:** Is the value correct? Format: `Serenity+ <noreply@yourdomain.com>`

### "Domain not verified in Resend"

- Go back to Resend → Domains
- Make sure domain shows as "Verified" ✅
- If not, check DNS records are correct

### "Emails still going to spam"

- Wait 24-48 hours for domain reputation to build
- Ask users to mark as "Not Spam"
- Check Resend dashboard for bounce/complaint rates

---

## Quick Checklist

- [ ] Set `RESEND_FROM_EMAIL` in Vercel environment variables
- [ ] Value format: `Serenity+ <noreply@yourdomain.com>`
- [ ] Enabled for all environments (Production, Preview, Development)
- [ ] Redeployed application
- [ ] Tested by completing onboarding
- [ ] Verified email arrives from custom domain
- [ ] Checked email is in inbox (not spam)

---

## Summary

**Yes, you need to:**
1. ✅ Set `RESEND_FROM_EMAIL` environment variable in Vercel
2. ✅ Redeploy (or wait for auto-redeploy)

**Then emails will use your custom domain!**

