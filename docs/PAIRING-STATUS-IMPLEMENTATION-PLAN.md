# Pairing Status Implementation Plan

## Overview
Implement a `pairing_status` column in the `users` table to track three states:
- `not_started`: User1 before clicking "Invite Partners"
- `awaiting_partner`: User1 after clicking "Invite Partners" until paired
- `paired`: Both users after partnership is created

## Database Schema Changes

### 1. SQL Scripts Required

#### Production/Staging Migration Script
**File**: `add-pairing-status-column.sql`
- Add `pairing_status` column to `users` table (TEXT, NOT NULL, DEFAULT 'not_started')
- Add CHECK constraint: `pairing_status IN ('not_started', 'awaiting_partner', 'paired')`
- Set default value for existing users:
  - Users with partnerships → `'paired'`
  - Users without partnerships → `'not_started'`
- Create index for performance: `idx_users_pairing_status`

#### Prisma Schema Update
**File**: `prisma/schema.prisma`
- Add `pairingStatus` field to `User` model with `@map("pairing_status")`
- Add default value: `@default("not_started")`
- Add enum or validation comment

### 2. Database Naming Convention
- **Column name**: `pairing_status` (snake_case, matches existing convention: `invitecode`, `createdat`, `weeklytarget`)
- **TypeScript interface**: `pairingStatus` (camelCase)
- **Prisma model**: `pairingStatus` with `@map("pairing_status")`

---

## Code Changes Required

### 3. Type Definitions & Interfaces

#### Update User Interface
**File**: `src/lib/supabase-database.ts`
- Add `pairingStatus: 'not_started' | 'awaiting_partner' | 'paired'` to `User` interface
- Update all functions that return/use `User` type

#### Type Safety
- Create type alias: `type PairingStatus = 'not_started' | 'awaiting_partner' | 'paired'`
- Use throughout codebase for type safety

---

### 4. User Creation Flow

#### User1 (Inviter) - No Invite Code
**Files to update**:
- `src/app/meditation-length/page.tsx`
  - When creating user, set `pairingStatus: 'not_started'` in userData
- `src/lib/supabase-database.ts` - `createUser()` function
  - Accept `pairingStatus` in userData (optional, defaults to 'not_started')
- `src/app/api/user/route.ts` - POST endpoint
  - Pass through `pairingStatus` field to database insert

#### User2 (Invitee) - Has Invite Code
**Files to update**:
- `src/app/meditation-length/page.tsx`
  - When creating user with `pendingInviteCode`, set `pairingStatus: 'not_started'` initially
  - Note: Will be updated to `'paired'` when partnership is created
- Same files as User1 above

**Logic**: Both User1 and User2 start as `'not_started'` during onboarding

---

### 5. Invite Sharing Flow

#### When User1 Clicks "Invite Partners"
**Files to update**:
- `src/lib/invite-sharing.ts` - `shareInvite()` function
  - After successful share (Web Share API resolves), update user's `pairingStatus` to `'awaiting_partner'`
  - Add new function: `updateUserPairingStatus(userId, status)`
- `src/lib/supabase-database.ts`
  - Add `updateUserPairingStatus(userId: string, status: PairingStatus)` function
  - Updates `users` table: `UPDATE users SET pairing_status = $1 WHERE id = $2`

**Logic**: 
- Only update if current status is `'not_started'` (idempotent)
- Update happens after Web Share API succeeds (not for fallback modal clicks)

---

### 6. Partnership Creation Flow

#### When User2 Accepts Invite & Partnership is Created
**Files to update**:
- `src/lib/supabase-database.ts` - `createPartnershipsForUser()` function
  - After successfully creating partnership:
    1. Update User2's `pairingStatus` to `'paired'`
    2. Find User1 (the inviter) and update their `pairingStatus` to `'paired'`
  - Use transaction or ensure both updates happen atomically

**Logic**:
- When partnership is created, both users become `'paired'`
- This happens in `createPartnershipsForUser()` which is called:
  - From homepage `fetchPartnerships()` when no partnerships exist
  - From `/api/create-partnerships` endpoint

---

### 7. Homepage UI Logic

#### Update Homepage Rendering
**File**: `src/app/page.tsx`

**Current Logic**:
- Shows "Invite Partners" button if `partnerships.length === 0`
- Shows partner summary if `partnerships.length > 0`

**New Logic**:
- Fetch user's `pairingStatus` along with partnerships
- Render based on status:
  - `'not_started'`: Show "Invite Partners" button
  - `'awaiting_partner'`: Show "awaiting partner" UI (to be designed next)
  - `'paired'`: Show partner summary (current behavior)

**Changes needed**:
- Update `fetchPartnerships()` to also fetch user's `pairingStatus`
- Add state: `const [pairingStatus, setPairingStatus] = useState<PairingStatus | null>(null)`
- Update conditional rendering logic
- Update `getUser()` call to include `pairingStatus` field

---

### 8. API Endpoints

#### GET `/api/user`
**File**: `src/app/api/user/route.ts`
- Already returns user data, ensure `pairingStatus` is included in SELECT query
- No changes needed if using `SELECT *`, but should explicitly include it

#### POST `/api/user`
**File**: `src/app/api/user/route.ts`
- Already accepts userData, ensure `pairingStatus` is passed through
- Add validation: if `pairingStatus` provided, must be valid enum value

#### New Endpoint (Optional)
**File**: `src/app/api/user/[id]/pairing-status/route.ts`
- PATCH endpoint to update pairing status
- Could be used by invite sharing flow
- Or just use direct Supabase update in `updateUserPairingStatus()`

---

### 9. Functions That Query Users Table

#### Functions to Review/Update
**File**: `src/lib/supabase-database.ts`
- `getUser(userId)` - Ensure it returns `pairingStatus`
- `createUser(userData)` - Accept and store `pairingStatus`
- `getPartnerDetails(partnerId)` - May need `pairingStatus` for future features
- Any other functions that SELECT from `users` table

---

### 10. Testing & CI/CD

#### Unit Tests
**Files to update**:
- `tests/unit/onboarding.test.ts` - Test user creation with `pairingStatus`
- `tests/unit/session-api.test.ts` - May need updates if it mocks user data
- Create new: `tests/unit/pairing-status.test.ts`
  - Test status transitions
  - Test invite sharing updates status
  - Test partnership creation updates both users

#### Integration Tests
**Files to update**:
- `tests/integration/session-week-flow.test.ts` - May need user status updates
- Create new: `tests/integration/pairing-status-flow.test.ts`
  - Test complete flow: User1 creates → invites → User2 accepts → both paired

#### E2E Tests
**Files to update**:
- `tests/e2e/onboarding-workflow.spec.ts` - Verify status is set correctly
- `tests/e2e/invite-flow.spec.ts` - Test status transitions during invite flow
- Create new: `tests/e2e/pairing-status.spec.ts`
  - Test UI changes based on status

#### API Tests
**Files to update**:
- `tests/api/partnership-flow.spec.ts` - Verify status updates when partnership created
- Create new: `tests/api/pairing-status.spec.ts`
  - Test status updates via API

---

### 11. Documentation Updates

#### Working Memory
**File**: `docs/ai/working_memory.md`
- Add `pairing_status` to USERS Table schema
- Document the three states and their meanings
- Document when status transitions occur
- Update user flow diagrams

#### Code Comments
- Add JSDoc comments to `updateUserPairingStatus()` function
- Add comments explaining status transitions in `createPartnershipsForUser()`
- Add comments in homepage UI logic explaining status-based rendering

---

### 12. Edge Cases & Error Handling

#### Edge Cases to Handle
1. **Existing Users**: Migration script sets default based on partnerships
2. **Status Already Set**: Idempotent updates (don't overwrite if already correct)
3. **Failed Partnership Creation**: Don't update status if partnership creation fails
4. **Multiple Partnerships**: User can have multiple partnerships, status should be `'paired'` if any exist
5. **User Deletes Partnership**: What happens? (Future consideration - not in scope)

#### Error Handling
- Wrap status updates in try-catch
- Log errors but don't block user flow
- Fallback: If status update fails, continue with existing status

---

### 13. Migration Strategy

#### For Existing Users
**SQL Script Logic**:
```sql
-- Set users with partnerships to 'paired'
UPDATE users 
SET pairing_status = 'paired' 
WHERE id IN (
  SELECT DISTINCT userid FROM partnerships
  UNION
  SELECT DISTINCT partnerid FROM partnerships
);

-- Set all other users to 'not_started'
UPDATE users 
SET pairing_status = 'not_started' 
WHERE pairing_status IS NULL;
```

#### Rollback Plan
- Keep backup of users table before migration
- Can rollback by dropping column if needed
- Document rollback SQL script

---

## Implementation Order

### Phase 1: Database & Types
1. Create SQL migration script
2. Update Prisma schema
3. Update TypeScript interfaces
4. Run migration on staging first

### Phase 2: Core Functions
5. Update `createUser()` to accept `pairingStatus`
6. Create `updateUserPairingStatus()` function
7. Update `getUser()` to return `pairingStatus`

### Phase 3: User Creation
8. Update `meditation-length/page.tsx` to set initial status
9. Update `/api/user` POST endpoint
10. Test user creation with new status

### Phase 4: Invite Sharing
11. Update `invite-sharing.ts` to update status after share
12. Test status update when User1 shares invite

### Phase 5: Partnership Creation
13. Update `createPartnershipsForUser()` to set both users to `'paired'`
14. Test partnership creation updates both users

### Phase 6: Homepage UI
15. Update homepage to fetch and use `pairingStatus`
16. Update conditional rendering logic
17. Test UI changes for each status

### Phase 7: Testing & Documentation
18. Update all tests
19. Update documentation
20. Run full test suite

### Phase 8: Deployment
21. Run migration on production
22. Deploy code changes
23. Monitor for issues

---

## Files Summary

### New Files
- `add-pairing-status-column.sql` - Database migration script
- `tests/unit/pairing-status.test.ts` - Unit tests
- `tests/integration/pairing-status-flow.test.ts` - Integration tests
- `tests/e2e/pairing-status.spec.ts` - E2E tests
- `tests/api/pairing-status.spec.ts` - API tests

### Modified Files
- `prisma/schema.prisma` - Add pairingStatus field
- `src/lib/supabase-database.ts` - Add/update functions, update User interface
- `src/app/api/user/route.ts` - Handle pairingStatus in POST/GET
- `src/app/meditation-length/page.tsx` - Set initial status on user creation
- `src/lib/invite-sharing.ts` - Update status after share
- `src/app/page.tsx` - Fetch and use pairingStatus for UI logic
- `docs/ai/working_memory.md` - Update schema documentation
- All test files that create/mock users

---

## Risk Assessment

### Low Risk
- Adding column with default value (non-breaking)
- TypeScript type updates (compile-time safety)
- UI logic changes (isolated to homepage)

### Medium Risk
- Status updates during invite sharing (could fail silently)
- Status updates during partnership creation (must be atomic)
- Migration of existing users (data integrity)

### Mitigation
- Test thoroughly on staging first
- Add error logging for status updates
- Use database transactions where possible
- Have rollback plan ready

---

## Questions to Clarify

1. **Multiple Partnerships**: If user has multiple partnerships, status is `'paired'` - correct?
2. **Status Reversion**: If partnership is deleted (future feature), should status revert to `'not_started'`?
3. **User2 Status**: User2 starts as `'not_started'` even though they have an invite code - correct?
4. **Status Persistence**: Should status persist across sessions? (Yes, it's in database)
5. **Error Recovery**: If status update fails, should we retry or continue with current status?

---

## Next Steps After Implementation

1. Design UI for `'awaiting_partner'` state (next task)
2. Add analytics/tracking for status transitions
3. Consider adding status history/audit log (future)
4. Add admin view to see all users' pairing statuses (future)

