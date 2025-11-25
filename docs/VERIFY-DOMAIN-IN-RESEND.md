# How to Verify Domain in Resend

## Error You're Seeing

```
The serenitypond.app domain is not verified. Please, add and verify your domain on https://resend.com/domains
```

This means Resend can't find the DNS records you added, or they're not correct.

---

## Step-by-Step Verification

### Step 1: Check Domain Status in Resend

1. Go to [Resend Domains](https://resend.com/domains)
2. Find your domain (`serenitypond.app`)
3. Check the status:
   - **"Pending Verification"** = DNS records not found yet
   - **"Verified"** ✅ = Domain is ready to use
   - **"Failed"** ❌ = DNS records are incorrect

### Step 2: If Status is "Pending Verification"

#### Option A: Wait and Retry

1. **Wait 10-30 minutes** after adding DNS records
2. DNS propagation can take time
3. Click **"Verify"** button again in Resend

#### Option B: Check DNS Records

1. **Verify records are added correctly:**
   - Go to Namecheap → Domain List → Manage → Advanced DNS
   - Check that all 3 TXT records are there:
     - SPF (Host: `@`, Type: TXT)
     - DKIM (Host: `resend._domainkey`, Type: TXT)
     - DMARC (Host: `_dmarc`, Type: TXT)

2. **Use DNS lookup tool:**
   - Visit [mxtoolbox.com/TXTLookup.aspx](https://mxtoolbox.com/TXTLookup.aspx)
   - Enter your domain: `serenitypond.app`
   - Check if SPF, DKIM, DMARC records appear
   - If they don't appear, DNS hasn't propagated yet

### Step 3: If Status is "Failed"

1. **Check what Resend says is missing:**
   - Resend will show which records are missing/incorrect
   - Usually shows: "SPF not found", "DKIM not found", etc.

2. **Double-check DNS records in Namecheap:**
   - Make sure Host field matches exactly what Resend shows
   - Make sure Value field matches exactly (copy-paste carefully)
   - Make sure Type is "TXT Record"

3. **Common mistakes:**
   - Wrong Host name (e.g., `resend._domainkey.yourdomain.com` instead of just `resend._domainkey`)
   - Missing `@` symbol for SPF record
   - Typos in the Value field
   - Wrong record type (should be TXT, not A or CNAME)

### Step 4: Re-verify

1. After fixing DNS records, wait 5-10 minutes
2. Go back to Resend → Domains
3. Click **"Verify"** button
4. Resend will check DNS records again

---

## Quick Checklist

- [ ] Domain added in Resend dashboard
- [ ] All 3 TXT records added in Namecheap:
  - [ ] SPF (Host: `@`)
  - [ ] DKIM (Host: `resend._domainkey`)
  - [ ] DMARC (Host: `_dmarc`)
- [ ] Waited 10-30 minutes for DNS propagation
- [ ] Clicked "Verify" in Resend
- [ ] Domain shows as "Verified" ✅

---

## Troubleshooting

### "SPF record not found"

**Check:**
- Host field in Namecheap should be `@` (not blank, not domain name)
- Value should start with `v=spf1 include:resend.com ~all`
- Type should be "TXT Record"

**Fix:**
- Delete the record and re-add it
- Make sure you copy-paste the exact value from Resend

### "DKIM record not found"

**Check:**
- Host field should be `resend._domainkey` (without the domain part)
- Value is a long string - make sure you copied the entire thing
- Type should be "TXT Record"

**Fix:**
- In Namecheap, Host should be just `resend._domainkey`
- Don't include `.yourdomain.com` in the Host field
- Copy the entire DKIM value from Resend (it's long!)

### "DMARC record not found"

**Check:**
- Host field should be `_dmarc`
- Value should start with `v=DMARC1`
- Type should be "TXT Record"

**Fix:**
- Make sure Host is exactly `_dmarc` (with underscore)
- Copy the entire DMARC value from Resend

### "Records added but still not verified"

**Possible causes:**
1. **DNS propagation delay** - Wait longer (can take up to 48 hours, usually 5-30 min)
2. **Wrong nameservers** - Make sure you're using Namecheap's nameservers (not Vercel's)
3. **Records in wrong place** - Should be in Namecheap, not Vercel

**Check nameservers:**
- Namecheap → Domain List → Manage → Nameservers
- Should show Namecheap nameservers (e.g., `dns1.registrar-servers.com`)
- If it shows Vercel nameservers, switch to Namecheap's

---

## Using DNS Lookup Tool

To verify records are live:

1. **Check SPF:**
   ```
   dig TXT serenitypond.app
   ```
   Should show: `v=spf1 include:resend.com ~all`

2. **Check DKIM:**
   ```
   dig TXT resend._domainkey.serenitypond.app
   ```
   Should show the DKIM value

3. **Check DMARC:**
   ```
   dig TXT _dmarc.serenitypond.app
   ```
   Should show the DMARC value

**Or use online tool:**
- [mxtoolbox.com/TXTLookup.aspx](https://mxtoolbox.com/TXTLookup.aspx)
- Enter your domain and check results

---

## Temporary Workaround

If you need emails working immediately while fixing verification:

1. **Remove `RESEND_FROM_EMAIL` from Vercel environment variables**
2. **Redeploy**
3. Emails will use `onboarding@resend.dev` (works immediately, but goes to spam)
4. Fix domain verification, then add `RESEND_FROM_EMAIL` back

---

## Summary

**The error means:** Your domain isn't verified in Resend yet.

**To fix:**
1. Check Resend dashboard - what's the domain status?
2. Verify all 3 DNS records are in Namecheap
3. Wait for DNS propagation (10-30 minutes)
4. Click "Verify" in Resend
5. Once verified ✅, emails will work with your custom domain

