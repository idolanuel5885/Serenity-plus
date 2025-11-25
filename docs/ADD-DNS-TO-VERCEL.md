# How to Add DNS Records for Vercel Domain

## Overview

When you add a domain to Vercel, Vercel tells you which DNS records to add. You need to add these records at **wherever your domain's DNS is managed** (usually your domain registrar).

---

## Step 1: Get DNS Records from Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Domains**
3. Click **Add Domain** or **Add** next to your domain
4. Enter your domain (e.g., `serenityplus.app`)
5. Vercel will show you DNS records like:

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   OR

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

6. **Copy these records** - you'll need them in the next step

---

## Step 2: Find DNS Management at Your Registrar

The location depends on **where you bought your domain**. Here's where to find it:

### Namecheap

1. Log into [Namecheap.com](https://www.namecheap.com)
2. Go to **Domain List** (top menu)
3. Click **Manage** next to your domain
4. Click **Advanced DNS** tab
5. Scroll down to **Host Records** section
6. Click **Add New Record**
7. Select the type (A or CNAME)
8. Enter the values from Vercel
9. Click the checkmark to save

**Screenshot locations:**
- Domain List → Manage → Advanced DNS → Host Records

### GoDaddy

1. Log into [GoDaddy.com](https://www.godaddy.com)
2. Go to **My Products**
3. Find your domain, click **DNS** (or three dots → Manage DNS)
4. Scroll to **Records** section
5. Click **Add** button
6. Select Type (A or CNAME)
7. Enter Name and Value from Vercel
8. Click **Save**

**Screenshot locations:**
- My Products → [Your Domain] → DNS → Records

### Cloudflare

1. Log into [Cloudflare.com](https://www.cloudflare.com)
2. Select your domain
3. Click **DNS** in the left sidebar
4. Click **Add record**
5. Select Type (A or CNAME)
6. Enter Name and Content (Value) from Vercel
7. Click **Save**

**Screenshot locations:**
- Dashboard → [Your Domain] → DNS → Records

### Google Domains / Squarespace Domains

1. Log into [domains.google.com](https://domains.google.com) or [squarespace.com/domains](https://www.squarespace.com/domains)
2. Click on your domain
3. Go to **DNS** or **DNS Settings**
4. Click **Add** or **Custom records**
5. Select Type (A or CNAME)
6. Enter Host name and Data (Value) from Vercel
7. Click **Save**

### Name.com

1. Log into [Name.com](https://www.name.com)
2. Go to **My Domains**
3. Click your domain
4. Click **DNS Records** tab
5. Click **Add Record**
6. Select Type (A or CNAME)
7. Enter Host and Answer (Value) from Vercel
8. Click **Add Record**

### Hover

1. Log into [Hover.com](https://www.hover.com)
2. Go to **Domains**
3. Click your domain
4. Click **DNS** tab
5. Click **Add New**
6. Select Type (A or CNAME)
7. Enter Host and Points to (Value) from Vercel
8. Click **Save**

### Porkbun

1. Log into [Porkbun.com](https://porkbun.com)
2. Go to **My Domains**
3. Click your domain
4. Click **DNS** tab
5. Click **Add** button
6. Select Type (A or CNAME)
7. Enter Subdomain and Content (Value) from Vercel
8. Click **Add**

---

## Step 3: Understanding the Fields

When adding records, you'll see fields like:

### For A Record:
- **Type:** A
- **Name/Host:** Usually `@` (means root domain) or leave blank
- **Value/Points to/Answer:** The IP address from Vercel (e.g., `76.76.21.21`)
- **TTL:** Usually `3600` or leave as default

### For CNAME Record:
- **Type:** CNAME
- **Name/Host:** Usually `www` or subdomain name
- **Value/Points to/Answer:** The CNAME from Vercel (e.g., `cname.vercel-dns.com`)
- **TTL:** Usually `3600` or leave as default

**Note:** Some registrars use different field names:
- "Name" = "Host" = "Subdomain"
- "Value" = "Points to" = "Answer" = "Content" = "Data"

---

## Step 4: Common Vercel DNS Records

Vercel typically asks for one of these:

### Option A: A Record (Root Domain)
```
Type: A
Name: @ (or blank, or your domain name)
Value: 76.76.21.21 (IP address Vercel provides)
```

### Option B: CNAME Record (Subdomain)
```
Type: CNAME
Name: www (or subdomain name)
Value: cname.vercel-dns.com (or similar)
```

### Option C: Both (Root + WWW)
```
A Record:
Type: A
Name: @
Value: 76.76.21.21

CNAME Record:
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Add exactly what Vercel shows you!**

---

## Step 5: Wait for Propagation

After adding records:

1. **Wait 5-30 minutes** for DNS propagation
2. Go back to Vercel → Settings → Domains
3. Vercel should show your domain as "Valid" or "Active"
4. If it shows an error, wait a bit longer and refresh

---

## Step 6: Verify It Works

1. Visit your domain in a browser (e.g., `https://yourdomain.com`)
2. It should show your Vercel-deployed app
3. If it doesn't work:
   - Check you added the correct records
   - Wait longer (DNS can take up to 48 hours, usually 5-30 min)
   - Double-check the values match exactly what Vercel showed

---

## Troubleshooting

### "Domain not pointing to Vercel"
- **Check:** Did you add the exact records Vercel provided?
- **Check:** Did you wait 5-30 minutes for propagation?
- **Check:** Are you using the right nameservers? (Should be your registrar's, not Vercel's)

### "Can't find DNS settings"
- Look for: "DNS Management", "DNS Records", "Advanced DNS", "DNS Settings"
- Some registrars hide it under "Advanced" or "Settings"
- Contact your registrar's support if you can't find it

### "Wrong nameservers"
- If Vercel shows nameservers to use, you need to change nameservers at your registrar
- This is different from adding DNS records
- Usually in "Nameservers" or "DNS" section

### "Record already exists"
- Delete the old record first
- Then add the new one from Vercel

---

## Quick Checklist

- [ ] Got DNS records from Vercel (Settings → Domains)
- [ ] Logged into domain registrar
- [ ] Found DNS Management section
- [ ] Added A record (if Vercel provided one)
- [ ] Added CNAME record (if Vercel provided one)
- [ ] Saved/Applied changes
- [ ] Waited 5-30 minutes
- [ ] Checked Vercel dashboard - domain shows as valid
- [ ] Tested domain in browser - app loads

---

## Still Need Help?

1. **Check Vercel's guide:** [vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)
2. **Contact your registrar's support** - they can help you add DNS records
3. **Check Vercel's domain status** - it will tell you what's missing

