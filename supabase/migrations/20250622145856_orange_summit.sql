/*
  # Add Preset Tags for New Users

  1. Function to create preset tags for new users
  2. Trigger to automatically create preset tags when user profile is created
  3. Insert preset tags for existing users (if any)
*/

-- Create function to add preset tags for a user
CREATE OR REPLACE FUNCTION create_preset_tags_for_user(user_uuid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.tags (user_id, name, color, category) VALUES
    (user_uuid, 'Startup', '#3B82F6', 'preset'),
    (user_uuid, 'Project', '#10B981', 'preset'),
    (user_uuid, 'Personal', '#8B5CF6', 'preset'),
    (user_uuid, 'Tech', '#F59E0B', 'preset'),
    (user_uuid, 'Work', '#EF4444', 'preset'),
    (user_uuid, 'Creative', '#EC4899', 'preset'),
    (user_uuid, 'Learning', '#06B6D4', 'preset'),
    (user_uuid, 'Health', '#84CC16', 'preset'),
    (user_uuid, 'Business', '#F97316', 'preset'),
    (user_uuid, 'Innovation', '#6366F1', 'preset')
  ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to include preset tags
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  
  -- Create preset tags
  PERFORM create_preset_tags_for_user(new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create preset tags for any existing users who don't have them
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT up.user_id 
    FROM user_profiles up
    LEFT JOIN tags t ON up.user_id = t.user_id AND t.category = 'preset'
    WHERE t.id IS NULL
  LOOP
    PERFORM create_preset_tags_for_user(user_record.user_id);
  END LOOP;
END $$;