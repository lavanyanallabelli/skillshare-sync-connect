
import React from 'react';
import { useAuth } from '@/App';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const MobileNotifications = () => {
  const { userId } = useAuth();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    unreadCount 
  } = useNotifications(userId);

  if (!userId) return null;

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-muted/30 p-3">
        <h2 className="font-medium">Notifications {unreadCount > 0 && `(${unreadCount})`}</h2>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground">
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.slice(0, 5).map((notification) => (
            <div 
              key={notification.id} 
              className={`p-3 border-b last:border-b-0 ${!notification.read ? 'bg-muted/20' : ''}`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className="flex justify-between">
                <span className="font-medium">{notification.title}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </div>
              {notification.description && (
                <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
              )}
              {notification.actionUrl && (
                <Link 
                  to={notification.actionUrl}
                  className="block mt-2 text-xs text-skill-purple hover:underline"
                >
                  View details
                </Link>
              )}
            </div>
          ))}
          
          {notifications.length > 5 && (
            <div className="p-3 text-center">
              <Link 
                to="/notifications"
                className="text-sm text-skill-purple hover:underline"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileNotifications;
