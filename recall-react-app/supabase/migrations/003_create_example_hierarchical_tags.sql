-- Migration: Create example hierarchical tags
-- This script creates parent tags (Music, Tutorial, etc.) and child tags (Punjabi, Indie, Rap, Hiphop, etc.)
-- Run this AFTER running migration 002_add_parent_id_to_tags.sql

-- Note: This migration uses a function that will create tags for all users
-- You may want to modify this to only create tags for specific users or run it manually

-- Function to create hierarchical tags for a user
CREATE OR REPLACE FUNCTION create_example_hierarchical_tags(target_user_id UUID)
RETURNS void AS $$
DECLARE
    music_tag_id UUID;
    tutorial_tag_id UUID;
    review_tag_id UUID;
    dev_tag_id UUID;
BEGIN
    -- Create parent tags (only if they don't exist)
    
    -- Music tag
    INSERT INTO public.tags (user_id, name, color, parent_id)
    VALUES (target_user_id, 'Music', '#ec4899', NULL)
    ON CONFLICT (user_id, name) DO NOTHING
    RETURNING id INTO music_tag_id;
    
    -- Get Music tag ID if it already exists
    IF music_tag_id IS NULL THEN
        SELECT id INTO music_tag_id FROM public.tags 
        WHERE user_id = target_user_id AND name = 'Music';
    END IF;
    
    -- Create child tags for Music
    INSERT INTO public.tags (user_id, name, color, parent_id)
    VALUES 
        (target_user_id, 'Punjabi', '#f472b6', music_tag_id),
        (target_user_id, 'Indie', '#f9a8d4', music_tag_id),
        (target_user_id, 'Rap', '#fbcfe8', music_tag_id),
        (target_user_id, 'Hiphop', '#fce7f3', music_tag_id)
    ON CONFLICT (user_id, name) DO NOTHING;
    
    -- Tutorial tag
    INSERT INTO public.tags (user_id, name, color, parent_id)
    VALUES (target_user_id, 'Tutorial', '#10b981', NULL)
    ON CONFLICT (user_id, name) DO NOTHING
    RETURNING id INTO tutorial_tag_id;
    
    IF tutorial_tag_id IS NULL THEN
        SELECT id INTO tutorial_tag_id FROM public.tags 
        WHERE user_id = target_user_id AND name = 'Tutorial';
    END IF;
    
    -- Create child tags for Tutorial
    INSERT INTO public.tags (user_id, name, color, parent_id)
    VALUES 
        (target_user_id, 'Programming', '#34d399', tutorial_tag_id),
        (target_user_id, 'Cooking', '#6ee7b7', tutorial_tag_id),
        (target_user_id, 'DIY', '#a7f3d0', tutorial_tag_id)
    ON CONFLICT (user_id, name) DO NOTHING;
    
    -- Review tag
    INSERT INTO public.tags (user_id, name, color, parent_id)
    VALUES (target_user_id, 'Review', '#3b82f6', NULL)
    ON CONFLICT (user_id, name) DO NOTHING
    RETURNING id INTO review_tag_id;
    
    IF review_tag_id IS NULL THEN
        SELECT id INTO review_tag_id FROM public.tags 
        WHERE user_id = target_user_id AND name = 'Review';
    END IF;
    
    -- Create child tags for Review
    INSERT INTO public.tags (user_id, name, color, parent_id)
    VALUES 
        (target_user_id, 'Tech Review', '#60a5fa', review_tag_id),
        (target_user_id, 'Product Review', '#93c5fd', review_tag_id),
        (target_user_id, 'Movie Review', '#bfdbfe', review_tag_id)
    ON CONFLICT (user_id, name) DO NOTHING;
    
    -- Dev tag
    INSERT INTO public.tags (user_id, name, color, parent_id)
    VALUES (target_user_id, 'Dev', '#6366f1', NULL)
    ON CONFLICT (user_id, name) DO NOTHING
    RETURNING id INTO dev_tag_id;
    
    IF dev_tag_id IS NULL THEN
        SELECT id INTO dev_tag_id FROM public.tags 
        WHERE user_id = target_user_id AND name = 'Dev';
    END IF;
    
    -- Create child tags for Dev
    INSERT INTO public.tags (user_id, name, color, parent_id)
    VALUES 
        (target_user_id, 'React', '#818cf8', dev_tag_id),
        (target_user_id, 'Next.js', '#a5b4fc', dev_tag_id),
        (target_user_id, 'TypeScript', '#c7d2fe', dev_tag_id)
    ON CONFLICT (user_id, name) DO NOTHING;
    
END;
$$ LANGUAGE plpgsql;

-- Note: To create tags for a specific user, run:
-- SELECT create_example_hierarchical_tags('USER_UUID_HERE');

-- Or to create for all existing users:
-- DO $$
-- DECLARE
--     user_record RECORD;
-- BEGIN
--     FOR user_record IN SELECT id FROM public.profiles LOOP
--         PERFORM create_example_hierarchical_tags(user_record.id);
--     END LOOP;
-- END $$;
