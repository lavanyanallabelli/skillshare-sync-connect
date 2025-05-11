
// Notification utilities
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Calendar } from "lucide-react";
import React from "react";

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
    let icon = null;
    let targetUserId = '';
    
    const formattedDate = formatSessionDate(session.day);
    const formattedTime = formatSessionTime(session.time_slot);
    
    switch (type) {
      case 'create':
        title = 'New Session Request';
        description = `${studentName} has requested a session for ${session.skill} on ${formattedDate} at ${formattedTime}.`;
        icon = <Calendar className="h-4 w-4" />;
        targetUserId = session.teacher_id;
        break;
        
      case 'accept':
        title = 'Session Request Accepted';
        description = `${teacherName} has accepted your session request for ${session.skill} on ${formattedDate} at ${formattedTime}.`;
        icon = <CheckCircle className="h-4 w-4 text-green-500" />;
        targetUserId = session.student_id;
        break;
        
      case 'decline':
        title = 'Session Request Declined';
        description = `${teacherName} has declined your session request for ${session.skill} on ${formattedDate} at ${formattedTime}.`;
        icon = <XCircle className="h-4 w-4 text-red-500" />;
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
        read: false
      });

    if (error) {
      console.error("Error creating session notification:", error);
    }
  } catch (error) {
    console.error("Failed to create session notification:", error);
  }
};

// Get icon based on notification type
export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'session_create':
      return <Calendar className="h-4 w-4" />;
    case 'session_accept':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'session_decline':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};
