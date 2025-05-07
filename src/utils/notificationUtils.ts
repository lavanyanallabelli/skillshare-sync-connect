
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates a notification for a user
 * 
 * @param targetUserId The user who will receive the notification
 * @param title Notification title
 * @param description Notification description
 * @param type Type of notification: 'connection', 'session', 'message'
 * @param actionUrl Optional URL to direct the user to when clicking the notification
 * @returns The created notification or null if there was an error
 */
export const createNotification = async (
  targetUserId: string, 
  title: string, 
  description: string, 
  type: string, 
  actionUrl?: string
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        title,
        description,
        type,
        action_url: actionUrl || null,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
};

/**
 * Creates notifications for session status changes
 */
export const createSessionNotification = async (
  sessionData: any,
  action: 'create' | 'accept' | 'decline',
  studentName: string,
  teacherName: string
) => {
  try {
    switch (action) {
      case 'create':
        // Notify teacher about new session request
        await createNotification(
          sessionData.teacher_id,
          "New Session Request",
          `${studentName} requested a session for ${sessionData.skill} on ${sessionData.day}.`,
          "session",
          "/profile?tab=requests"
        );
        break;
      
      case 'accept':
        // Notify student that session was accepted
        await createNotification(
          sessionData.student_id,
          "Session Request Accepted",
          `${teacherName} accepted your session request for ${sessionData.skill}.`,
          "session",
          "/sessions"
        );
        break;
        
      case 'decline':
        // Notify student that session was declined
        await createNotification(
          sessionData.student_id,
          "Session Request Declined",
          `${teacherName} declined your session request for ${sessionData.skill}.`,
          "session"
        );
        break;
    }
  } catch (error) {
    console.error("Error in createSessionNotification:", error);
  }
};

/**
 * Creates notifications for connection status changes
 */
export const createConnectionNotification = async (
  connectionData: any,
  action: 'request' | 'accept' | 'decline',
  requesterName: string,
  recipientName: string
) => {
  try {
    switch (action) {
      case 'request':
        // Notify recipient about new connection request
        await createNotification(
          connectionData.recipient_id,
          "New Connection Request",
          `${requesterName} wants to connect with you.`,
          "connection", 
          "/profile?tab=connections"
        );
        break;
      
      case 'accept':
        // Notify requester that connection was accepted
        await createNotification(
          connectionData.requester_id,
          "Connection Request Accepted",
          `${recipientName} accepted your connection request.`,
          "connection",
          `/teacher/${connectionData.recipient_id}`
        );
        break;
        
      case 'decline':
        // Notify requester that connection was declined
        await createNotification(
          connectionData.requester_id,
          "Connection Request Declined",
          `${recipientName} declined your connection request.`,
          "connection"
        );
        break;
    }
  } catch (error) {
    console.error("Error in createConnectionNotification:", error);
  }
};
