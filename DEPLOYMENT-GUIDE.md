# Deployment Guide: Simplified Partnerships Schema

This guide covers deploying the simplified partnerships table schema changes to both staging and production.

## Pre-Deployment Checklist

### ✅ Database Schema Changes

**Before deploying code, run these SQL scripts in Supabase:**

1. **Production Database** (`serenity-plus` project):
   - [ ] Run `simplify-partnerships-table.sql` in Supabase SQL Editor
   - [ ] Verify schema: `SELECT column_name FROM information_schema.columns WHERE table_name = 'partnerships'`
   - [ ] Should only see: `id`, `userid`, `partnerid`, `createdat`, `score`

2. **Staging Database**:
   - [ ] Run `simplify-partnerships-table.sql` in Supabase SQL Editor
   - [ ] Verify schema matches production

### ✅ Code Changes

All code changes have been made:
- [x] `src/lib/supabase-database.ts` - Updated queries
- [x] `src/app/api/partnership/route.ts` - Fixed field references
- [x] `src/app/api/lotus-progress/route.ts` - Gets weeklygoal from weeks
- [x] `src/app/api/session-complete/route.ts` - Calculates weeklygoal from users

### ✅ Testing

- [ ] Run tests locally: `npm run test:all`
- [ ] Verify no linter errors: `npm run lint`
- [ ] Build succeeds: `npm run build`

## Deployment Steps

### Option 1: Automatic Deployment (Recommended)

**Production:**
1. Push changes to `main` branch:
   ```bash
   git add .
   git commit -m "Simplify partnerships table schema - remove redundant fields"
   git push origin main
   ```
2. Vercel will automatically deploy production
3. Monitor deployment at: https://vercel.com/dashboard

**Staging:**
- Staging deploys automatically on push to `main` (if configured)
- Or manually trigger via Vercel dashboard

### Option 2: Manual Vercel Deployment

1. **Via Vercel CLI:**
   ```bash
   # Install Vercel CLI if needed
   npm i -g vercel
   
   # Deploy to production
   vercel --prod
   
   # Or deploy to preview/staging
   vercel
   ```

2. **Via Vercel Dashboard:**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Click "Deploy" or trigger redeploy

## Post-Deployment Verification

### 1. Check Application Health

**Production:**
- [ ] Visit: https://serenity-plus-kohl.vercel.app
- [ ] Verify homepage loads without errors
- [ ] Check browser console for errors

**Staging:**
- [ ] Visit staging URL (from `E2E_BASE_URL` secret)
- [ ] Verify homepage loads without errors

### 2. Test Core Functionality

- [ ] **User Onboarding:**
  - Create new user
  - Complete onboarding flow
  - Verify user created in database

- [ ] **Partnership Creation:**
  - User1 creates account and gets invite code
  - User2 uses invite code to create account
  - Verify partnership is created
  - Verify Week 1 is automatically created

- [ ] **Partnership Display:**
  - Homepage shows partnerships correctly
  - Partner info displays (name, image, etc.)
  - Weekly goal displays correctly
  - Sit counts display correctly

- [ ] **Session Completion:**
  - Complete a meditation session
  - Verify session is recorded
  - Verify week sit count increments

- [ ] **Lotus Progress:**
  - Check lotus progress API works
  - Verify progress calculation is correct

### 3. Database Verification

**Check partnerships table structure:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'partnerships'
ORDER BY ordinal_position;
```

**Expected columns:**
- `id` (uuid)
- `userid` (uuid)
- `partnerid` (uuid)
- `createdat` (timestamp with time zone)
- `score` (integer)

**Verify no errors in logs:**
- Check Vercel function logs
- Check Supabase logs for query errors

### 4. Monitor for Issues

Watch for:
- [ ] 400 errors about missing columns
- [ ] Partnership creation failures
- [ ] Week creation failures
- [ ] Lotus progress API errors
- [ ] Session completion errors

## Rollback Plan

If issues occur after deployment:

### Quick Rollback (Code Only)
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### Database Rollback (If Needed)
If you need to restore dropped columns:
1. Check if you have a database backup
2. Restore from backup
3. Or manually add columns back (not recommended - data will be lost)

## Deployment Checklist Summary

- [ ] Database schema updated in production
- [ ] Database schema updated in staging
- [ ] Code changes committed and pushed
- [ ] Production deployment successful
- [ ] Staging deployment successful
- [ ] Homepage loads without errors
- [ ] Partnership creation works
- [ ] Partnership display works
- [ ] Session completion works
- [ ] Lotus progress works
- [ ] No console errors
- [ ] No database query errors

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase query logs
3. Check browser console for errors
4. Verify database schema matches expected structure
5. Review `FIXED-DROPPED-FIELDS-REFERENCES.md` for all changes made

## Next Steps After Deployment

1. Monitor application for 24-48 hours
2. Check user feedback
3. Verify all features working as expected
4. Update documentation if needed

