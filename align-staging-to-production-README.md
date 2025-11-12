# Align Staging Database to Production Schema

This directory contains SQL scripts to align the staging database schema with production. Production is the source of truth.

## Schema Differences Summary

### USERS Table
**Production has:**
- `id`, `name`, `email`, `weeklytarget`, `usualsitlength`, `image`, `invitecode`, `createdat`
- `invitecode`: TEXT (NOT UNIQUE - duplicates allowed)

**Staging has extra:**
- `updatedat`, `primarywindow`, `timezone`, `whypractice`, `supportneeds`
- `invitecode`: UNIQUE constraint (needs to be removed)

### PARTNERSHIPS Table
**Production has:**
- `id`, `userid`, `partnerid`, `partnername`, `partneremail`, `partnerimage`, `partnerweeklytarget`, `usersits`, `partnersits`, `weeklygoal`, `score`, `currentweekstart`, `createdat`

**Staging has extra:**
- `updatedat`, `isactive`, `currentweeknumber`, `currentstreak`, `longeststreak`, `totalweeks`

**Staging is missing:**
- `partnername`, `partneremail`, `partnerimage`, `partnerweeklytarget`

### WEEKS Table
✅ Already matches production (no changes needed)

### SESSIONS Table
✅ Already matches production (no changes needed)

### Extra Tables in Staging
- `invitations` - Does NOT exist in production (needs to be dropped)
- `notifications` - Does NOT exist in production (needs to be dropped)

## Execution Order

Run these scripts in order in the Supabase Table Editor:

1. **`align-staging-to-production-01-drop-extra-tables.sql`**
   - Drops `invitations` and `notifications` tables
   - **Impact**: All data in these tables will be lost

2. **`align-staging-to-production-02-fix-users-table.sql`**
   - Removes UNIQUE constraint on `invitecode`
   - Drops columns: `updatedat`, `primarywindow`, `timezone`, `whypractice`, `supportneeds`
   - Ensures required columns have correct constraints
   - **Impact**: Data in dropped columns will be lost

3. **`align-staging-to-production-03-fix-partnerships-table.sql`**
   - Adds columns: `partnername`, `partneremail`, `partnerimage`, `partnerweeklytarget`
   - Drops columns: `updatedat`, `isactive`, `currentweeknumber`, `currentstreak`, `longeststreak`, `totalweeks`
   - **Impact**: Data in dropped columns will be lost. New partner columns will be NULL initially.

4. **`align-staging-to-production-04-verify-weeks-sessions.sql`**
   - Verification script - shows table structures
   - No changes made, just verification

## Important Notes

⚠️ **WARNING**: These scripts will:
- **DELETE** data in columns/tables that don't exist in production
- **DROP** tables that don't exist in production
- **REMOVE** constraints that don't exist in production

Make sure you have a backup or are okay with losing this data before running these scripts.

## After Running Scripts

After running all scripts, you should:
1. Verify the schema matches production exactly
2. Re-apply RLS policies if needed (they may have been dropped with the tables)
3. Run your tests to ensure everything still works

