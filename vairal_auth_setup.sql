-- 1. Create the custom public table to store auth profiles
CREATE TABLE public.vairal_auth (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'brand'::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- The id from auth.users will be the primary key
  PRIMARY KEY (id)
);

-- 2. Enable Row Level Security (RLS) to secure the table
ALTER TABLE public.vairal_auth ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy so users can only read and update their own data
CREATE POLICY "Users can view own profile."
  ON public.vairal_auth FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.vairal_auth FOR UPDATE
  USING ( auth.uid() = id );

-- 4. Create a function to automatically copy new sign-ups into our public table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.vairal_auth (id, email, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the trigger on the Supabase auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
