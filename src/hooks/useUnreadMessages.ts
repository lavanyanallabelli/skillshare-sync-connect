
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { APIClient } from '@/api/client';

export function useUnreadMessages(userId: string | null) {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const { data } = await supabase.rpc('get_unread_message_count', {
          user_id: userId
        });
        setUnreadCount(data || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Set up realtime subscription for new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return unreadCount;
}
