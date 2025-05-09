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

    // Log the current user ID and target user ID for debugging
    console.log('[Notifications] Current user:', sessionData.session.user.id);
    console.log('[Notifications] Target user:', targetUserId);
    
    // Check if we're creating a notification for ourselves or another user
    const isSelfNotification = sessionData.session.user.id === targetUserId;
    console.log('[Notifications] Is self notification:', isSelfNotification);

    // Create the notification
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
      console.error('[Notifications] Error creating notification:', error);
      
      // If we hit an RLS error, let's add more detailed logging
      if (error.code === '42501') {
        console.error('[Notifications] RLS policy violation. Make sure:');
        console.error('1. You have a policy that allows ANY authenticated user to insert notifications');
        console.error('2. Your policy uses WITH CHECK (auth.uid() IS NOT NULL) for inserts');
        console.error('3. The user is authenticated (session exists)');
      }
      
      toast({
        title: 'Error creating notification',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
    
    console.log('[Notifications] Notification created successfully:', data);
    return data;
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
  recipientId: string,
  action: 'request' | 'accept' | 'decline',
  message: string,
  type: string
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
      recipientId,
      message,
      type
    });
    
    // Create the appropriate notification based on the action
    await createNotification(
      recipientId,
      action === 'request' ? "New Connection Request" :
      action === 'accept' ? "Connection Request Accepted" :
      "Connection Request Declined",
      message,
      type, 
      action === 'request' ? "/profile?tab=connections" :
      action === 'accept' ? `/teacher/${sessionData.session.user.id}` :
      undefined
    );
  } catch (error) {
    console.error("Error in createConnectionNotification:", error);
  }
};
