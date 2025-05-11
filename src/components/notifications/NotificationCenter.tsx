import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchNotifications, markAsRead, markAllAsRead, Notification } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const NotificationItem: React.FC<{
  notification: Notification;
  onRead: (id: string) => void;
}> = ({ notification, onRead }) => {
  const handleClick = () => {
    onRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div
      className={`p-3 border-b last:border-0 cursor-pointer hover:bg-muted transition-colors ${
        notification.read ? "opacity-60" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <h4 className="font-medium">{notification.title}</h4>
        <div
          className={`h-2 w-2 rounded-full ${
            !notification.read ? "bg-skill-purple" : "bg-transparent"
          }`}
        />
      </div>
      {notification.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {notification.description}
        </p>
      )}
      <div className="text-xs text-muted-foreground mt-2">
        {new Date(notification.createdAt).toLocaleString()}
      </div>
    </div>
  );
};

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, isLoggedIn]);

  const handleReadNotification = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast({
        title: "Notifications marked as read",
        description: "All notifications have been marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-skill-purple text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs h-8"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">Loading notifications...</div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleReadNotification}
              />
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
