
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/App';
import { Link } from 'react-router-dom';

const NotificationItem = ({ notification, onRead }: { 
  notification: {
    id: string;
    title: string;
    description?: string;
    actionUrl?: string;
    type: string;
    read: boolean;
    created_at: string;
  },
  onRead: (id: string) => void;
}) => {
  const formattedDate = new Date(notification.created_at).toLocaleDateString();
  
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
  };

  return (
    <div 
      className={`p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/20' : ''}`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-sm">{notification.title}</span>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </div>
      {notification.description && (
        <p className="text-sm text-muted-foreground mb-2">{notification.description}</p>
      )}
      {notification.actionUrl && (
        <Link 
          to={notification.actionUrl} 
          className="text-xs text-skill-purple hover:underline"
        >
          View details
        </Link>
      )}
      {!notification.read && (
        <div className="h-2 w-2 rounded-full bg-skill-purple absolute top-3 right-3" />
      )}
    </div>
  );
};

const NotificationCenter = () => {
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications(userId);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  useEffect(() => {
    // This will check if the notification center was opened and closed
    // We don't mark messages as read just on open to allow users to glance at notifications
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-skill-purple" 
              variant="secondary"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[70vh]">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onRead={markAsRead}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No notifications yet</p>
              <p className="text-sm mt-1">When you get notifications, they'll appear here</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
