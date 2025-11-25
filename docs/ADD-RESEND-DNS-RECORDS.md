# Where to Add Resend DNS Records

## Quick Answer

**Add Resend's DNS records in the SAME place you added Vercel's records: Namecheap's DNS management.**

You can have **both sets of records** at the same time:
- **Vercel's records** (A, CNAME) → for your website
- **Resend's records** (TXT) → for email

They don't conflict - they're different types of records.

---

## Step-by-Step: Adding Resend Records to Namecheap

### Step 1: Get Records from Resend

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Find your domain (should show as "Pending Verification")
3. Click on your domain
4. Resend will show you **3 TXT records** to add:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT)

5. **Copy each record** - you'll see something like:

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

   **DMARC:**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
   ```

### Step 2: Add Records to Namecheap

1. **Go to Namecheap:**
   - Log into [Namecheap.com](https://www.namecheap.com)
   - Go to **Domain List**
   - Click **Manage** next to your domain
   - Click **Advanced DNS** tab

2. **You should already see your Vercel records here** (A, CNAME) - that's fine!

3. **Add Resend's records:**
   - Scroll to **Host Records** section
   - Click **Add New Record** button
   - Add each of the 3 TXT records from Resend

### Step 3: Add Each TXT Record

#### Record 1: SPF

1. Click **Add New Record**
2. Select:
   - **Type:** `TXT Record` (from dropdown)
   - **Host:** `@` (copy from Resend's "Name" field)
   - **Value:** `v=spf1 include:resend.com ~all` (copy from Resend's "Value" field)
   - **TTL:** `Automatic` (or 3600)
3. Click the checkmark ✓ to save

#### Record 2: DKIM

1. Click **Add New Record**
2. Select:
   - **Type:** `TXT Record`
   - **Host:** `resend._domainkey` (copy from Resend's "Name" field - might be slightly different)
   - **Value:** `[long string]` (copy the entire long string from Resend)
   - **TTL:** `Automatic`
3. Click the checkmark ✓ to save

#### Record 3: DMARC

1. Click **Add New Record**
2. Select:
   - **Type:** `TXT Record`
   - **Host:** `_dmarc` (copy from Resend's "Name" field)
   - **Value:** `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com` (copy from Resend)
   - **TTL:** `Automatic`
3. Click the checkmark ✓ to save

### Step 4: Verify in Resend

1. **Wait 5-10 minutes** for DNS propagation
2. Go back to Resend Dashboard
3. Click **Verify** next to your domain
4. Resend will check if all 3 records are found
5. If verified, domain status changes to "Verified" ✅

---

## What Your Namecheap DNS Should Look Like

After adding everything, you should have records like:

```
Type      Host              Value
----      ----              -----
A         @                 76.76.21.21          (Vercel - website)
CNAME     www               cname.vercel-dns.com (Vercel - website)
TXT       @                 v=spf1 include:resend.com ~all  (Resend - email)
TXT       resend._domainkey [long string]        (Resend - email)
TXT       _dmarc            v=DMARC1; p=none... (Resend - email)
```

**All in the same place!** They work together.

---

## Important Notes

### Different Record Types Don't Conflict

- **A/CNAME records** (Vercel) = for website routing
- **TXT records** (Resend) = for email verification
- They can coexist in the same DNS zone

### About the "@" Symbol

- **SPF record:** Usually uses `@` for root domain
- **In Namecheap:** Type `@` in the Host field
- This means "yourdomain.com" (root domain)

### About DKIM Host Name

- Resend might show: `resend._domainkey` or `resend._domainkey.yourdomain.com`
- **In Namecheap:** Use just `resend._domainkey` (without the domain part)
- Namecheap automatically appends your domain

### About DMARC

- Host is always `_dmarc`
- Value includes your email address for reports (you can change this later)

---

## Troubleshooting

### "Records not found" in Resend

- **Wait longer:** DNS propagation can take 5-30 minutes (sometimes up to 48 hours)
- **Check spelling:** Make sure you copied the exact values
- **Check Host field:** 
  - SPF: Should be `@`
  - DKIM: Should be `resend._domainkey` (without domain)
  - DMARC: Should be `_dmarc`

### "Wrong nameservers"

- Make sure you're using **Namecheap's nameservers** (not Vercel's)
- Check in Namecheap → Domain List → Manage → Nameservers
- Should show Namecheap nameservers (e.g., `dns1.registrar-servers.com`)

### "Can't add TXT record"

- Make sure you selected **"TXT Record"** from the Type dropdown
- Some registrars call it "TXT" or "Text Record"
- Not "A Record" or "CNAME"

### "Domain already has records"

- That's fine! You can have multiple TXT records
- Just add the new ones from Resend
- They won't conflict with Vercel's A/CNAME records

---

## Quick Checklist

- [ ] Got 3 TXT records from Resend (SPF, DKIM, DMARC)
- [ ] Went to Namecheap → Domain List → Manage → Advanced DNS
- [ ] Added SPF record (Type: TXT, Host: @, Value: from Resend)
- [ ] Added DKIM record (Type: TXT, Host: resend._domainkey, Value: from Resend)
- [ ] Added DMARC record (Type: TXT, Host: _dmarc, Value: from Resend)
- [ ] Saved all 3 records
- [ ] Waited 5-10 minutes
- [ ] Clicked "Verify" in Resend dashboard
- [ ] Domain shows as "Verified" ✅

---

## Summary

**Where to add Resend DNS records?**
→ **Same place as Vercel records: Namecheap → Domain List → Manage → Advanced DNS**

**Can I have both?**
→ **Yes!** Vercel records (A, CNAME) and Resend records (TXT) can coexist.

**Do they conflict?**
→ **No!** Different record types serve different purposes.

