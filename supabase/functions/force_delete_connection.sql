
-- This function is used as a fallback method to ensure connections are deleted
CREATE OR REPLACE FUNCTION public.force_delete_connection(connection_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.connections WHERE id = connection_id;
END;
$$;
