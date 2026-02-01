-- Store resume-at timestamp (seconds) so opening the video from the app starts at that position
-- YouTube doesn't provide this via API; we capture it in the extension when user saves from YouTube
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS resume_at_seconds INTEGER;

COMMENT ON COLUMN public.videos.resume_at_seconds IS 'When opening this video from the app, start at this position (seconds). Set by extension when saving from YouTube.';
