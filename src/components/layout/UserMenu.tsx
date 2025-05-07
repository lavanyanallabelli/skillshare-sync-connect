
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
  unreadCount: number;
}

export const UserMenu: React.FC<UserMenuProps> = ({ handleLogout, unreadCount: messageUnreadCount }) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const { 
    notifications, 
    unreadCount: notificationUnreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications(userId);
  
  const handleNotificationClick = async (notification: any) => {
    try {
      await markAsRead(notification.id);
    } catch (error) {
      console.error("Error handling notification click:", error);
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
                    <div className={`rounded-full p-2 ${
                      notification.type === 'connection' ? 'bg-blue-100 text-blue-600' :
                      notification.type === 'session' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {notification.type === 'connection' ? (
                        <MessageSquare size={14} />
                      ) : notification.type === 'session' ? (
                        <Bell size={14} />
                      ) : (
                        <Bell size={14} />
                      )}
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
