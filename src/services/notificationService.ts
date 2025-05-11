
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  type: string;
  read: boolean;
  actionUrl?: string;
  created_at: string;
}

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const markAllAsRead = async (userId: string): Promise<void> => {
  try {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};
