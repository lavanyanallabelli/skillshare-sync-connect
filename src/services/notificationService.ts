
// Notification service
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/models/Notification';
import { toast } from '@/hooks/use-toast';

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },
  
  async createNotification(userId: string, notification: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type: notification.type,
          title: notification.title,
          description: notification.description || '',
          action_url: notification.actionUrl,
          read: false
        }]);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  },
  
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },
  
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
};
