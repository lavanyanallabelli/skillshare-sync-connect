
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { APIClient } from "@/api/client";

export const useUnreadMessages = (userId?: string) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await APIClient.get<{ count: number }>(`/messages/unread-count`);
        setUnreadCount(response.count);
      } catch (error) {
        console.error("Error fetching unread message count:", error);
      }
    };

    fetchUnreadCount();

    // Set up subscription for real-time updates
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return unreadCount;
};
