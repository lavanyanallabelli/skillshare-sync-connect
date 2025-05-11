
import { Bell, Calendar, MessageSquare, UserPlus, AlertCircle } from "lucide-react";

// Function to determine which icon to show for a given notification type
export const getNotificationIconType = (type: string) => {
  switch (type) {
    case 'message':
      return MessageSquare;
    case 'connection':
      return UserPlus;
    case 'session':
      return Calendar;
    case 'system':
      return Bell;
    default:
      return AlertCircle;
  }
};

// Format notification time to relative time
export const formatNotificationTime = (timestamp: string) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
};

// Group notifications by day
export const groupNotificationsByDay = (notifications: any[]) => {
  const groupedNotifications: Record<string, any[]> = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupDate = '';
    if (date.toDateString() === today.toDateString()) {
      groupDate = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupDate = 'Yesterday';
    } else {
      groupDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    if (!groupedNotifications[groupDate]) {
      groupedNotifications[groupDate] = [];
    }
    
    groupedNotifications[groupDate].push(notification);
  });
  
  return groupedNotifications;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (notifications: any[], updateFunction: (id: string) => Promise<void>) => {
  try {
    const unreadNotifications = notifications.filter(notification => !notification.read);
    
    const updatePromises = unreadNotifications.map(notification => 
      updateFunction(notification.id)
    );
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};
