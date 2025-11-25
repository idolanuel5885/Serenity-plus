# Fix "Not Started" Status in Resend

## Current Status

Your domain shows **"Not Started"** in Resend, which means:
- Resend is waiting for you to add DNS records
- You need to manually click "Verify DNS Records" after adding records

---

## Step-by-Step Fix

### Step 1: Get DNS Records from Resend

1. Go to [Resend Domains](https://resend.com/domains)
2. Click on your domain (`serenitypond.app`)
3. You should see a section showing **3 DNS records** to add:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)  
   - **DMARC Record** (TXT) - might be optional

4. **Copy each record** - you'll see something like:

   **SPF:**
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:resend.com ~all
   ```

   **DKIM:**
   ```
   Type: TXT
   Name: resend._domainkey
   Value: [long string of characters]
   ```

   **DMARC (if shown):**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@serenitypond.app
   ```

### Step 2: Add Records to Namecheap

1. **Go to Namecheap:**
   - Log into [Namecheap.com](https://www.namecheap.com)
   - Domain List → Manage → Advanced DNS

2. **Add SPF Record:**
   - Click "Add New Record"
   - Type: `TXT Record`
   - Host: `@`
   - Value: `v=spf1 include:resend.com ~all` (copy from Resend)
   - TTL: `Automatic`
   - Click checkmark ✓

3. **Add DKIM Record:**
   - Click "Add New Record"
   - Type: `TXT Record`
   - Host: `resend._domainkey` (just this, without `.serenitypond.app`)
   - Value: [long string from Resend] (copy entire value)
   - TTL: `Automatic`
   - Click checkmark ✓

4. **Add DMARC Record (if Resend shows it):**
   - Click "Add New Record"
   - Type: `TXT Record`
   - Host: `_dmarc`
   - Value: `v=DMARC1; p=none; rua=mailto:dmarc@serenitypond.app` (copy from Resend)
   - TTL: `Automatic`
   - Click checkmark ✓

### Step 3: Wait for DNS Propagation

1. **Wait 5-10 minutes** after adding records
2. DNS needs time to propagate

### Step 4: Click "Verify DNS Records" in Resend

**Important:** You need to manually click the button!

1. Go back to [Resend Domains](https://resend.com/domains)
2. Click on your domain (`serenitypond.app`)
3. Look for a button that says:
   - **"Verify DNS Records"** or
   - **"Verify"** or
   - **"Start Verification"**
4. **Click the button**
5. Resend will check if DNS records are found

### Step 5: Check Results

After clicking "Verify DNS Records":

- **✅ "Verified"** = Success! Domain is ready to use
- **❌ "Failed"** = Some records are missing/incorrect
  - Resend will show which records are missing
  - Go back to Step 2 and fix them
- **⏳ "Pending"** = Records found but still propagating
  - Wait a bit longer and click "Verify" again

---

## What Your Namecheap DNS Should Look Like

After adding all records, you should have:

```
Type      Host              Value
----      ----              -----
A         @                 76.76.21.21          (Vercel - website)
CNAME     www               cname.vercel-dns.com (Vercel - website)
TXT       @                 v=spf1 include:resend.com ~all  (Resend - SPF)
TXT       resend._domainkey [long string]        (Resend - DKIM)
TXT       _dmarc            v=DMARC1; p=none...  (Resend - DMARC)
```

---

## Common Mistakes

### ❌ Wrong Host for DKIM
- **Wrong:** `resend._domainkey.serenitypond.app`
- **Correct:** `resend._domainkey` (just this)

### ❌ Missing @ for SPF
- **Wrong:** Host field blank or domain name
- **Correct:** Host = `@`

### ❌ Not clicking "Verify DNS Records"
- Resend won't auto-check - you must click the button!

### ❌ Clicking too soon
- Wait 5-10 minutes after adding DNS records
- DNS needs time to propagate

---

## Quick Checklist

- [ ] Got DNS records from Resend (SPF, DKIM, DMARC)
- [ ] Added SPF record in Namecheap (Host: `@`)
- [ ] Added DKIM record in Namecheap (Host: `resend._domainkey`)
- [ ] Added DMARC record in Namecheap (Host: `_dmarc`) - if shown
- [ ] Waited 5-10 minutes for DNS propagation
- [ ] Went back to Resend dashboard
- [ ] **Clicked "Verify DNS Records" button** ← Important!
- [ ] Domain shows as "Verified" ✅

---

## If Verification Fails

If Resend says records are not found:

1. **Double-check Host fields:**
   - SPF: Should be `@`
   - DKIM: Should be `resend._domainkey` (not with domain)
   - DMARC: Should be `_dmarc`

2. **Verify records are live:**
   - Use [mxtoolbox.com/TXTLookup.aspx](https://mxtoolbox.com/TXTLookup.aspx)
   - Enter `serenitypond.app`
   - Check if records appear

3. **Wait longer:**
   - DNS can take up to 48 hours (usually 5-30 minutes)
   - Try clicking "Verify" again after waiting

4. **Check nameservers:**
   - Make sure you're using Namecheap's nameservers
   - Not Vercel's nameservers

---

## Summary

**The key step:** After adding DNS records in Namecheap, you **must click "Verify DNS Records"** in Resend. It won't auto-verify!

Once verified ✅, your emails will work with your custom domain.

