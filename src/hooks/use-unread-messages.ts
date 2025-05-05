
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadMessages = (userId: string | undefined) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      console.log('Fetching unread message count for user:', userId);
      const { data, error } = await supabase
        .rpc('get_unread_message_count', { user_id: userId });
      
      if (!error && data !== null) {
        console.log('Unread message count:', data);
        setUnreadCount(data);
      } else if (error) {
        console.error('Error fetching unread message count:', error);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages and message status changes
    const channel = supabase
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
          console.log('New message received:', payload);
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
          console.log('Message updated:', payload);
          fetchUnreadCount();
        }
      )
      .subscribe();

    console.log('Subscribed to message changes for user:', userId);

    return () => {
      console.log('Cleaning up message subscription');
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return unreadCount;
};
