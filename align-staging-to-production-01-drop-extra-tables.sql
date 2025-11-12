-- Script 1: Drop tables that don't exist in production
-- This script removes the invitations and notifications tables from staging
-- since they don't exist in production

-- Drop notifications table first (in case it has foreign keys)
DROP TABLE IF EXISTS notifications CASCADE;

-- Drop invitations table
DROP TABLE IF EXISTS invitations CASCADE;

-- Note: This will also drop any indexes, RLS policies, and constraints
-- associated with these tables automatically due to CASCADE

