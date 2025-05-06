
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadMessages = (userId: string | undefined) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      console.log('[useUnreadMessages] Fetching unread message count for user:', userId);
      try {
        const { data, error } = await supabase
          .rpc('get_unread_message_count', { user_id: userId });
        
        if (!error && data !== null) {
          console.log('[useUnreadMessages] Unread message count:', data);
          setUnreadCount(data);
        } else if (error) {
          console.error('[useUnreadMessages] Error fetching unread message count:', error);
        }
      } catch (err) {
        console.error('[useUnreadMessages] Exception in fetching unread count:', err);
      }
    };

    fetchUnreadCount();

    // Subscribe to multiple channels for comprehensive updates
    const messageChannel = supabase
      .channel('message-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events for messages
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          console.log('[useUnreadMessages] Message event:', payload.eventType, payload);
          fetchUnreadCount();
        }
      )
      .subscribe();
      
    // Also subscribe to notifications table to update count when notifications are created/updated
    const notificationChannel = supabase
      .channel('notification-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events for notifications
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('[useUnreadMessages] Notification event:', payload.eventType, payload);
          fetchUnreadCount();
        }
      )
      .subscribe();
      
    // Also subscribe to connections table for connection-related updates
    const connectionChannel = supabase
      .channel('connection-changes')
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'connections',
          filter: `or(requester_id.eq.${userId},recipient_id.eq.${userId})`
        },
        (payload) => {
          console.log('[useUnreadMessages] Connection event:', payload.eventType, payload);
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Also subscribe to sessions table for session-related updates
    const sessionChannel = supabase
      .channel('session-changes')
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen to all events
          schema: 'public',
          table: 'sessions',
          filter: `or(teacher_id.eq.${userId},student_id.eq.${userId})`
        },
        (payload) => {
          console.log('[useUnreadMessages] Session event:', payload.eventType, payload);
          fetchUnreadCount();
        }
      )
      .subscribe();

    console.log('[useUnreadMessages] Subscribed to message and notification changes for user:', userId);

    return () => {
      console.log('[useUnreadMessages] Cleaning up message and notification subscriptions');
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(connectionChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [userId]);

  return unreadCount;
};
