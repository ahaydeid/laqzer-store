-- Migration 15: Allow public SELECT on profiles table for admin chat & buyer avatars
DROP POLICY IF EXISTS "Allow public select profiles" ON public.profiles;

CREATE POLICY "Allow public select profiles"
  ON public.profiles FOR SELECT
  USING (true);
