# DNS Setup Guide for Email Deliverability

## Where to Add DNS Records

The location depends on **where your domain's DNS is managed**. Here are the common scenarios:

---

## Scenario 1: Domain Registered with a Registrar (Most Common)

If you bought your domain from a registrar like:
- **Namecheap**
- **GoDaddy**
- **Google Domains**
- **Cloudflare**
- **Name.com**
- **Hover**
- etc.

### Steps:

1. **Log into your domain registrar account**

2. **Find DNS Management:**
   - Look for: "DNS Management", "DNS Settings", "Manage DNS", "DNS Records", or "Advanced DNS"
   - Usually found in: Domain Settings → DNS / Nameservers

3. **Add the DNS records:**
   - Resend will show you the exact records to add
   - You'll need to add **TXT records** for SPF, DKIM, and DMARC
   - Each record has a specific "Name/Host" and "Value"

4. **Example locations by provider:**

   **Namecheap:**
   - Dashboard → Domain List → Manage → Advanced DNS
   - Click "Add New Record" → Select "TXT Record"

   **GoDaddy:**
   - My Products → DNS → Records
   - Click "Add" → Select "TXT"

   **Cloudflare:**
   - Select domain → DNS → Records
   - Click "Add record" → Type: TXT

   **Google Domains:**
   - My Domains → DNS → Custom records
   - Click "Add" → Type: TXT

---

## Scenario 2: Using Vercel Domain

If you're using a **Vercel-provided domain** (e.g., `your-app.vercel.app`):

**⚠️ Problem:** Vercel doesn't allow you to add custom DNS records for their domains.

**Solution:** You need to:
1. Use a custom domain (buy one from a registrar)
2. Point it to Vercel
3. Add DNS records at your registrar

---

## Scenario 3: Custom Domain Pointed to Vercel

If you have a custom domain (e.g., `serenity-plus.app`) that's connected to Vercel:

1. **Check where DNS is managed:**
   - If you're using Vercel's nameservers: You can't add custom records
   - If you're using your registrar's nameservers: Add records at your registrar

2. **To use your registrar's DNS:**
   - In Vercel: Project → Settings → Domains
   - Make sure your domain uses your registrar's nameservers (not Vercel's)
   - Then add DNS records at your registrar

---

## Step-by-Step: Adding Records in Resend

1. **Go to Resend Dashboard:**
   - Visit [resend.com/domains](https://resend.com/domains)
   - Click "Add Domain"
   - Enter your domain (e.g., `serenity-plus.app`)

2. **Resend will show you records like:**

   **SPF Record (TXT):**
   ```
   Name: @ (or your domain name)
   Value: v=spf1 include:resend.com ~all
   ```

   **DKIM Record (TXT):**
   ```
   Name: resend._domainkey (or similar)
   Value: [long string provided by Resend]
   ```

   **DMARC Record (TXT):**
   ```
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
   ```

3. **Copy each record** and add it to your DNS provider

---

## How to Add Records (General Steps)

### For TXT Records:

1. **Name/Host:** 
   - For root domain: `@` or leave blank (depends on provider)
   - For subdomain: `resend._domainkey` or `_dmarc`

2. **Type:** `TXT`

3. **Value:** The exact string from Resend (copy-paste carefully)

4. **TTL:** Usually `3600` (1 hour) or default

5. **Save** the record

---

## Verifying Records Are Added

### Method 1: Wait and Check in Resend
- After adding records, wait 5-10 minutes for DNS propagation
- Go back to Resend dashboard
- Click "Verify" next to your domain
- Resend will check if records are found

### Method 2: Check with DNS Lookup Tool
- Visit [mxtoolbox.com](https://mxtoolbox.com/TXTLookup.aspx)
- Enter your domain
- Check if SPF, DKIM, DMARC records appear

### Method 3: Command Line
```bash
# Check SPF
dig TXT yourdomain.com

# Check DKIM
dig TXT resend._domainkey.yourdomain.com

# Check DMARC
dig TXT _dmarc.yourdomain.com
```

---

## Common Issues

### "Records not found"
- **Wait longer:** DNS propagation can take up to 48 hours (usually 5-30 minutes)
- **Check spelling:** Make sure you copied the exact values
- **Check name field:** Some providers need `@`, others need the full domain name

### "Wrong nameservers"
- Make sure you're adding records where your nameservers point
- If using Vercel nameservers, you can't add custom records
- Switch to your registrar's nameservers if needed

### "Domain not verified"
- Double-check all three records (SPF, DKIM, DMARC) are added
- Wait for DNS propagation
- Try verifying again in Resend

---

## Quick Checklist

- [ ] Domain registered with a registrar (not just Vercel domain)
- [ ] Logged into registrar's DNS management
- [ ] Added SPF record (TXT)
- [ ] Added DKIM record (TXT)
- [ ] Added DMARC record (TXT)
- [ ] Waited 5-10 minutes for propagation
- [ ] Clicked "Verify" in Resend dashboard
- [ ] Domain shows as "Verified" in Resend

---

## Need Help?

1. **Check Resend's documentation:** [resend.com/docs](https://resend.com/docs)
2. **Contact your domain registrar's support** if you can't find DNS settings
3. **Use Resend's domain verification tool** - it will tell you which records are missing

