
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
        .select(`
          *,
          student:profiles!sessions_student_id_fkey(first_name, last_name),
          teacher:profiles!sessions_teacher_id_fkey(first_name, last_name)
        `)
        .or(`teacher_id.eq.${userId},student_id.eq.${userId}`)
        .in("status", ["accepted"])
        .order("created_at", { ascending: false });
      if (error) {
        setLoading(false);
        return;
      }
      
      // Transform the data to ensure consistent date formatting and names
      const transformedData = data?.map(session => {
        let partnerName = "";
        if (userId === session.teacher_id && session.student) {
          partnerName = `${session.student.first_name} ${session.student.last_name}`;
        } else if (userId === session.student_id && session.teacher) {
          partnerName = `${session.teacher.first_name} ${session.teacher.last_name}`;
        }
        
        return {
          ...session,
          // Ensure the day property is properly formatted
          day: session.day,
          // Add partner name for display
          from: partnerName
        };
      }) || [];
      
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
