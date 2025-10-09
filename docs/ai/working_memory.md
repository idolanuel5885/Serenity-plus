# Working Memory: Serenity+ Partnership Flow

## Stack & Environment
- **Runtime**: Node.js (Next.js 14)
- **Framework**: Next.js with TypeScript, React
- **Package Manager**: npm
- **Database**: Supabase (PostgreSQL)
- **Testing**: Playwright for E2E, API testing
- **Deployment**: Vercel (production: serenity-plus-kohl.vercel.app)

## Supabase Credentials
- **URL**: https://jvogrzlxqmvovszfxhmk.supabase.co
- **ANON_KEY**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2b2dyemx4cW12b3ZzemZ4aG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Nzc2NjIsImV4cCI6MjA3NTA1MzY2Mn0.vxT_Im-yiXRF1Yqbs-CXnrz2Q9gSkULODKNy6HGVKvw

## Database & ORM
- **Database**: Supabase PostgreSQL
- **ORM**: Direct Supabase client (no Prisma in production)
- **Connection**: `src/lib/supabase.ts` with environment variables
- **Tables**: `users`, `partnerships`, `weeks`, `invitations` (unused)
- **Key Fields**: `users.invitecode`, `partnerships.userid/partnerid`, `weeks.partnershipid`

## Run/Dev/Test Commands
```bash
# Development
npm run dev                    # Start local dev server

# Testing
npm run test:e2e              # Local E2E tests
npm run test:api              # API-only tests
npx playwright test --config=playwright.api.config.ts tests/api/partnership-flow.spec.ts

# Production Testing
npm run test:production       # Test against production DB
```

## Current Truths

### ✅ Working
- User creation (`POST /api/user`) - creates users with invite codes
- User retrieval (`GET /api/user`) - fetches user data
- Database connectivity - Supabase connection working
- Invite code system - users share invite codes via `users.invitecode` field
- Lotus progress API (`/api/lotus-progress`) - uses weeks data for meditation progress

### ⚠️ Flaky
- Partnership API endpoints (`/api/partnership`) - return 500 errors (not used by app)
- Browser-based E2E tests - crash with SIGSEGV in containerized environment

### ❌ Broken
- Invite API endpoints (`/api/invite`) - commented out, not used by app
- Direct API testing of partnership creation - endpoints don't match app logic

## Integration Map
- **Partnership Creation**: `createPartnershipsForUser()` function (direct DB calls)
- **Week Creation**: `createNewWeek()` function (automatic with partnerships)
- **Progress Tracking**: Lotus progress API uses weeks data
- **User Flow**: Homepage → `fetchPartnerships()` → `createPartnershipsForUser()`
- **Database**: Supabase with direct client calls (no ORM layer)

## Architecture Truth
The app uses **direct database functions**, not API endpoints for core functionality:
- Partnership creation: `createPartnershipsForUser(userId, inviteCode)`
- Week creation: `createNewWeek(partnershipId, weeklyGoal)`
- Progress tracking: Lotus progress API reads from weeks table

## E2E Test: Partnership Flow
**File**: `tests/api/partnership-flow.spec.ts`
**Purpose**: Test complete partnership creation flow using app's actual mechanism
**Flow**:
1. Create two users with matching invite codes via API
2. Call `createPartnershipsForUser()` directly (like the app does)
3. Verify partnership creation and automatic week creation
4. Test lotus progress API to confirm weeks are working

**Key**: Uses direct function calls instead of broken API endpoints

## CI/CD Integration
**Added to `.github/workflows/ci.yml`:**
- New job: `partnership-flow-tests`
- Runs after build completion
- Uses Supabase secrets from GitHub
- Tests complete partnership flow
- Included in quality gate checks

**Required GitHub Secrets:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Open Tasks Next
1. ✅ Create test that imports and calls `createPartnershipsForUser()` directly
2. ✅ Verify partnership creation works with matching invite codes
3. ✅ Test that weeks are created automatically with partnerships
4. ✅ Set up CI/CD pipeline for production testing
5. Add Supabase secrets to GitHub repository settings

