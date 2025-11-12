# Simplify Partnerships Table

This script simplifies the partnerships table by removing redundant fields that are already stored in other tables.

## What This Script Does

### Removes Partner Fields (redundant - already in users table):
- `partnername` → Use `users.name` instead
- `partneremail` → Use `users.email` instead  
- `partnerimage` → Use `users.image` instead
- `partnerweeklytarget` → Use `users.weeklytarget` instead

### Removes Week-Specific Fields (redundant - already in weeks table):
- `weeklygoal` → Use `weeks.weeklygoal` instead
- `usersits` → Use `weeks.user1sits` / `weeks.user2sits` instead
- `partnersits` → Use `weeks.user1sits` / `weeks.user2sits` instead
- `currentweekstart` → Use `weeks.weekstart` instead

### Keeps (Partnership-Level Fields):
- `id` - Primary key
- `userid` - Foreign key to users table
- `partnerid` - Foreign key to users table
- `createdat` - When partnership was created
- `score` - Partnership-level score (cumulative across all weeks)
- `UNIQUE(userid, partnerid)` - Constraint remains

## Execution

1. **Run in Production first** (to test):
   - Go to Supabase Production project SQL Editor
   - Copy and paste `simplify-partnerships-table.sql`
   - Execute

2. **Run in Staging** (after verifying production works):
   - Go to Supabase Staging project SQL Editor
   - Copy and paste `simplify-partnerships-table.sql`
   - Execute

## Impact

⚠️ **Data Loss Warning**: This will permanently delete data in the removed columns. However:
- Partner data is already in the `users` table (no loss)
- Week data is already in the `weeks` table (no loss)
- The code already prefers weeks/users tables over partnerships table

## Code Updates Needed

After running this script, you'll need to update the codebase to:
1. Remove references to dropped fields from TypeScript interfaces
2. Update `getUserPartnerships()` to not query dropped fields
3. Update `createPartnership()` to not insert dropped fields
4. Ensure all queries use weeks/users tables for this data

## Verification

The script includes a verification query at the end that shows the final table structure. You should see only:
- id
- userid
- partnerid
- createdat
- score

