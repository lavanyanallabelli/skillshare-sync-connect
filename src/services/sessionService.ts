
// Session service
import { supabase } from '@/integrations/supabase/client';
import { Session, SessionRequest } from '@/models/Session';
import { toast } from '@/hooks/use-toast';
import { createSessionNotification } from '@/utils/notificationUtils';

export const sessionService = {
  async getSessionRequests(userId: string): Promise<Session[]> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          student:profiles!sessions_student_id_fkey(first_name, last_name),
          teacher:profiles!sessions_teacher_id_fkey(first_name, last_name)
        `)
        .or(`teacher_id.eq.${userId},student_id.eq.${userId}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return (data || []).map(session => ({
        id: session.id,
        teacherId: session.teacher_id,
        studentId: session.student_id,
        teacherName: session.teacher ? `${session.teacher.first_name} ${session.teacher.last_name}` : 'Unknown',
        studentName: session.student ? `${session.student.first_name} ${session.student.last_name}` : 'Unknown',
        skill: session.skill,
        day: session.day,
        timeSlot: session.time_slot,
        status: session.status as 'pending' | 'accepted' | 'declined' | 'completed',
        meetingLink: session.meeting_link,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      }));
    } catch (error) {
      console.error('Error getting session requests:', error);
      return [];
    }
  },
  
  async getUpcomingSessions(userId: string): Promise<Session[]> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          student:profiles!sessions_student_id_fkey(first_name, last_name),
          teacher:profiles!sessions_teacher_id_fkey(first_name, last_name)
        `)
        .or(`teacher_id.eq.${userId},student_id.eq.${userId}`)
        .eq('status', 'accepted')
        .order('day', { ascending: true });
        
      if (error) throw error;
      
      return (data || []).map(session => ({
        id: session.id,
        teacherId: session.teacher_id,
        studentId: session.student_id,
        teacherName: session.teacher ? `${session.teacher.first_name} ${session.teacher.last_name}` : 'Unknown',
        studentName: session.student ? `${session.student.first_name} ${session.student.last_name}` : 'Unknown',
        skill: session.skill,
        day: session.day,
        timeSlot: session.time_slot,
        status: session.status as 'pending' | 'accepted' | 'declined' | 'completed',
        meetingLink: session.meeting_link,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      }));
    } catch (error) {
      console.error('Error getting upcoming sessions:', error);
      return [];
    }
  },
  
  async sendSessionRequest(request: SessionRequest): Promise<boolean> {
    try {
      // Get user names for the notification
      const { data: studentData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', request.studentId)
        .single();
        
      const { data: teacherData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', request.teacherId)
        .single();
      
      const studentName = studentData ? 
        `${studentData.first_name} ${studentData.last_name}` : "A student";
      const teacherName = teacherData ? 
        `${teacherData.first_name} ${teacherData.last_name}` : "A teacher";
        
      // Create session request
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          teacher_id: request.teacherId,
          student_id: request.studentId,
          skill: request.skill,
          day: request.day,
          time_slot: request.timeSlot,
          status: 'pending'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Create a notification for the teacher
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
      console.error('Error sending session request:', error);
      toast({
        title: "Error",
        description: "Failed to send session request. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  },
  
  async acceptSessionRequest(sessionId: string, meetingLink: string): Promise<boolean> {
    try {
      // Get session details first for notifications
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          *,
          student:profiles!sessions_student_id_fkey(first_name, last_name),
          teacher:profiles!sessions_teacher_id_fkey(first_name, last_name)
        `)
        .eq('id', sessionId)
        .single();
        
      if (sessionError || !sessionData) throw sessionError;

      const studentName = sessionData.student ? 
        `${sessionData.student.first_name} ${sessionData.student.last_name}` : "Student";
      const teacherName = sessionData.teacher ? 
        `${sessionData.teacher.first_name} ${sessionData.teacher.last_name}` : "Teacher";
      
      // Update session status
      const { error } = await supabase
        .from('sessions')
        .update({ 
          status: 'accepted',
          meeting_link: meetingLink
        })
        .eq('id', sessionId);
        
      if (error) throw error;
      
      // Create notification for the student
      await createSessionNotification(
        sessionData,
        'accept',
        studentName,
        teacherName
      );
      
      toast({
        title: "Session Accepted",
        description: "The session has been added to your schedule."
      });
      
      return true;
    } catch (error) {
      console.error('Error accepting session:', error);
      toast({
        title: "Error",
        description: "Failed to accept session. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  },
  
  async declineSessionRequest(sessionId: string): Promise<boolean> {
    try {
      // Get session details first for notifications
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          *,
          student:profiles!sessions_student_id_fkey(first_name, last_name),
          teacher:profiles!sessions_teacher_id_fkey(first_name, last_name)
        `)
        .eq('id', sessionId)
        .single();
        
      if (sessionError || !sessionData) throw sessionError;

      const studentName = sessionData.student ? 
        `${sessionData.student.first_name} ${sessionData.student.last_name}` : "Student";
      const teacherName = sessionData.teacher ? 
        `${sessionData.teacher.first_name} ${sessionData.teacher.last_name}` : "Teacher";
      
      // Update session status
      const { error } = await supabase
        .from('sessions')
        .update({ status: 'declined' })
        .eq('id', sessionId);
        
      if (error) throw error;
      
      // Create notification for the student
      await createSessionNotification(
        sessionData,
        'decline',
        studentName,
        teacherName
      );
      
      toast({
        title: "Session Declined",
        description: "The session request has been declined."
      });
      
      return true;
    } catch (error) {
      console.error('Error declining session:', error);
      toast({
        title: "Error",
        description: "Failed to decline session. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }
};
