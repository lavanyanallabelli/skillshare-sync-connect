import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a connection notification
 * @param userId User ID to send notification to
 * @param action Type of connection action (request, accept, decline)
 * @param message Notification message
 * @param type Notification type
 */
export const createConnectionNotification = async (
  userId: string,
  action: "request" | "accept" | "decline",
  message: string,
  type: string
) => {
  try {
    // Get appropriate title based on action
    let title = "";
    switch (action) {
      case "request":
        title = "New Connection Request";
        break;
      case "accept":
        title = "Connection Accepted";
        break;
      case "decline":
        title = "Connection Declined";
        break;
    }

    // Create notification in database
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      title,
      description: message,
      type,
      read: false,
    });

    if (error) {
      console.error("[notificationUtils] Error creating connection notification:", error);
    }
  } catch (error) {
    console.error("[notificationUtils] Failed to create notification:", error);
  }
};

/**
 * Creates a session notification
 * @param sessionData Session data
 * @param action Type of session action (create, accept, decline)
 * @param studentName Student's name
 * @param teacherName Teacher's name
 */
export const createSessionNotification = async (
  sessionData: any,
  action: "create" | "accept" | "decline",
  studentName: string,
  teacherName: string
) => {
  try {
    let title = "";
    let description = "";

    switch (action) {
      case "create":
        title = "New Session Request";
        description = `${studentName} has requested a learning session with you for ${sessionData.skill}.`;
        break;
      case "accept":
        title = "Session Request Accepted";
        description = `${teacherName} has accepted your session request for ${sessionData.skill}.`;
        break;
      case "decline":
        title = "Session Request Declined";
        description = `${teacherName} has declined your session request for ${sessionData.skill}.`;
        break;
    }

    const { error } = await supabase.from("notifications").insert({
      user_id: sessionData.student_id, // Send to the student
      title,
      description,
      type: "session",
      read: false,
      action_url: `/sessions/${sessionData.id}`, // URL to the session details
    });

    if (error) {
      console.error("[notificationUtils] Error creating session notification:", error);
    }
  } catch (error) {
    console.error("[notificationUtils] Failed to create session notification:", error);
  }
};
