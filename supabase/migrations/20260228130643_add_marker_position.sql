-- Add custom marker position to profiles (nullable = use province centroid)
ALTER TABLE public.profiles
  ADD COLUMN marker_lat double precision,
  ADD COLUMN marker_lng double precision;

-- Ensure both are set or both are null
ALTER TABLE public.profiles
  ADD CONSTRAINT chk_marker_position
  CHECK (
    (marker_lat IS NULL AND marker_lng IS NULL)
    OR (marker_lat IS NOT NULL AND marker_lng IS NOT NULL)
  );
