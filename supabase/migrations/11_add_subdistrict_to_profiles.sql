-- Migration 11: Add subdistrict and subdistrict_id to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subdistrict TEXT,
ADD COLUMN IF NOT EXISTS subdistrict_id TEXT;
