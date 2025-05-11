
// Notification utilities
import { supabase } from "@/integrations/supabase/client";

type NotificationType = 'create' | 'accept' | 'decline';

// Helper function to format session times for better readability
export const formatSessionTime = (timeSlot: string): string => {
  return timeSlot || "Not specified";
};

// Helper function to format session date for better readability
export const formatSessionDate = (date: string): string => {
  if (!date) return "Not specified";
  
  try {
    const sessionDate = new Date(date);
    return sessionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return date;
  }
};

// Create a notification for session-related events
export const createSessionNotification = async (
  session: any,
  type: NotificationType,
  studentName: string,
  teacherName: string
) => {
  try {
    let title = '';
    let description = '';
    let iconType = '';
    let targetUserId = '';
    
    const formattedDate = formatSessionDate(session.day);
    const formattedTime = formatSessionTime(session.time_slot);
    
    switch (type) {
      case 'create':
        title = 'New Session Request';
        description = `${studentName} has requested a session for ${session.skill} on ${formattedDate} at ${formattedTime}.`;
        iconType = 'calendar';
        targetUserId = session.teacher_id;
        break;
        
      case 'accept':
        title = 'Session Request Accepted';
        description = `${teacherName} has accepted your session request for ${session.skill} on ${formattedDate} at ${formattedTime}.`;
        iconType = 'check-circle';
        targetUserId = session.student_id;
        break;
        
      case 'decline':
        title = 'Session Request Declined';
        description = `${teacherName} has declined your session request for ${session.skill} on ${formattedDate} at ${formattedTime}.`;
        iconType = 'x-circle';
        targetUserId = session.student_id;
        break;
        
      default:
        throw new Error(`Invalid notification type: ${type}`);
    }
    
    // Skip if the sender and receiver are the same user
    if (session.student_id === session.teacher_id) {
      console.log("Skipping notification for same user");
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type: `session_${type}`,
        title,
        description,
        action_url: type === 'create' ? '/profile?tab=requests' : '/profile?tab=sessions',
        read: false,
        icon_type: iconType // Store the icon type as a string
      });

    if (error) {
      console.error("Error creating session notification:", error);
    }
  } catch (error) {
    console.error("Failed to create session notification:", error);
  }
};

// Get icon type based on notification type
export const getNotificationIconType = (type: string): string => {
  switch (type) {
    case 'session_create':
      return 'calendar';
    case 'session_accept':
      return 'check-circle';
    case 'session_decline':
      return 'x-circle';
    default:
      return '';
  }
};

// Create a connection notification
export const createConnectionNotification = async (
  userId: string,
  type: 'request' | 'accept' | 'decline',
  message: string,
  category: string = 'connection'
) => {
  try {
    let title = '';
    let iconType = '';
    
    switch (type) {
      case 'request':
        title = 'New Connection Request';
        iconType = 'user-plus';
        break;
      case 'accept':
        title = 'Connection Accepted';
        iconType = 'user-check';
        break;
      case 'decline':
        title = 'Connection Declined';
        iconType = 'user-x';
        break;
    }
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: `connection_${type}`,
        title,
        description: message,
        action_url: '/profile?tab=connections',
        read: false,
        icon_type: iconType
      });
      
    if (error) {
      console.error("Error creating connection notification:", error);
    }
  } catch (error) {
    console.error("Failed to create connection notification:", error);
  }
};
