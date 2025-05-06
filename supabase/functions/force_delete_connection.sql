
-- This function is used as a fallback method to ensure connections are deleted
CREATE OR REPLACE FUNCTION public.force_delete_connection(connection_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  success boolean := false;
  deleted_count integer;
BEGIN
  -- Attempt to delete the connection directly
  DELETE FROM public.connections WHERE id = connection_id;
  
  -- Check if deletion was successful
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count > 0 THEN
    success := true;
  END IF;
  
  RETURN success;
END;
$$;
