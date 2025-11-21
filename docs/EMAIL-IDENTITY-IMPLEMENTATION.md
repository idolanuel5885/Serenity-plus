# Email-Based Identity System Implementation

## Overview

This document describes the email-based identity system with magic links that allows users to recover their account (and their shared lotus) if they switch devices or clear their browser data.

## Architecture

### Database Changes

1. **`return_token` column in `users` table**
   - Type: `TEXT`, nullable (for existing users)
   - Unique index (where not null)
   - Stores secret token for email-based account recovery
   - Long-lived (no expiry for pilot)
   - Can be rotated (new token replaces old one)

### Onboarding Flow

**Previous flow:**
Welcome → Nickname → Meditations Per Week → Meditation Length → Home

**New flow:**
Welcome → Nickname → **Email** → Meditations Per Week → Meditation Length → Home

### Email Collection Page (`/email`)

- **Title:** "Save your lotus"
- **Body:** "Enter your email so you can come back to your lotus and partner from any device. No passwords, no spam — just one link."
- **Input:** Email (required, validated)
- **Button:** "Continue" (disabled until valid email)
- **No "Skip" button** (required for pilot)

### User Creation/Linking Logic

When user completes onboarding (in `meditation-length/page.tsx`):

1. **Get email from localStorage** (collected in email step)
2. **Check if user with that email exists:**
   - If exists:
     - Use existing user ID
     - Generate new return_token (rotates old one)
     - Update return_token in database
     - Link current device to that user
   - If not exists:
     - Create new user with real email
     - Generate return_token
     - Store in database
3. **Send magic link email** (non-blocking)

### Token Generation

- **Function:** `generateReturnToken()` in `supabase-database.ts`
- **Length:** 32 characters
- **Format:** Base64url (URL-safe)
- **Security:** Uses `crypto.randomBytes` (Node.js) or `crypto.getRandomValues` (browser)
- **Rotation:** New token replaces old one (only latest token is valid)

### Email Sending

- **Service:** Resend API (same as alerting system)
- **Function:** `sendReturnLinkEmail()` in `email-service.ts`
- **Template:** Simple, friendly HTML email
- **Link format:** `https://<domain>/return?token=<TOKEN>`
- **Subject:** "Your SerenityPlus link"
- **Body:** Explains the link and how to use it

### Return Link Endpoint (`/return`)

- **Route:** `/app/return/page.tsx`
- **Query parameter:** `token`
- **Behavior:**
  1. Validate token (look up user by `return_token`)
  2. If invalid → show error page
  3. If valid:
     - Clear existing anonymous session data
     - Restore user identity in localStorage
     - Redirect to homepage

### Error Handling

- **Invalid token:** Shows error page with message "This link is not valid. Please request a new one or contact support."
- **No token:** Shows error page with message "No return token provided. Please check your email link."
- **Email send failure:** Non-blocking (user can still continue)

## Files Created/Modified

### New Files

1. **`add-return-token-column.sql`** - Database migration script
2. **`src/app/email/page.tsx`** - Email collection page
3. **`src/app/return/page.tsx`** - Return link handler
4. **`src/lib/email-service.ts`** - Email sending utility

### Modified Files

1. **`src/app/nickname/page.tsx`** - Redirect to `/email` instead of `/meditations-per-week`
2. **`src/app/meditation-length/page.tsx`** - Add email-based user lookup/linking, token generation, email sending
3. **`src/lib/supabase-database.ts`** - Add functions:
   - `getUserByEmail()` - Find user by email
   - `generateReturnToken()` - Generate secure random token
   - `updateReturnToken()` - Rotate user's return token
   - `getUserByReturnToken()` - Find user by return token
4. **`prisma/schema.prisma`** - Add `returntoken` field to User model

## Edge Cases Handled

1. **User opens return link while logged in as different user**
   - Overwrites current session with restored user

2. **User opens return link on device with anonymous session**
   - Overwrites anonymous session with restored user

3. **Token reuse**
   - Allowed (multi-use for pilot)

4. **Email already exists**
   - Links to existing user, rotates token

5. **Email send failure**
   - Non-blocking (user can still continue)

## Environment Variables

- **`RESEND_API_KEY`** - Required for sending emails (already used for alerts)
- **`NEXT_PUBLIC_APP_URL`** - Base URL for return links (optional, falls back to Vercel URL)

## Testing Checklist

- [ ] Email collection page appears after nickname step
- [ ] Email validation works (invalid emails rejected)
- [ ] New user creation with email works
- [ ] Existing user linking works (same email)
- [ ] Return token is generated and stored
- [ ] Email is sent with correct return link
- [ ] Return link validates token correctly
- [ ] Return link restores user identity
- [ ] Return link redirects to homepage
- [ ] Invalid token shows error page
- [ ] Session overwrite works (return link on device with existing session)

## Future Enhancements

1. **Token expiry** - Add expiry timestamp to tokens
2. **Resend link UI** - Add "Resend my link" button in app
3. **Email change** - Allow users to change email (with verification)
4. **Token usage logging** - Track when tokens are used (for security)

## Security Considerations

- Tokens are cryptographically secure (using crypto.randomBytes/getRandomValues)
- Tokens are long-lived (no expiry for pilot, but design allows expiry)
- Only latest token is valid (rotation invalidates old tokens)
- Tokens are secret (only sent via email, not logged)
- Email is required (no skip option for pilot)

