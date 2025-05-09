
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createSessionNotification } from "@/utils/notificationUtils";

export const useSessionRequest = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendSessionRequest = async (
    teacherId: string,
    studentId: string,
    skill: string,
    day: string,
    timeSlot: string
  ) => {
    setIsSubmitting(true);
    try {
      // Get user names for the notification
      const { data: studentData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', studentId)
        .single();
        
      const { data: teacherData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', teacherId)
        .single();
      
      const studentName = studentData ? 
        `${studentData.first_name} ${studentData.last_name}` : "A student";
      const teacherName = teacherData ? 
        `${teacherData.first_name} ${teacherData.last_name}` : "A teacher";
        
      // Create session request
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          teacher_id: teacherId,
          student_id: studentId,
          skill,
          day,
          time_slot: timeSlot,
          status: 'pending'
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error sending session request:", error);
        toast({
          title: "Error",
          description: "Failed to send session request. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      // Create a notification for the teacher using the utility function
      await createSessionNotification(
        data,
        'create',
        studentName,
        teacherName
      );
      
      toast({
        title: "Success",
        description: "Session request sent successfully!"
      });
      
      return true;
    } catch (error) {
      console.error("Error in sendSessionRequest:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    sendSessionRequest,
    isSubmitting
  };
};
