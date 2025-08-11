/*
  # Create players table and leaderboard view

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `high_score` (integer)
      - `games_played` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `players` table
    - Add policies for player data access
*/

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  high_score integer DEFAULT 0,
  games_played integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read all player data"
  ON players
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can update their own data"
  ON players
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);