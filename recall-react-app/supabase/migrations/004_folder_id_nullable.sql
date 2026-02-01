-- Allow videos to exist without a folder (liked-only: appear on Liked page and carousel, not in any folder)
ALTER TABLE public.videos
  ALTER COLUMN folder_id DROP NOT NULL;

-- Keep foreign key: when folder_id is set it must reference a valid folder
-- When folder_id is NULL, the video is "liked only" and appears only on Liked Videos page / carousel
