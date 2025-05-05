
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { useUnreadMessages } from "@/hooks/use-unread-messages";

interface UserMenuProps {
  handleLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ handleLogout }) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const messageUnreadCount = useUnreadMessages(userId || undefined);
  const { 
    notifications, 
    unreadCount: notificationUnreadCount, 
    markAsRead, 
    markAllAsRead,
    fetchNotifications 
  } = useNotifications(userId);
  
  // Force refresh notifications when mounted
  useEffect(() => {
    if (userId) {
      console.log("[UserMenu] Component mounted, refreshing notifications");
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);
  
  const handleNotificationClick = async (notification: any) => {
    try {
      console.log("[UserMenu] Notification clicked:", notification.id);
      await markAsRead(notification.id);
      
      // Navigate to action URL if present
      if (notification.action_url) {
        window.location.href = notification.action_url;
      }
    } catch (error) {
      console.error("[UserMenu] Error handling notification click:", error);
    }
  };

  // Handle notification item icons based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <MessageSquare size={14} />;
      case 'message':
        return <MessageSquare size={14} />;
      case 'session':
        return <Bell size={14} />;
      default:
        return <Bell size={14} />;
    }
  };
  
  // Handle notification background color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'connection':
        return 'bg-blue-100 text-blue-600';
      case 'message':
        return 'bg-purple-100 text-purple-600';
      case 'session':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link to="/messages">
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare size={20} />
          {messageUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-skill-purple text-[10px] text-white flex items-center justify-center">
              {messageUnreadCount}
            </span>
          )}
        </Button>
      </Link>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            {notificationUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-skill-purple text-[10px] text-white flex items-center justify-center">
                {notificationUnreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h4 className="font-medium">Notifications</h4>
            {notificationUnreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          <div className="max-h-80 overflow-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-muted/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-skill-purple"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt="User avatar" />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/skills">My Skills</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
