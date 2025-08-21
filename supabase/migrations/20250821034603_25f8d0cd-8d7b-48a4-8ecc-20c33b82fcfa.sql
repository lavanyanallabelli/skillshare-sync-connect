-- Restrict public access to user availability schedules
-- Drop existing public SELECT policy
DROP POLICY IF EXISTS "Users can view all availability" ON public.user_availability;

-- Create authenticated-only SELECT policy for user availability
CREATE POLICY "Authenticated users can view availability"
ON public.user_availability
FOR SELECT
TO authenticated
USING (true);