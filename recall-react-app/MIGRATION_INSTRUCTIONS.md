# Database Migration Instructions

## Overview
This migration adds hierarchical tag support to your database, allowing tags to have parent-child relationships (e.g., Music → Punjabi, Indie, Rap, Hiphop).

## Steps to Run Migration

### 1. Run the Migration Scripts

You need to run two migration scripts in order:

#### Option A: Using Supabase CLI (Recommended)

```bash
# Navigate to your project directory
cd "c:\Sid\Siddhant\AI Coding\recall-demo"

# If you have Supabase CLI installed, run:
supabase db push

# Or manually apply migrations:
supabase migration up
```

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migrations in order:

**Migration 1: Add parent_id column**
- Open `supabase/migrations/002_add_parent_id_to_tags.sql`
- Copy and paste the contents into SQL Editor
- Click **Run**

**Migration 2: Create example hierarchical tags (Optional)**
- Open `supabase/migrations/003_create_example_hierarchical_tags.sql`
- Copy and paste the contents into SQL Editor
- **IMPORTANT**: Before running, replace `'USER_UUID_HERE'` with your actual user UUID, or use the function to create tags for all users
- Click **Run**

### 2. Create Example Tags for Your User

After running migration 002, you can create example hierarchical tags using the function:

```sql
-- Replace 'YOUR_USER_UUID' with your actual user ID from auth.users table
SELECT create_example_hierarchical_tags('YOUR_USER_UUID');
```

To find your user UUID:
```sql
SELECT id, email FROM auth.users;
```

Or create tags for all users:
```sql
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM public.profiles LOOP
        PERFORM create_example_hierarchical_tags(user_record.id);
    END LOOP;
END $$;
```

### 3. Verify Migration

Check that the migration was successful:

```sql
-- Check if parent_id column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tags' AND column_name = 'parent_id';

-- Check tags with hierarchy
SELECT 
    t1.name as parent_tag,
    t2.name as child_tag,
    t2.color
FROM tags t1
LEFT JOIN tags t2 ON t2.parent_id = t1.id
WHERE t1.parent_id IS NULL
ORDER BY t1.name, t2.name;
```

## What Changed?

1. **Tags Table**: Added `parent_id` column to support hierarchical relationships
2. **Indexes**: Added indexes for better query performance
3. **Example Tags**: Created helper function to set up example hierarchical tags

## Features Enabled

After running the migration, you can:

- ✅ Create parent tags (e.g., "Music", "Tutorial", "Review")
- ✅ Create child tags under parent tags (e.g., "Punjabi", "Indie", "Rap" under "Music")
- ✅ Filter videos by parent tags (shows all videos with that tag or any child tags)
- ✅ Filter videos by child tags (shows only videos with that specific tag)
- ✅ See hierarchical tag structure in the UI

## Troubleshooting

### Migration fails with "column already exists"
- The migration uses `IF NOT EXISTS`, so it's safe to run multiple times
- If you see this error, the column already exists and you can skip this migration

### Tags not showing in UI
- Make sure you've created tags using the helper function or manually
- Check that tags have the correct `user_id` matching your authenticated user
- Verify RLS policies allow you to read tags

### Need to reset tags
```sql
-- Delete all tags (be careful - this removes all tags!)
DELETE FROM public.tags WHERE user_id = 'YOUR_USER_UUID';
-- Then recreate using the helper function
SELECT create_example_hierarchical_tags('YOUR_USER_UUID');
```
