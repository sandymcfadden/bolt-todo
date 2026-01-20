/*
  # Fix RLS Performance and Security Issues

  1. RLS Policy Optimization
    - Drop existing RLS policies on `tasks` table
    - Recreate policies with optimized `(select auth.uid())` pattern
    - This prevents re-evaluation of auth.uid() for each row, improving performance at scale
    - Policies recreated:
      - "Users can view own tasks" (SELECT)
      - "Users can insert own tasks" (INSERT)
      - "Users can update own tasks" (UPDATE)
      - "Users can delete own tasks" (DELETE)

  2. Index Cleanup
    - Drop unused index `tasks_completed_idx`
    - This index was not being utilized by queries and adds unnecessary overhead

  3. Function Security
    - Fix `update_updated_at_column` function with immutable search path
    - Add SECURITY DEFINER and SET search_path to prevent search path manipulation
    - This protects against potential search path attacks

  4. Important Notes
    - These changes improve query performance and security without affecting functionality
    - All data access patterns remain the same
    - RLS policies maintain the same security boundaries
*/

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- Recreate RLS policies with optimized auth.uid() calls
-- Using (select auth.uid()) evaluates once per query instead of once per row

CREATE POLICY "Users can view own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop unused index on completed column
DROP INDEX IF EXISTS tasks_completed_idx;

-- Recreate function with secure search path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;