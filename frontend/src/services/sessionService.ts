import { supabase } from "@/integrations/supabase/client";
import { createSessionNotification } from "@/utils/notificationUtils";

interface Session {
  id: string;
  created_at: string;
  student_id: string;
  teacher_id: string;
  skill: string;
  day: string;
  time_slot: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  meet_link: string | null;
}

const acceptSession = async (sessionId: string) => {
  try {
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        student:profiles!sessions_student_id_fkey(first_name, last_name),
        teacher:profiles!sessions_teacher_id_fkey(first_name, last_name)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error("Error fetching session:", sessionError);
      throw sessionError;
    }

    if (!sessionData) {
      console.error("Session not found");
      return;
    }

    const { error: updateError } = await supabase
      .from('sessions')
      .update({ status: 'accepted' })
      .eq('id', sessionId);

    if (updateError) {
      console.error("Error accepting session:", updateError);
      throw updateError;
    }

    const studentName = sessionData.student ? `${sessionData.student.first_name} ${sessionData.student.last_name}` : 'Student';
    const teacherName = sessionData.teacher ? `${sessionData.teacher.first_name} ${sessionData.teacher.last_name}` : 'Teacher';
    const session = sessionData;
    await createSessionNotification(
      session,
      "accept",
      studentName,
      teacherName
    );

  } catch (error) {
    console.error("Error in acceptSession:", error);
  }
};

const declineSession = async (sessionId: string) => {
  try {
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        student:profiles!sessions_student_id_fkey(first_name, last_name),
        teacher:profiles!sessions_teacher_id_fkey(first_name, last_name)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error("Error fetching session:", sessionError);
      throw sessionError;
    }

    if (!sessionData) {
      console.error("Session not found");
      return;
    }

    const { error: updateError } = await supabase
      .from('sessions')
      .update({ status: 'declined' })
      .eq('id', sessionId);

    if (updateError) {
      console.error("Error declining session:", updateError);
      throw updateError;
    }

    const studentName = sessionData.student ? `${sessionData.student.first_name} ${sessionData.student.last_name}` : 'Student';
    const teacherName = sessionData.teacher ? `${sessionData.teacher.first_name} ${sessionData.teacher.last_name}` : 'Teacher';
    const session = sessionData;
    await createSessionNotification(
      session,
      "decline",
      studentName,
      teacherName
    );

  } catch (error) {
    console.error("Error in declineSession:", error);
  }
};

const createSessionRequest = async (sessionData: any) => {
  try {
    const { data: teacherData, error: teacherError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', sessionData.teacher_id)
      .single();

    if (teacherError) {
      console.error("Error fetching teacher data:", teacherError);
      throw teacherError;
    }

    const { data: studentData, error: studentError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', sessionData.student_id)
      .single();

    if (studentError) {
      console.error("Error fetching student data:", studentError);
      throw studentError;
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      throw error;
    }

    const teacherName = teacherData ? `${teacherData.first_name} ${teacherData.last_name}` : 'Teacher';
    const studentName = studentData ? `${studentData.first_name} ${studentData.last_name}` : 'Student';
    const newSession = data;
    await createSessionNotification(
      newSession,
      "create",
      studentName,
      teacherName
    );

    return data;
  } catch (error) {
    console.error("Error in createSessionRequest:", error);
  }
};

export const sessionService = {
  acceptSession,
  declineSession,
  createSessionRequest,
};
