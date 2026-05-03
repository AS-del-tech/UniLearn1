/*
  # Add delete_user function

  Allows authenticated users to delete their own account securely.
  SECURITY DEFINER runs with elevated privileges but is restricted
  to only deleting the currently authenticated user (auth.uid()).

  Run this in your Supabase SQL editor:
  Dashboard → SQL Editor → New query → paste → Run
*/

CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
