# Serenity Plus Traceability Matrix

## Business Rules to Test Files Mapping

### BR-001: User Onboarding Flow
**Test Files**:
- `tests/unit/onboarding.test.ts` - Unit tests for onboarding logic
- `tests/e2e/onboarding.spec.ts` - E2E tests for complete flow
- `tests/unit/invite-api.test.ts` - API tests for invite handling

**Modules**:
- `src/app/welcome/page.tsx` - Welcome screen
- `src/app/nickname/page.tsx` - Nickname input
- `src/app/meditations-per-week/page.tsx` - Frequency selection
- `src/app/meditation-length/page.tsx` - Duration selection
- `src/app/api/onboarding/route.ts` - Onboarding API

### BR-002: Invitation System
**Test Files**:
- `tests/unit/invite-api.test.ts` - Invite API tests
- `tests/e2e/invite-flow.spec.ts` - Complete invite flow
- `tests/unit/partnership-api.test.ts` - Partnership creation

**Modules**:
- `src/app/invite/page.tsx` - Invite generation
- `src/app/join/[code]/page.tsx` - Invite acceptance
- `src/app/api/invite/route.ts` - Invite API
- `src/app/api/partnership/route.ts` - Partnership API

### BR-003: Partnership Management
**Test Files**:
- `tests/unit/partnership-api.test.ts` - Partnership logic
- `tests/e2e/onboarding.spec.ts` - Partnership creation flow

**Modules**:
- `src/app/api/partnership/route.ts` - Partnership API
- `src/app/page.tsx` - Partnership display
- `src/lib/weekUtils.ts` - Week calculation utilities

### BR-004: Meditation Tracking
**Test Files**:
- `tests/unit/onboarding.test.ts` - Session tracking
- `tests/e2e/onboarding.spec.ts` - Complete tracking flow

**Modules**:
- `src/app/timer/page.tsx` - Meditation timer
- `src/app/api/partnership/route.ts` - Progress tracking
- `src/lib/weekUtils.ts` - Week calculations

### BR-005: PWA Functionality
**Test Files**:
- `tests/e2e/onboarding.spec.ts` - PWA installation
- `tests/unit/onboarding.test.ts` - Service worker tests

**Modules**:
- `public/manifest.json` - PWA manifest
- `public/sw.js` - Service worker
- `src/app/layout.tsx` - PWA metadata

### BR-006: User Interface Standards
**Test Files**:
- `tests/e2e/onboarding.spec.ts` - UI element tests
- `tests/unit/onboarding.test.ts` - Component tests

**Modules**:
- `src/app/page.tsx` - Homepage UI
- `src/app/welcome/page.tsx` - Welcome screen
- `src/app/invite/page.tsx` - Invite screen
- `public/logo.svg` - Logo asset
- `public/icons/` - User icons

### BR-007: Data Persistence
**Test Files**:
- `tests/unit/onboarding.test.ts` - Data storage tests
- `tests/unit/invite-api.test.ts` - API persistence tests
- `tests/unit/partnership-api.test.ts` - Database tests

**Modules**:
- `src/app/api/onboarding/route.ts` - User creation
- `src/app/api/invite/route.ts` - Invite storage
- `src/app/api/partnership/route.ts` - Partnership storage
- `src/lib/prisma.ts` - Database connection
- `prisma/schema.prisma` - Database schema

### BR-008: Error Handling
**Test Files**:
- `tests/unit/onboarding.test.ts` - Error scenarios
- `tests/unit/invite-api.test.ts` - API error handling
- `tests/unit/partnership-api.test.ts` - Partnership errors

**Modules**:
- All API routes - Error handling
- All page components - User feedback
- `src/lib/prisma.ts` - Database error handling

### BR-009: Security
**Test Files**:
- `tests/unit/invite-api.test.ts` - Security tests
- `tests/unit/partnership-api.test.ts` - Access control

**Modules**:
- All API routes - Input validation
- `src/app/api/onboarding/route.ts` - User validation
- `src/app/api/invite/route.ts` - Invite security

### BR-010: Performance
**Test Files**:
- `tests/e2e/onboarding.spec.ts` - Performance tests
- `tests/unit/onboarding.test.ts` - Load time tests

**Modules**:
- All page components - Optimization
- `src/app/layout.tsx` - Asset optimization
- `public/` - Asset optimization
