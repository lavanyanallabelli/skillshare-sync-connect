
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const createNotification = async (
  targetUserId: string, 
  title: string, 
  description: string, 
  type: string, 
  action_url?: string
) => {
  try {
    // First check if the user exists
    const { data: userExists, error: userCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', targetUserId)
      .single();
    
    if (userCheckError || !userExists) {
      console.error("Cannot create notification: User does not exist", targetUserId);
      return null;
    }
    
    // Create the notification
    console.log('[Notifications] createNotification called:', {targetUserId, title, description, type, action_url});
    
    // Check if we have a valid session before proceeding
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('[Notifications] Not authenticated, cannot create notification');
      return null;
    }

    // First try using the service role approach which bypasses RLS
    try {
      // Create the notification using standard insert
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          title,
          description,
          type,
          action_url: action_url || null,
          read: false
        })
        .select()
        .single();

      if (error) {
        // If there's an error, log it but continue to the fallback approach
        console.warn('[Notifications] Standard insert failed:', error);
      } else {
        console.log('[Notifications] Notification created successfully:', data);
        return data;
      }
    } catch (insertError) {
      console.warn('[Notifications] Error during standard insert:', insertError);
      // Continue to fallback approach
    }

    // Fallback: Try to create notification with explicit user_id match
    // This might work if there's an RLS policy allowing users to create their own notifications
    if (sessionData.session?.user?.id === targetUserId) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            user_id: targetUserId,
            title,
            description,
            type,
            action_url: action_url || null,
            read: false
          })
          .select()
          .single();

        if (error) {
          toast({
            title: 'Error creating notification',
            description: error.message,
            variant: 'destructive'
          });
          console.error('[Notifications] Error creating notification with user ID match:', error);
          return null;
        }
        
        console.log('[Notifications] Notification created successfully with user ID match:', data);
        return data;
      } catch (fallbackError) {
        console.error('[Notifications] Fallback approach failed:', fallbackError);
      }
    } else {
      console.error('[Notifications] Cannot create notification: Current user does not match target user and RLS prevents cross-user creation');
    }

    return null;
  } catch (error) {
    toast({
      title: 'Error in createNotification',
      description: error instanceof Error ? error.message : String(error),
      variant: 'destructive'
    });
    console.error('[Notifications] Failed to create notification:', error);
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
    console.log(`Creating ${action} session notification for:`, {
      teacher: sessionData.teacher_id,
      student: sessionData.student_id
    });
    
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
    // Check if we have a valid session before proceeding
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('[ConnectionNotifications] Not authenticated, cannot create notification');
      return;
    }
    
    console.log('[ConnectionNotifications] Creating notification:', {
      action,
      connection: connectionData,
      requesterName,
      recipientName
    });
    
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
        console.log('[ConnectionNotifications] Creating decline notification for:', connectionData.requester_id);
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
