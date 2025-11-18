# Pairing Status Implementation Summary

## Overview
Implemented a `pairing_status` column in the `users` table to track three states of user partnership status, controlling what UI is shown on the homepage.

## Database Changes

### SQL Migration Script
**File**: `add-pairing-status-column.sql`
- Adds `pairing_status` column (TEXT, NOT NULL, DEFAULT 'not_started')
- Adds CHECK constraint: `pairing_status IN ('not_started', 'awaiting_partner', 'paired')`
- Updates existing users:
  - Users with partnerships → `'paired'`
  - Users without partnerships → `'not_started'`
- Creates index for performance: `idx_users_pairing_status`

**To run**: Execute this script in Supabase SQL Editor for both production and staging.

## Code Changes

### 1. Type Definitions (`src/lib/supabase-database.ts`)
- Added `PairingStatus` type: `'not_started' | 'awaiting_partner' | 'paired'`
- Updated `User` interface to include `pairingstatus: PairingStatus`
- Added `updateUserPairingStatus(userId, status)` function

### 2. User Creation (`src/app/meditation-length/page.tsx`)
- **User1 (no pendingInviteCode)**: Created with `pairingstatus: 'not_started'`
- **User2 (has pendingInviteCode)**: Created with `pairingstatus: 'paired'`
- Logic: `const pairingStatus = pendingInviteCodeLocal ? 'paired' : 'not_started'`

### 3. Invite Sharing (`src/app/page.tsx` - `handleInviteClick`)
- When User1 clicks "Invite Partners" button:
  - Immediately updates `pairing_status` to `'awaiting_partner'` (before share attempt)
  - Then proceeds with share flow
- This happens on button click, not after successful share (as we can't reliably know if share succeeded)

### 4. Partnership Creation (`src/lib/supabase-database.ts` - `createPartnershipsForUser`)
- After successfully creating partnership:
  - Updates User2's `pairing_status` to `'paired'` (if not already)
  - Updates User1's `pairing_status` to `'paired'`
- Both users become `'paired'` when partnership is created

### 5. Homepage UI Logic (`src/app/page.tsx`)
- Fetches user's `pairingStatus` along with partnerships
- Renders based on status:
  - **`'not_started'`**: Shows "Invite Partners" button
  - **`'awaiting_partner'`**: Shows "Waiting for your partner to join..." message
  - **`'paired'`**: Shows partnership summary (current behavior)
  - **Fallback**: If status is null, falls back to partnership-based logic

### 6. Prisma Schema (`prisma/schema.prisma`)
- Added `pairingstatus` field to `User` model
- Added `@map("pairing_status")` directive
- Default value: `@default("not_started")`

### 7. Documentation (`docs/ai/working_memory.md`)
- Updated USERS table schema to include `pairing_status`
- Documented the three states and their meanings
- Updated Partnership Creation Flow to include status transitions
- Added new section: "Pairing Status States"

## Status Transitions

### User1 (Inviter) Flow:
1. **Account created** → `'not_started'`
2. **Clicks "Invite Partners"** → `'awaiting_partner'` (immediately on button click)
3. **Partnership created** → `'paired'` (when User2 accepts and partnership is created)

### User2 (Invitee) Flow:
1. **Account created** → `'paired'` (always, since they have invite code)
2. **Partnership created** → `'paired'` (confirmed when partnership is created)
3. No other transitions

## Files Modified

1. **`add-pairing-status-column.sql`** (NEW) - Database migration script
2. **`prisma/schema.prisma`** - Added pairingstatus field
3. **`src/lib/supabase-database.ts`** - Added type, interface, and update function
4. **`src/app/meditation-length/page.tsx`** - Set initial pairing status on user creation
5. **`src/app/page.tsx`** - Update status on invite click, fetch status, render based on status
6. **`docs/ai/working_memory.md`** - Updated schema and flow documentation

## Testing Notes

- Existing tests should continue to work (they use API endpoints directly)
- New tests may be needed for:
  - Status transitions during invite flow
  - Status updates during partnership creation
  - Homepage UI rendering based on status

## Next Steps

1. **Run SQL migration** in Supabase (production and staging)
2. **Deploy code changes** (automatic via Vercel)
3. **Test the flow**:
   - User1 creates account → should see "Invite Partners" button
   - User1 clicks button → should see "Waiting for partner..." message
   - User2 creates account → partnership created, both users become `'paired'`
   - Both users should see partnership summary

## SQL Script Location

The SQL script to update the Supabase users table is located at:
**`add-pairing-status-column.sql`**

Run this script in the Supabase SQL Editor for both production and staging environments.

