
import React, { useEffect, useState } from "react";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import SessionsTab from "@/components/profile/tabs/SessionsTab";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { Skeleton } from "@/components/ui/skeleton";

const Sessions: React.FC = () => {
  const { userId } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .or(`teacher_id.eq.${userId},student_id.eq.${userId}`)
        .in("status", ["accepted"])
        .order("created_at", { ascending: false });
      if (error) {
        setLoading(false);
        return;
      }
      
      // Transform the data to ensure consistent date formatting
      const transformedData = data?.map(session => ({
        ...session,
        // Ensure the day property is properly formatted
        day: session.day // No fallback to session.date as it doesn't exist
      })) || [];
      
      setUpcomingSessions(transformedData);
      setLoading(false);
    };
    fetchSessions();
    // Optionally: subscribe to changes for real-time updates
    // ...
  }, [userId]);

  if (loading) {
    return (
      <ProfileLayout>
        <div className="container max-w-6xl py-8">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-60 w-full rounded-lg" />
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="container max-w-6xl py-8">
        <SessionsTab upcomingSessions={upcomingSessions} />
      </div>
    </ProfileLayout>
  );
};

export default Sessions;
