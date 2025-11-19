# Performance Analysis: Loading Time Optimization

## Overview
This document analyzes performance bottlenecks in two key user flows:
1. **Sit Now Button → Timer Page**: Time until animation appears
2. **Onboarding Completion**: Time to complete user creation and redirect

## 1. Sit Now Button → Timer Page Flow

### Current Flow
1. User clicks "Sit Now" button on homepage (`/`)
2. Navigates to `/timer` page
3. Timer page loads and:
   - Reads user data from `localStorage` (synchronous, fast)
   - Sets timer state immediately (fast)
   - Fetches partnerships from database (async, slow)
   - Waits for partnerships to load before showing lotus animation

### Performance Issues

#### Issue 1: Blocking on Partnership Fetch
**Location**: `src/app/timer/page.tsx` lines 73-100

**Problem**: The lotus animation is hidden until `partnershipsLoading` is `false`, which requires:
- Database query: `getUserPartnerships(userId)`
- For each partnership: `getPartnerDetails(partnerId)` (additional query)
- Network latency + database query time

**Impact**: User sees loading spinner for 1-3 seconds before animation appears

**Current Code**:
```typescript
if (partnershipsLoading) {
  return <LoadingSpinner />;
}
// ... later ...
{partnership ? (
  <LotusAnimation ... />
) : null}
```

#### Optimization Options

**Option A: Show Animation Immediately, Load Partnerships in Background** (Recommended)
- Show lotus animation immediately using cached/default data
- Load partnerships asynchronously in background
- Update animation when partnerships load
- **Benefit**: Instant visual feedback, perceived performance improvement
- **Trade-off**: Animation might not show partnership-specific data initially

**Option B: Prefetch Partnerships on Homepage**
- When user is on homepage, prefetch partnerships in background
- Store in `sessionStorage` or React context
- Timer page reads from cache first, falls back to API if needed
- **Benefit**: Partnerships already loaded when user navigates
- **Trade-off**: Extra API call on homepage (but user might not go to timer)

**Option C: Optimize Database Queries**
- Combine `getUserPartnerships` and `getPartnerDetails` into single query with JOIN
- Use database indexes on `userid` and `partnerid` columns
- **Benefit**: Faster query execution
- **Trade-off**: Requires database schema changes

### Recommended Solution: Hybrid Approach
1. **Immediate**: Show animation with default/placeholder data (Option A)
2. **Background**: Load partnerships asynchronously (current approach)
3. **Optimization**: Combine queries into single JOIN query (Option C)

**Implementation**:
```typescript
// Show animation immediately, don't wait for partnerships
const [partnerships, setPartnerships] = useState<Partnership[]>([]);
const [partnershipsLoading, setPartnershipsLoading] = useState(false); // Start as false

// Load partnerships in background
useEffect(() => {
  if (userId) {
    setPartnershipsLoading(true);
    getUserPartnerships(userId).then(...).finally(() => {
      setPartnershipsLoading(false);
    });
  }
}, [userId]);

// Always show animation, use first partnership if available
const partnership = partnerships[0];
```

---

## 2. Onboarding Completion Flow

### Current Flow
1. User clicks "Complete Setup" button
2. `handleSubmit` function:
   - Creates user in Supabase (`createUser()`)
   - If User2: Creates partnership (`createPartnershipsForUser()`)
   - Creates Week 1 for partnership
   - Updates both users' pairing status
   - Redirects to homepage

### Performance Issues

#### Issue 1: Sequential API Calls
**Location**: `src/app/meditation-length/page.tsx` lines 127-161

**Problem**: All operations happen sequentially:
1. `createUser()` - ~500-1000ms
2. `createPartnershipsForUser()` - ~500-1000ms (includes multiple operations)
3. Redirect - ~100ms

**Total**: 1-2 seconds of perceived delay

**Current Code**:
```typescript
supabaseUserId = await createUser(userData);
// ... wait ...
if (pendingInviteCodeLocal) {
  const partnerships = await createPartnershipsForUser(...);
  // ... wait ...
}
router.push('/');
```

#### Issue 2: Multiple Database Operations in `createPartnershipsForUser`
**Location**: `src/lib/supabase-database.ts` lines 538-600

**Problem**: `createPartnershipsForUser` performs:
1. Check existing partnerships
2. Find other user by invite code
3. Create partnership
4. Update both users' pairing status (2 separate UPDATE queries)
5. Create Week 1
6. All sequential

**Total**: 5-7 database operations, each with network round-trip

### Optimization Options

**Option A: Parallel Operations Where Possible**
- User creation and partnership lookup can happen in parallel (if User2)
- Status updates can be batched
- **Benefit**: Reduces total time from sum to max of parallel operations
- **Trade-off**: More complex error handling

**Option B: Optimistic UI Update**
- Show loading state immediately (already implemented)
- Redirect to homepage immediately after user creation
- Create partnership in background (homepage can handle fallback)
- **Benefit**: Perceived instant redirect
- **Trade-off**: Partnership might not exist immediately on homepage

**Option C: Batch Database Operations**
- Use Supabase transactions or batch operations
- Combine multiple UPDATE queries into single batch
- **Benefit**: Fewer network round-trips
- **Trade-off**: Requires Supabase batch API or stored procedure

**Option D: Optimize `createPartnershipsForUser`**
- Combine user status updates into single query
- Use database function (RPC) to create partnership + week + update status in one call
- **Benefit**: Single database round-trip instead of multiple
- **Trade-off**: Requires database function creation

### Recommended Solution: Hybrid Approach
1. **Immediate**: Show loading spinner (already done)
2. **Optimize**: Create database function for partnership creation (Option D)
3. **Parallel**: User creation and partnership lookup (if User2) (Option A)
4. **Optimistic**: Redirect after user creation, create partnership in background (Option B)

**Implementation Priority**:
1. **High**: Optimistic redirect (easiest, biggest impact)
2. **Medium**: Database function for partnership creation (requires SQL)
3. **Low**: Parallel operations (complex, smaller impact)

---

## Summary of Recommendations

### Quick Wins (Easy, High Impact)
1. ✅ **Show loading spinner immediately** - Already implemented
2. **Show timer animation immediately** - Don't wait for partnerships
3. **Optimistic redirect** - Redirect after user creation, create partnership in background

### Medium Effort (Moderate Impact)
1. **Combine database queries** - Use JOINs or batch operations
2. **Create database function** - Single RPC call for partnership creation

### Long-term (Lower Priority)
1. **Prefetch partnerships** - Cache on homepage
2. **Database indexes** - Ensure optimal query performance

---

## Implementation Notes

### For Timer Page
- Change `partnershipsLoading` initial state to `false`
- Always show animation, use `partnerships[0]` if available
- Load partnerships in background without blocking UI

### For Onboarding
- Redirect immediately after `createUser()` succeeds
- Move partnership creation to homepage (already has fallback logic)
- Add database function for faster partnership creation

