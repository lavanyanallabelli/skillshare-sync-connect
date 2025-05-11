
import React from 'react';
import { useAuth } from '@/App';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { getNotificationIconType } from '@/utils/notificationUtils';

const getIconComponent = (iconType: string) => {
  switch (iconType) {
    case 'calendar':
      return <Calendar className="h-4 w-4" />;
    case 'check-circle':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'x-circle':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

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
          {notifications.slice(0, 5).map((notification) => {
            const iconType = notification.icon_type || getNotificationIconType(notification.type);
            const icon = getIconComponent(iconType);
            
            return (
              <div 
                key={notification.id} 
                className={`p-3 border-b last:border-b-0 ${!notification.read ? 'bg-muted/20' : ''}`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    {icon && <span>{icon}</span>}
                    <span className="font-medium">{notification.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
                {notification.description && (
                  <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                )}
                {notification.action_url && (
                  <Link 
                    to={notification.action_url}
                    className="block mt-2 text-xs text-skill-purple hover:underline"
                  >
                    View details
                  </Link>
                )}
              </div>
            );
          })}
          
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
