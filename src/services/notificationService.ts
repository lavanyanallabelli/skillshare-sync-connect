import { supabase } from "@/integrations/supabase/client";
import { APIClient } from "@/api/client";

export interface Notification {
  id: string;
  title: string;
  description?: string;
  type: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const notifications = await APIClient.get<Notification[]>('/notifications');
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    await APIClient.put(`/notifications/${notificationId}/read`, {});
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const markAllAsRead = async (): Promise<void> => {
  try {
    await APIClient.put('/notifications/read-all', {});
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};
