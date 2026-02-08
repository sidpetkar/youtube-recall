-- Remove Inbox folder: move all videos to Liked (folder_id = null), then delete Inbox folder(s), stop creating default folder for new users.
-- Run once. Preserves video order (videos keep existing order on Liked by their existing sort fields).

-- 1. Move all videos from default/Inbox folders to Liked (folder_id = null)
UPDATE public.videos v
SET folder_id = NULL
FROM public.folders f
WHERE v.folder_id = f.id
  AND f.user_id = v.user_id
  AND (f.is_default = TRUE OR f.name = 'Inbox');

-- 2. Delete all default/Inbox folders
DELETE FROM public.folders
WHERE is_default = TRUE OR name = 'Inbox';

-- 3. Stop creating default Inbox for new users
DROP TRIGGER IF EXISTS trigger_create_default_folder ON public.profiles;

-- Optional: drop the function so it's not recreated by mistake
DROP FUNCTION IF EXISTS create_default_folder_for_user();
