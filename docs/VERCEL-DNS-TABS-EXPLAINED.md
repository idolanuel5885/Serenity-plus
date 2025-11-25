# Vercel DNS Tabs Explained

## Two Tabs in Vercel

When you add a domain in Vercel, you'll see two tabs:

### 1. **DNS Records** Tab (Use This One!)
- **Purpose:** Shows you what DNS records to add **at your registrar** (Namecheap)
- **What it shows:** Records like A, CNAME that point your domain to Vercel
- **Action:** Copy these records and add them at Namecheap

### 2. **Vercel DNS** Tab (Don't Use This)
- **Purpose:** If you want to use **Vercel as your DNS provider** (instead of Namecheap)
- **What it shows:** Nameservers to use if you switch DNS to Vercel
- **Action:** Only use if you want to manage all DNS through Vercel (not recommended for beginners)

## Which One Should You Use?

**✅ Use the "DNS Records" tab** - This is the standard approach.

**Why?**
- You keep DNS management at Namecheap (where you bought the domain)
- You only add the specific records Vercel needs
- Simpler and more common approach

---

## Mapping Vercel Fields to Namecheap Fields

### Vercel's Table:
| Type | Name | Value |
|------|------|-------|
| A    | @    | 76.76.21.21 |

### Namecheap's Table:
| Type | Host | Value | TTL |
|------|------|-------|-----|
| A    | ?    | ?     | ?   |

### How They Map:

| Vercel Field | → | Namecheap Field | Notes |
|--------------|---|-----------------|-------|
| **Type** | → | **Type** | Same (A, CNAME, etc.) |
| **Name** | → | **Host** | Copy exactly |
| **Value** | → | **Value** | Copy exactly |
| *(none)* | → | **TTL** | Use default (usually 3600) or leave as is |

---

## Step-by-Step Example

### What Vercel Shows (DNS Records tab):
```
Type: A
Name: @
Value: 76.76.21.21
```

### What to Enter in Namecheap:

1. Go to Namecheap → Domain List → Manage → Advanced DNS
2. Click "Add New Record"
3. Fill in:
   - **Type:** `A` (select from dropdown)
   - **Host:** `@` (copy from Vercel's "Name" field)
   - **Value:** `76.76.21.21` (copy from Vercel's "Value" field)
   - **TTL:** `Automatic` or `3600` (leave as default)
4. Click the checkmark to save

---

## Common Vercel Records and Namecheap Equivalents

### Example 1: A Record (Root Domain)

**Vercel shows:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Namecheap entry:**
```
Type: A
Host: @
Value: 76.76.21.21
TTL: Automatic (or 3600)
```

### Example 2: CNAME Record (WWW)

**Vercel shows:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Namecheap entry:**
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: Automatic (or 3600)
```

### Example 3: A Record (Subdomain)

**Vercel shows:**
```
Type: A
Name: subdomain
Value: 76.76.21.21
```

**Namecheap entry:**
```
Type: A
Host: subdomain
Value: 76.76.21.21
TTL: Automatic (or 3600)
```

---

## Important Notes

### About the "@" Symbol

- **In Vercel:** `@` means the root domain (yourdomain.com)
- **In Namecheap:** `@` also means the root domain
- **Copy it exactly** - use `@` in the Host field

### About TTL (Time To Live)

- **Vercel doesn't show TTL** - that's okay
- **In Namecheap:** Use "Automatic" or `3600` (1 hour)
- **Default is fine** - you don't need to change it

### About Blank/Empty Fields

- If Vercel's "Name" is blank or empty:
  - In Namecheap, use `@` for root domain
  - Or leave Host field blank (some registrars allow this)

---

## Quick Checklist

- [ ] Opened Vercel → Settings → Domains → Your Domain
- [ ] Clicked **"DNS Records"** tab (not "Vercel DNS")
- [ ] Copied the Type, Name, and Value from Vercel
- [ ] Went to Namecheap → Domain List → Manage → Advanced DNS
- [ ] Clicked "Add New Record"
- [ ] Mapped fields:
  - Type → Type (same)
  - Name → Host (copy exactly)
  - Value → Value (copy exactly)
  - TTL → Automatic or 3600
- [ ] Saved the record
- [ ] Repeated for all records Vercel shows
- [ ] Waited 5-30 minutes
- [ ] Checked Vercel - domain should show as "Valid"

---

## When to Use "Vercel DNS" Tab Instead

Only use "Vercel DNS" if:
- You want Vercel to manage ALL your DNS records
- You're comfortable changing nameservers
- You don't need other DNS records (like email MX records)

**For most users:** Stick with "DNS Records" tab and add records at Namecheap.

---

## Troubleshooting

### "Domain not pointing to Vercel"
- Check you used the **"DNS Records"** tab (not "Vercel DNS")
- Verify you copied the exact values
- Check the Host field matches Vercel's Name field exactly

### "Can't find @ symbol in Namecheap"
- Type `@` directly in the Host field
- Or try leaving it blank (some registrars interpret blank as root)

### "TTL field is required"
- Use `3600` (1 hour) or select "Automatic"
- This won't affect functionality

