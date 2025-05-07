
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  const fetchNotifications = async () => {
    if (!userId) {
      console.log('[useNotifications] No userId provided, skipping fetch');
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      console.log('[useNotifications] Fetching notifications for user:', userId);
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useNotifications] Error fetching notifications:', error);
        return;
      }

      console.log('[useNotifications] Notifications fetched:', data?.length || 0, 'notifications');
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('[useNotifications] Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);
        
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (error) {
        console.error('Error marking all notifications as read:', error);
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
      console.error('Error in markAllAsRead:', error);
    }
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    try {
      if (!userId) {
        console.log('[useNotifications] Cannot create notification, no userId');
        return null;
      }
      
      console.log('[useNotifications] Creating notification:', notification);
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type: notification.type,
          title: notification.title,
          description: notification.description || '',
          action_url: notification.actionUrl,
          read: false
        }])
        .select()
        .single();

      if (error) {
        console.error('[useNotifications] Error creating notification:', error);
        return null;
      }

      console.log('[useNotifications] Notification created successfully:', data);
      // No need to update local state as the subscription will handle it
      return data;
    } catch (error) {
      console.error('[useNotifications] Error in createNotification:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!userId) {
      console.log('[useNotifications] No userId in effect, skipping subscription');
      return;
    }
    
    console.log('[useNotifications] Setting up subscription for user:', userId);
    fetchNotifications();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log('[useNotifications] Received realtime notification update:', payload);
          fetchNotifications();
        }
      )
      .subscribe((status) => {
        console.log('[useNotifications] Subscription status:', status);
      });

    return () => {
      console.log('[useNotifications] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
  };
};
