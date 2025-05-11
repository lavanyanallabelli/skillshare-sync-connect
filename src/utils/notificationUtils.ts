import { supabase } from "@/integrations/supabase/client";
import { APIClient } from '@/api/client';

export const getNotificationIconType = (type: string): string => {
  switch (type) {
    case 'session':
      return 'calendar';
    case 'connection_accepted':
      return 'check-circle';
    case 'connection_declined':
      return 'x-circle';
    case 'connection_request':
      return 'user';
    default:
      return 'bell';
  }
};

export const createConnectionNotification = async (
  userId: string | undefined,
  type: "request" | "accepted" | "declined",
  description: string,
  actionType: string = "connection"
) => {
  if (!userId) return;
  
  try {
    const title = 
      type === "request" ? "New Connection Request" :
      type === "accepted" ? "Connection Request Accepted" : 
      "Connection Request Declined";
    
    await APIClient.post('/notifications', {
      userId,
      title,
      description,
      type: actionType,
      actionUrl: `/profile?tab=${type === "request" ? "requests" : "connections"}`
    });
    
  } catch (error) {
    console.error(`Error creating ${type} notification:`, error);
  }
};

export const createSessionNotification = async (
  sessionData: any,
  notificationType: "create" | "accept" | "decline",
  studentName: string,
  teacherName: string
) => {
  try {
    let recipientId, title, description, actionUrl;
    
    if (notificationType === "create") {
      // Notification to teacher about new request
      recipientId = sessionData.teacher_id;
      title = "New Session Request";
      description = `${studentName} wants to learn ${sessionData.skill} from you`;
      actionUrl = "/profile?tab=requests";
    } else if (notificationType === "accept") {
      // Notification to student about accepted request
      recipientId = sessionData.student_id;
      title = "Session Request Accepted";
      description = `${teacherName} has accepted your ${sessionData.skill} session request`;
      actionUrl = "/profile?tab=sessions";
    } else {
      // Notification to student about declined request
      recipientId = sessionData.student_id;
      title = "Session Request Declined";
      description = `${teacherName} has declined your ${sessionData.skill} session request`;
      actionUrl = "/profile";
    }
    
    if (!recipientId) return;
    
    await APIClient.post('/notifications', {
      userId: recipientId,
      title,
      description,
      type: "session",
      actionUrl
    });
    
  } catch (error) {
    console.error(`Error creating session notification:`, error);
  }
};
