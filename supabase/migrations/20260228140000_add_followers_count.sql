-- Add followers_count column to profiles
ALTER TABLE public.profiles
  ADD COLUMN followers_count integer NOT NULL DEFAULT 0;

-- Allow reading followers_count for all authenticated users (RLS already on profiles)
COMMENT ON COLUMN public.profiles.followers_count IS 'Number of followers the user has on X/Twitter';
