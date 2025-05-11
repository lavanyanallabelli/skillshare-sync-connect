
import { supabase } from "@/integrations/supabase/client";
import { APIClient } from "@/api/client";

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
  userId: string | undefined,
  type: "request" | "accepted" | "declined",
  description: string
) => {
  if (!userId) return;
  
  try {
    const title = 
      type === "request" ? "New Session Request" :
      type === "accepted" ? "Session Request Accepted" : 
      "Session Request Declined";
    
    await APIClient.post('/notifications', {
      userId,
      title,
      description,
      type: "session",
      actionUrl: `/profile?tab=${type === "request" ? "requests" : "sessions"}`
    });
    
  } catch (error) {
    console.error(`Error creating ${type} session notification:`, error);
  }
};
