/*
  # Add completed_at timestamp to tasks table

  1. Changes
    - Add `completed_at` (timestamptz, nullable) column to `tasks` table
      - Stores the timestamp when a task is marked as completed
      - NULL when task is not completed
      - Automatically set when task is completed
      - Automatically cleared when task is marked incomplete

  2. Important Notes
    - This is a non-destructive change - adds a new nullable column
    - Existing tasks will have NULL for completed_at
    - Application logic will set this value when toggling completion status
*/

-- Add completed_at column to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE tasks ADD COLUMN completed_at timestamptz DEFAULT NULL;
  END IF;
END $$;