# Domain Solution for Email Deliverability

## Problem
Resend doesn't support Vercel-provided domains (`*.vercel.app`). You need a domain you own.

## Solutions (Fastest to Best)

### Option 1: Use Existing Domain (Fastest - 5 minutes)

If you already own any domain:

1. **Add subdomain to Vercel:**
   - Go to Vercel → Project → Settings → Domains
   - Add: `serenity.yourdomain.com` (or any subdomain)
   - Vercel will give you DNS records to add at your registrar

2. **Add DNS records at your registrar:**
   - Add the CNAME record Vercel provides
   - Point subdomain to Vercel

3. **Verify subdomain in Resend:**
   - Go to Resend → Add Domain
   - Enter: `yourdomain.com` (root domain, not subdomain)
   - Add SPF, DKIM, DMARC records
   - Use `noreply@yourdomain.com` for emails

**Time:** 5-10 minutes if you already have a domain

---

### Option 2: Buy Cheap Domain (10-15 minutes)

**Recommended providers:**
- **Namecheap:** ~$1-10/year for `.com` (first year often $1-2)
- **Porkbun:** Very cheap domains
- **Cloudflare Registrar:** At-cost pricing (~$8-10/year for .com)

**Steps:**
1. Buy domain (e.g., `serenityplus.app` or `serenitymeditation.com`)
2. Add domain to Vercel project
3. Add DNS records Vercel provides at registrar
4. Verify domain in Resend
5. Set `RESEND_FROM_EMAIL` environment variable

**Time:** 10-15 minutes + domain purchase

---

### Option 3: Use Free Domain Service (Temporary)

**Freenom (.tk, .ml, .ga domains):**
- Free domains (but unreliable, often blocked)
- Not recommended for production

**Not recommended** - these domains are often blocked by email providers

---

### Option 4: Continue with Resend Default (Temporary Workaround)

**Current setup:** Using `onboarding@resend.dev`

**Pros:**
- Works immediately
- No setup needed

**Cons:**
- Emails go to spam
- Lower deliverability

**To improve:**
- Ask users to mark as "Not Spam"
- This helps build reputation over time

---

## Recommended: Option 1 or 2

### If you have any domain already:
→ Use Option 1 (subdomain) - **5 minutes**

### If you don't have a domain:
→ Use Option 2 (buy cheap domain) - **10-15 minutes**

---

## Step-by-Step: Buying and Setting Up Domain

### 1. Buy Domain
- Go to Namecheap.com (or your preferred registrar)
- Search for domain (e.g., `serenityplus.app`)
- Add to cart and checkout (~$1-10)

### 2. Add to Vercel
- Vercel → Project → Settings → Domains
- Add your domain
- Vercel shows DNS records to add

### 3. Add DNS at Registrar
- Go to your registrar's DNS management
- Add the records Vercel provides (usually just a CNAME or A record)
- Wait 5-10 minutes for propagation

### 4. Verify in Resend
- Resend → Add Domain → Enter your domain
- Add SPF, DKIM, DMARC records (Resend provides exact values)
- Wait 5-10 minutes, then click "Verify"

### 5. Update Environment Variable
- Vercel → Settings → Environment Variables
- Add: `RESEND_FROM_EMAIL` = `Serenity+ <noreply@yourdomain.com>`
- Redeploy

**Total time:** ~15-20 minutes

---

## Quick Decision Tree

```
Do you own any domain?
├─ YES → Use subdomain (Option 1) - 5 min
└─ NO → Buy cheap domain (Option 2) - 15 min
```

---

## Cost Comparison

- **Option 1 (subdomain):** Free (if you own domain)
- **Option 2 (new domain):** $1-10/year
- **Option 4 (Resend default):** Free but emails go to spam

---

## Recommendation

**For a pilot with ~20 people:**
- If you have any domain: Use Option 1 (subdomain)
- If not: Buy a cheap `.app` or `.com` domain (~$1-2 first year)
- Set it up once, use it forever

The domain will be useful for:
- Better email deliverability
- Professional appearance
- Future branding

