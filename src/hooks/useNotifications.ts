import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: string;
  title: string;
  description?: string;
  action_url?: string;  // This field name must match the database column name
  icon_type?: string;
  read: boolean;
  created_at: string;
}

export const useNotifications = (userId: string | null) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    console.log('[Notifications] fetchNotifications called for user:', userId);

    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("[Notifications] fetchNotifications called for user:", userId);
      console.log("Fetching notifications for user:", userId);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Error fetching notifications',
          description: error.message,
          variant: 'destructive'
        });
        console.error('Error fetching notifications:', error);
        return;
      }

      console.log("[Notifications] Notifications fetched:", data?.length || 0, data);
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
    if (!userId) return;
    
    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);
        
      if (unreadIds.length === 0) return;

      console.log("Marking all notifications as read:", unreadIds.length);
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
    console.log('[Notifications] createNotification called:', notification, 'userId:', userId);

    try {
      if (!userId) return null;
      
      console.log('[Notifications] Creating notification:', { ...notification, user_id: userId });
      console.log('[Notifications] Notification data:', notification);
      
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type: notification.type,
          title: notification.title,
          description: notification.description || '',
          action_url: notification.action_url,  // Make sure this matches the DB column
          icon_type: notification.icon_type || '',
          read: false
        }])
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error creating notification',
          description: error.message,
          variant: 'destructive'
        });
        console.error('[Notifications] Error creating notification:', error);
        return null;
      }

      console.log('[Notifications] Notification created successfully:', data);
      // No need to update local state as the subscription will handle it
      return data;
    } catch (error) {
      toast({
      title: 'Error in createNotification',
      description: error instanceof Error ? error.message : String(error),
      variant: 'destructive'
    });
    console.error('[Notifications] Error in createNotification:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!userId) return;
    
    fetchNotifications();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log("Notification change detected:", payload);
          fetchNotifications();
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

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
