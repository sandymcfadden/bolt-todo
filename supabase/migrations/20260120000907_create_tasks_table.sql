/*
  # Create tasks table for to-do list application

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key) - Unique identifier for each task
      - `user_id` (uuid, foreign key) - References auth.users, ensures each task belongs to a user
      - `title` (text) - Task title (required)
      - `description` (text) - Optional task description
      - `priority` (text) - Task priority: 'low', 'medium', or 'high'
      - `completed` (boolean) - Task completion status, defaults to false
      - `created_at` (timestamptz) - Timestamp when task was created
      - `updated_at` (timestamptz) - Timestamp when task was last updated

  2. Security
    - Enable RLS on `tasks` table
    - Add policy for authenticated users to view only their own tasks
    - Add policy for authenticated users to insert tasks with their user_id
    - Add policy for authenticated users to update only their own tasks
    - Add policy for authenticated users to delete only their own tasks

  3. Important Notes
    - All tasks are user-specific and isolated through RLS
    - Priority values are constrained to 'low', 'medium', 'high'
    - The updated_at timestamp automatically updates on modifications
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);

-- Create index on completed status for filtering
CREATE INDEX IF NOT EXISTS tasks_completed_idx ON tasks(completed);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own tasks
CREATE POLICY "Users can view own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert tasks with their own user_id
CREATE POLICY "Users can insert own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own tasks
CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own tasks
CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function before any update
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();