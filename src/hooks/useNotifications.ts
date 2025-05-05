
import { useState, useEffect, useCallback } from 'react';
import { supabase, createNotification } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: string;
  title: string;
  description?: string;
  actionUrl?: string;
  read: boolean;
  created_at: string;
}

export const useNotifications = (userId: string | null) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`[useNotifications] Fetching notifications for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useNotifications] Error fetching notifications:', error);
        return;
      }

      console.log(`[useNotifications] Fetched ${data?.length || 0} notifications`);
      
      setNotifications(data || []);
      const unreadNotifications = data?.filter(n => !n.read).length || 0;
      setUnreadCount(unreadNotifications);
      console.log(`[useNotifications] Unread count: ${unreadNotifications}`);
    } catch (error) {
      console.error('[useNotifications] Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      console.log(`[useNotifications] Marking notification as read: ${notificationId}`);
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('[useNotifications] Error marking notification as read:', error);
        return;
      }

      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      console.log(`[useNotifications] Notification marked as read, new unread count: ${unreadCount - 1}`);
    } catch (error) {
      console.error('[useNotifications] Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);
        
      if (unreadIds.length === 0) return;

      console.log(`[useNotifications] Marking all ${unreadIds.length} notifications as read`);
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (error) {
        console.error('[useNotifications] Error marking all notifications as read:', error);
        return;
      }

      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error('[useNotifications] Error in markAllAsRead:', error);
    }
  };

  // No longer needed - we'll use the centralized createNotification function
  // from supabase/client.ts instead
  const createNewNotification = useCallback(async (
    type: string, 
    title: string, 
    description?: string, 
    actionUrl?: string
  ) => {
    return await createNotification(userId, type, title, description, actionUrl);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    
    console.log(`[useNotifications] Setting up notifications for user: ${userId}`);
    
    fetchNotifications();
    
    // Set up realtime subscription with more comprehensive filters
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('[useNotifications] New notification received:', payload);
          fetchNotifications();
          
          // Show toast for new notification
          if (payload.new && typeof payload.new === 'object') {
            const newNotification = payload.new as Notification;
            toast({
              title: newNotification.title,
              description: newNotification.description || "You have a new notification"
            });
          }
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${userId}` 
        },
        (payload) => {
          console.log('[useNotifications] Notification updated:', payload);
          fetchNotifications();
        }
      )
      .subscribe((status) => {
        console.log(`[useNotifications] Subscription status:`, status);
      });

    return () => {
      console.log('[useNotifications] Cleaning up notifications subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications, toast]);

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification: createNewNotification
  };
};
