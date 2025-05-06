
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadMessages = (userId: string | undefined) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      console.log('[useUnreadMessages] Fetching unread message count for user:', userId);
      const { data, error } = await supabase
        .rpc('get_unread_message_count', { user_id: userId });
      
      if (!error && data !== null) {
        console.log('[useUnreadMessages] Unread message count:', data);
        setUnreadCount(data);
      } else if (error) {
        console.error('[useUnreadMessages] Error fetching unread message count:', error);
      }
    };

    fetchUnreadCount();

    // Subscribe to notifications, messages, and connections to update unread count
    const messageChannel = supabase
      .channel('message-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          console.log('[useUnreadMessages] New message received:', payload);
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          console.log('[useUnreadMessages] Message updated:', payload);
          fetchUnreadCount();
        }
      )
      .subscribe();
      
    // Also subscribe to notifications table to update count when notifications are created
    const notificationChannel = supabase
      .channel('notification-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('[useUnreadMessages] New notification received:', payload);
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('[useUnreadMessages] Notification updated:', payload);
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
          console.log('[useUnreadMessages] Connection update:', payload);
          console.log('[useUnreadMessages] Connection event type:', payload.eventType);
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
    };
  }, [userId]);

  return unreadCount;
};
