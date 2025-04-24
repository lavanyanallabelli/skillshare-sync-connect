
CREATE OR REPLACE FUNCTION public.get_user_email(user_id UUID)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  RETURN user_email;
END;
$$;

-- Grant access to the authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_email(UUID) TO authenticated;
