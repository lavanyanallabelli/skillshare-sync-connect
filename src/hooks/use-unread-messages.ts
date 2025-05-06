
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadMessages = (userId: string | undefined) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Function to fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

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
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchUnreadCount();

    // Subscribe to multiple channels for comprehensive updates
    const messageChannel = supabase
      .channel('message-changes-' + userId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Listen to INSERT events for new messages
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          console.log('[useUnreadMessages] New message received:', payload.new);
          
          // For new message, increment count
          setUnreadCount(prev => prev + 1);
          
          // Also refresh the count from the database to ensure accuracy
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Listen to UPDATE events for read status changes
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          console.log('[useUnreadMessages] Message updated:', payload.new, payload.old);
          
          // If a message was marked as read (read_at changed from null to a value)
          if (payload.new.read_at && !payload.old.read_at) {
            console.log('[useUnreadMessages] Message marked as read, decrementing count');
            setUnreadCount(prev => Math.max(0, prev - 1));
            
            // Also refresh from database to ensure accuracy
            fetchUnreadCount();
          }
        }
      )
      .subscribe();
      
    // Also subscribe to notifications table to update count when notifications are created/updated
    const notificationChannel = supabase
      .channel('notification-changes-' + userId)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events for notifications
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();
      
    // Also subscribe to connections table for connection-related updates
    const connectionChannel = supabase
      .channel('connection-changes-' + userId)
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'connections',
          filter: `or(requester_id.eq.${userId},recipient_id.eq.${userId})`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Also subscribe to sessions table for session-related updates
    const sessionChannel = supabase
      .channel('session-changes-' + userId)
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen to all events
          schema: 'public',
          table: 'sessions',
          filter: `or(teacher_id.eq.${userId},student_id.eq.${userId})`
        },
        () => {
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
  }, [userId, fetchUnreadCount]);

  return unreadCount;
};
