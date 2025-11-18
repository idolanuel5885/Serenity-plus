# Working Memory: Serenity+ Partnership Flow

## Stack & Environment
- **Runtime**: Node.js 20
- **Framework**: Next.js 15.5.3 with TypeScript, React 19.1.0
- **Package Manager**: npm
- **Build Tool**: Turbopack (`--turbopack` flag used in dev and build)
- **Database**: Supabase (PostgreSQL)
- **Testing**: Playwright 1.55.0 for E2E and API testing, Jest for unit tests
- **Deployment**: Vercel
  - **Production**: `serenity-plus-kohl.vercel.app` (Supabase project: `serenity-plus`)
  - **Staging**: `serenity-plus-staging.vercel.app`

## Environment Variables

### Production Environment
- **Supabase URL**: `https://jvogrzlxqmvovszfxhmk.supabase.co`
- **Supabase Project**: `serenity-plus`
- **ANON_KEY**: Stored in Vercel environment variables

### Staging Environment
- **Supabase URL**: Stored in GitHub Secret `STAGING_SUPABASE_URL`
- **Supabase ANON_KEY**: Stored in GitHub Secret `STAGING_SUPABASE_ANON_KEY`
- **E2E Base URL**: Stored in GitHub Secret `E2E_BASE_URL` (staging Vercel deployment URL)
- **Setup**: Separate Supabase project with different schema (see Database Schema section)

### Required GitHub Secrets for CI/CD
- `STAGING_SUPABASE_URL` - Staging Supabase project URL
- `STAGING_SUPABASE_ANON_KEY` - Staging Supabase anonymous key
- `E2E_BASE_URL` - Staging Vercel deployment URL for E2E tests
- `SNYK_TOKEN` - Optional, for security scanning

## Database & ORM
- **Database**: Supabase PostgreSQL
- **ORM**: Direct Supabase client (no Prisma in production, Prisma schema exists but is SQLite-based for local dev only)
- **Connection**: `src/lib/supabase.ts` with environment variables
- **Database Functions**: `src/lib/supabase-database.ts` - all database operations

## Database Schema: Production vs Staging

### Production Schema (serenity-plus - Source of Truth)
**USERS Table:**
- Columns: `id`, `name`, `email`, `weeklytarget`, `usualsitlength`, `image`, `invitecode`, `pairing_status`, `createdat`
- `invitecode`: TEXT (NOT UNIQUE - duplicates exist in production)
- `pairing_status`: TEXT (NOT NULL, DEFAULT 'not_started') - Values: 'not_started', 'awaiting_partner', 'paired'
- Missing: `updatedat`, `primarywindow`, `timezone`, `whypractice`, `supportneeds`

**PARTNERSHIPS Table:**
- Columns: `id`, `userid`, `partnerid`, `partnername`, `partneremail`, `partnerimage`, `partnerweeklytarget`, `usersits`, `partnersits`, `weeklygoal`, `score`, `currentweekstart`, `createdat`
- Has partner fields: `partnername`, `partneremail`, `partnerimage`, `partnerweeklytarget`
- Missing: `updatedat`, `isactive`, `currentweeknumber`, `currentstreak`, `longeststreak`, `totalweeks`
- Constraint: UNIQUE(userid, partnerid)

**WEEKS Table:**
- Columns: `id`, `partnershipid`, `weeknumber`, `weekstart`, `weekend`, `inviteesits`, `invitersits`, `weeklygoal`, `goalmet`, `createdat`
- `inviteesits`: The user who used the invite code (was user1sits)
- `invitersits`: The user who created account and shared invite code (was user2sits)

**SESSIONS Table:**
- Columns: `id`, `createdat`, `sitlength`, `iscompleted`, `completedat`, `startedat`, `userid`, `partnershipid`, `weekid`
- `weekid`: Links session to the week it belongs to
- `completedat`: Nullable - set when session completes

**Tables NOT in Production:**
- `invitations` - Does NOT exist
- `notifications` - Does NOT exist

### Staging Schema (setup-staging-database.sql)
**USERS Table:**
- Has extra fields: `updatedat`, `primarywindow`, `timezone`, `whypractice`, `supportneeds`
- `invitecode`: TEXT (no UNIQUE constraint initially, but UNIQUE constraint was added causing test failures)
- **Important**: Staging has UNIQUE constraint on `invitecode` that production doesn't have

**PARTNERSHIPS Table:**
- Missing partner fields: `partnername`, `partneremail`, `partnerimage`, `partnerweeklytarget`
- Has extra fields: `updatedat`, `isactive`, `currentweeknumber`, `currentstreak`, `longeststreak`, `totalweeks`

**Additional Tables in Staging:**
- `invitations` - Exists in staging
- `notifications` - Exists in staging

### Key Schema Differences
1. **Partnerships table**: Production has `partnername`, `partneremail`, `partnerimage`, `partnerweeklytarget` fields that staging lacks
2. **Users table**: Staging has extra fields (`updatedat`, `primarywindow`, `timezone`, `whypractice`, `supportneeds`) that production doesn't have
3. **invitecode constraint**: Production does NOT have UNIQUE constraint (duplicates found), but staging DOES have UNIQUE constraint
4. **Additional tables**: Staging has `invitations` and `notifications` tables that production doesn't have

### Staging Database Setup
- **Setup Script**: `setup-staging-database.sql` - Creates all tables with staging schema
- **RLS Fix Script**: `fix-staging-rls-complete.sql` - Fixes Row Level Security policies for anonymous access
- **RLS Fix Shell Script**: `scripts/fix-staging-rls.sh` - Helper script to apply RLS fixes
- **Setup Shell Script**: `scripts/setup-staging-db.sh` - Helper script for staging setup

### Staging RLS Policies
- **Issue**: Staging RLS policies initially only had `USING (true)` which works for SELECT/UPDATE/DELETE but not INSERT
- **Fix**: Added `WITH CHECK (true)` to all anonymous access policies for: `users`, `partnerships`, `weeks`, `sessions`, `invitations`, `notifications`
- **File**: `fix-staging-rls-complete.sql` - Contains complete RLS policy fixes
- **Application**: Run via Supabase SQL Editor or `scripts/fix-staging-rls.sh`

## Architecture Overview

### Application Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── user/          # User CRUD operations
│   │   ├── create-partnerships/  # Partnership creation endpoint
│   │   ├── session-complete/     # Session completion tracking
│   │   ├── lotus-progress/       # Meditation progress API
│   │   └── test-supabase/        # Database connectivity test
│   ├── welcome/           # Welcome/onboarding start page
│   ├── nickname/          # Step 1: User nickname
│   ├── meditations-per-week/  # Step 2: Weekly target
│   ├── meditation-length/    # Step 3: Session length + user creation
│   ├── timer/             # Main meditation timer page
│   ├── invite/             # Invite link generation page
│   ├── join/[code]/        # Accept invite page
│   └── page.tsx            # Homepage (partnerships display)
├── components/             # React components
│   └── LotusAnimation.tsx  # Meditation progress animation
├── hooks/                  # React hooks
│   ├── useLotusProgress.ts
│   ├── useNotifications.ts
│   └── usePartnershipSync.ts
└── lib/                    # Core business logic
    ├── supabase.ts         # Supabase client initialization
    ├── supabase-database.ts # All database operations
    # weekUtils.ts removed - was dead code using old Prisma schema
    └── lotusProgress.ts     # Progress calculation
```

### User Onboarding Flow
1. **Welcome Page** (`/welcome`)
   - Checks for `pendingInviteCode` in localStorage (if User2 was invited)
   - Shows different content for invited vs non-invited users

2. **Nickname** (`/nickname`)
   - User enters nickname (2-20 chars, letters/numbers/spaces)
   - Stored in `localStorage.userNickname`

3. **Meditations Per Week** (`/meditations-per-week`)
   - User selects weekly target (default: 5)
   - Stored in `localStorage.userWeeklyTarget`

4. **Meditation Length** (`/meditation-length`)
   - User selects session length (default: 30 minutes)
   - **Critical Step**: User creation happens here
   - **Invite Code Logic**:
     - User1: Generates new unique invite code during onboarding
     - User2: Generates new unique invite code during onboarding (NOT User1's invite code)
     - User1's invite code is stored as `pendingInviteCode` in User2's localStorage
     - `pendingInviteCode` is preserved and used later for partnership creation
   - **Pairing Status Logic**:
     - User1 (no pendingInviteCode): Created with `pairing_status = 'not_started'`
     - User2 (has pendingInviteCode): Created with `pairing_status = 'paired'` (will be paired immediately)
   - Creates user in Supabase via `createUser()` function
   - If User2 has `pendingInviteCode`, creates partnership immediately during onboarding
   - Stores `supabaseUserId` and `userInviteCode` in localStorage
   - Redirects to homepage

### Partnership Creation Flow
1. **User1 creates account** → Gets unique `invitecode` (e.g., `invite-123-abc`), `pairing_status = 'not_started'`
2. **User1 clicks "Invite Partners"** → `pairing_status` updated to `'awaiting_partner'` immediately (before share)
3. **User1 shares invite** → Generates QR code/link with their `invitecode` (native share or fallback modal)
4. **User2 receives invite** → `pendingInviteCode` stored in localStorage (User1's invite code)
5. **User2 creates account** → Gets their own unique `invitecode` (e.g., `invite-456-def`), `pairing_status = 'paired'`
6. **User2 completes onboarding** → **Partnership created immediately** during onboarding:
   - In `meditation-length/page.tsx`, after user creation succeeds
   - If `pendingInviteCode` exists, calls `createPartnershipsForUser(userId, pendingInviteCode)`
   - `createPartnershipsForUser()` finds User1 by matching `invitecode = pendingInviteCode`
   - Creates partnership between User2 and User1
   - **Updates both users' `pairing_status` to `'paired'`** (User1 and User2)
   - Automatically creates Week 1 for the partnership
   - Clears `pendingInviteCode` from localStorage
7. **User2 redirected to homepage** → Partnership already exists, homepage displays it immediately
8. **Homepage fallback** → If partnership creation failed during onboarding, homepage attempts to create it as fallback

### Pairing Status States
- **`not_started`**: User1 before clicking "Invite Partners" button
- **`awaiting_partner`**: User1 after clicking "Invite Partners" button, until partnership is created
- **`paired`**: Both users after partnership is created (User2 is always created with this status)

### Key Functions

**`createPartnershipsForUser(userId, inviteCode)`** (`src/lib/supabase-database.ts:362`)
- Finds other users with matching `invitecode`
- Creates partnerships between `userId` and found users
- Automatically creates Week 1 for each new partnership
- Returns array of created partnerships

**`getUserPartnerships(userId)`** (`src/lib/supabase-database.ts:139`)
- Queries partnerships where user is `userid` OR `partnerid`
- Joins with users table to get partner details
- Returns formatted partnership data

**`createUser(userData)`** (`src/lib/supabase-database.ts:39`)
- Inserts user into `users` table
- Returns user ID

## CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

**Trigger**: Push/PR to `main` or `master` branch

**Jobs (in order)**:
1. **pre-checks**: Lint and type check
2. **unit-tests**: Jest unit tests
3. **integration-tests**: Jest integration tests
4. **build**: Build Next.js app with staging env vars
5. **e2e-tests**: Playwright E2E tests against staging deployment
6. **partnership-flow-tests**: API tests for partnership creation
7. **onboarding-workflow-tests**: E2E tests for onboarding flow
8. **security-scan**: npm audit + Snyk scan
9. **quality-gate**: Checks all jobs passed
10. **deploy**: Deploys to staging (placeholder, not implemented)

### Test Configuration

**Playwright Config** (`playwright.config.ts`):
- Uses `E2E_BASE_URL` environment variable (falls back to production URL)
- Two projects: `api` (API tests) and `e2e` (E2E tests)
- Debug logging in CI to show which URL is being used

**Test Files**:
- `tests/api/partnership-flow.spec.ts` - Partnership creation flow tests
- `tests/e2e/onboarding-workflow.spec.ts` - Complete onboarding flow
- `tests/e2e/ui-improvements.spec.ts` - UI/UX tests
- `tests/e2e/partnership-system.spec.ts` - Partnership display tests
- `tests/e2e/invite-flow.spec.ts` - Invite generation/acceptance
- `tests/e2e/notification-redirect.spec.ts` - Notification handling

### CI/CD Environment Variables
All test jobs use:
- `NEXT_PUBLIC_SUPABASE_URL`: `${{ secrets.STAGING_SUPABASE_URL }}`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `${{ secrets.STAGING_SUPABASE_ANON_KEY }}`
- `E2E_BASE_URL`: `${{ secrets.E2E_BASE_URL }}`

### Build Configuration
- Uses Turbopack: `npm run build --turbopack`
- Builds with staging environment variables
- Uploads `.next/` as artifact

## Run/Dev/Test Commands
```bash
# Development
npm run dev                    # Start local dev server (with Turbopack)
npm run build                  # Build for production (with Turbopack)
npm run preview                # Preview production build locally

# Testing
npm run test                   # Run Jest unit tests
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests only
npm run test:e2e               # Playwright E2E tests
npm run test:e2e:ui            # Playwright with UI mode
npm run test:all               # Run all tests

# CI/CD
npm run test:ci                # Lint + coverage + E2E
```

## Current Truths

### ✅ Working
- User creation (`POST /api/user`) - creates users with unique invite codes
- User retrieval (`GET /api/user`) - fetches user data
- Database connectivity - Supabase connection working
- Invite code system - each user gets unique invite code during onboarding
- Partnership creation (`POST /api/create-partnerships`) - creates partnerships via `createPartnershipsForUser()`
- Week creation - automatically created with partnerships
- Lotus progress API (`/api/lotus-progress`) - uses weeks data for meditation progress
- Session completion (`POST /api/session-complete`) - tracks completed sessions
- Onboarding flow - complete 3-step flow working
- Staging environment - fully set up with RLS policies fixed

### ⚠️ Known Issues
- Staging schema differs from production (see Schema Differences)
- Staging has UNIQUE constraint on `invitecode` that production doesn't have
- Partnership table schema mismatch between staging and production

### ❌ Broken/Not Used
- Invite API endpoints (`/api/invite`) - commented out, not used by app
- Direct API testing of some partnership endpoints - endpoints don't match app logic

## Integration Map
- **Partnership Creation**: `createPartnershipsForUser()` function (direct DB calls via API endpoint `/api/create-partnerships`)
- **Week Creation**: `createNewWeek()` function (automatic with partnerships)
- **Progress Tracking**: Lotus progress API uses weeks data
- **User Flow**: Homepage → `fetchPartnerships()` → `createPartnershipsForUser()` if no partnerships exist
- **Database**: Supabase with direct client calls (no ORM layer)

## Architecture Truth
The app uses **direct database functions**, not all API endpoints for core functionality:
- Partnership creation: `createPartnershipsForUser(userId, inviteCode)` called via `/api/create-partnerships`
- Week creation: `createNewWeek(partnershipId, weeklyGoal)` - automatic with partnerships
- Progress tracking: Lotus progress API reads from weeks table
- User creation: `createUser(userData)` called via `/api/user`

## Key Fixes Applied

### Invite Code Generation
- **Issue**: User2 was using User1's invite code, causing UNIQUE constraint violations in staging
- **Fix**: User2 now generates their own unique invite code during onboarding
- **Location**: `src/app/meditation-length/page.tsx:100`
- **Logic**: New users always generate new invite code; existing users reuse their invite code

### Partnership Creation
- **Issue**: Test was calling partnership creation from User1's perspective
- **Fix**: Partnership creation must be called from User2's perspective with User1's invite code
- **Location**: `tests/api/partnership-flow.spec.ts`
- **Logic**: `createPartnershipsForUser(user2Id, user1InviteCode)` finds User1 and creates partnership

### RLS Policies
- **Issue**: Staging RLS policies didn't allow INSERT operations (missing `WITH CHECK (true)`)
- **Fix**: Added `WITH CHECK (true)` to all anonymous access policies
- **File**: `fix-staging-rls-complete.sql`
- **Tables Fixed**: `users`, `partnerships`, `weeks`, `sessions`, `invitations`, `notifications`

### Playwright Configuration
- **Issue**: Playwright config was hardcoded to production URL
- **Fix**: Uses `E2E_BASE_URL` environment variable with fallback
- **Location**: `playwright.config.ts`
- **Impact**: Tests now correctly run against staging deployment

### Timer Page Hydration
- **Issue**: Timer not rendering in E2E tests due to SSR/hydration mismatch
- **Fix**: Set `loading=false` immediately after reading from localStorage, before database calls
- **Location**: `src/app/timer/page.tsx`

### Homepage Redirect
- **Issue**: Onboarding redirect not detected by Playwright
- **Fix**: Clear localStorage before navigation, use `page.waitForURL()` instead of `expect().toHaveURL()`
- **Location**: `tests/e2e/onboarding-workflow.spec.ts`

## E2E Test: Partnership Flow
**File**: `tests/api/partnership-flow.spec.ts`
**Purpose**: Test complete partnership creation flow using app's actual mechanism
**Flow**:
1. Create User1 with unique invite code via API
2. Create User2 with their own unique invite code via API
3. Call `createPartnershipsForUser(user2Id, user1InviteCode)` via API endpoint
4. Verify partnership creation and automatic week creation
5. Test lotus progress API to confirm weeks are working

**Key**: Uses API endpoints that call the actual database functions, matching app behavior

## Deployment

### Production
- **Platform**: Vercel
- **URL**: `serenity-plus-kohl.vercel.app`
- **Supabase Project**: `serenity-plus` (`https://jvogrzlxqmvovszfxhmk.supabase.co`)
- **Deployment**: Automatic via Vercel (connected to GitHub)

### Staging
- **Platform**: Vercel (separate project)
- **URL**: Stored in GitHub Secret `E2E_BASE_URL`
- **Supabase Project**: Separate staging project
- **Deployment**: Manual or via CI/CD (deploy job is placeholder)

## Open Tasks Next
1. ✅ Create test that imports and calls `createPartnershipsForUser()` directly
2. ✅ Verify partnership creation works with matching invite codes
3. ✅ Test that weeks are created automatically with partnerships
4. ✅ Set up CI/CD pipeline for staging testing
5. ✅ Add Supabase secrets to GitHub repository settings
6. ✅ Fix RLS policies in staging
7. ✅ Fix invite code generation for User2
8. ✅ Fix Playwright config to use staging URL
9. ⏳ Align staging schema with production (or document differences)
10. ⏳ Implement actual deployment step in CI/CD
