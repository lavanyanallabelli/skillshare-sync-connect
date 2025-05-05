
import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  type: "connection" | "session" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

interface UserMenuProps {
  unreadCount: number;
  handleLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ unreadCount, handleLogout }) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  
  useEffect(() => {
    if (!userId) return;
    
    const fetchNotifications = async () => {
      try {
        // Fetch notifications from the notifications table
        const { data: dbNotifications, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (notificationsError) {
          console.error("Error fetching notifications:", notificationsError);
          return;
        }
        
        // Also fetch connection requests for backward compatibility
        const { data: connectionRequests, error: connectionError } = await supabase
          .from('connections')
          .select(`
            id, 
            requester_id, 
            created_at,
            profiles!connections_requester_id_fkey(first_name, last_name)
          `)
          .eq('recipient_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        
        // Fetch session requests for backward compatibility
        const { data: sessionRequests, error: sessionError } = await supabase
          .from('sessions')
          .select(`
            id, 
            student_id, 
            skill, 
            day, 
            time_slot, 
            created_at, 
            profiles!sessions_student_id_fkey(first_name, last_name)
          `)
          .eq('teacher_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        
        if (connectionError) console.error("Error fetching connection requests:", connectionError);
        if (sessionError) console.error("Error fetching session requests:", sessionError);
        
        const combinedNotifications: Notification[] = [];
        
        // Process database notifications
        if (dbNotifications) {
          dbNotifications.forEach(notification => {
            combinedNotifications.push({
              id: notification.id,
              type: notification.type as "connection" | "session" | "system",
              title: notification.title,
              description: notification.description || '',
              time: new Date(notification.created_at).toLocaleDateString(),
              read: notification.read || false,
              actionUrl: notification.action_url
            });
          });
        }
        
        // Process connection requests for backward compatibility
        if (connectionRequests) {
          connectionRequests.forEach(request => {
            const requesterName = request.profiles ? 
              `${request.profiles.first_name} ${request.profiles.last_name}` : 
              "Someone";
              
            combinedNotifications.push({
              id: `connection-${request.id}`,
              type: "connection",
              title: "New Connection Request",
              description: `${requesterName} wants to connect with you`,
              time: new Date(request.created_at).toLocaleDateString(),
              read: false,
              actionUrl: "/profile?tab=connections"
            });
          });
        }
        
        // Process session requests for backward compatibility
        if (sessionRequests) {
          sessionRequests.forEach(request => {
            const studentName = request.profiles ? 
              `${request.profiles.first_name} ${request.profiles.last_name}` : 
              "A student";
              
            combinedNotifications.push({
              id: `session-${request.id}`,
              type: "session",
              title: "New Session Request",
              description: `${studentName} wants to learn ${request.skill} on ${new Date(request.day).toLocaleDateString()} at ${request.time_slot}`,
              time: new Date(request.created_at).toLocaleDateString(),
              read: false,
              actionUrl: "/profile?tab=requests"
            });
          });
        }
        
        setNotifications(combinedNotifications);
        setNotificationCount(combinedNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error("Error fetching all notifications:", error);
      }
    };
    
    fetchNotifications();
    
    // Set up a subscription to refresh notifications
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    
    // Set up realtime subscription for notifications
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, fetchNotifications)
      .subscribe();
      
    // Set up realtime subscription for connection requests
    const connectionsChannel = supabase
      .channel('connections-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'connections',
        filter: `recipient_id=eq.${userId}`
      }, fetchNotifications)
      .subscribe();
      
    // Set up realtime subscription for session requests
    const sessionsChannel = supabase
      .channel('sessions-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sessions',
        filter: `teacher_id=eq.${userId}`
      }, fetchNotifications)
      .subscribe();
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(connectionsChannel);
      supabase.removeChannel(sessionsChannel);
    };
  }, [userId]);
  
  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (notification.id.startsWith('connection-') || notification.id.startsWith('session-')) {
        // For legacy notifications, just update the UI state
        const updatedNotifications = notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        );
        setNotifications(updatedNotifications);
        setNotificationCount(prev => Math.max(0, prev - 1));
      } else {
        // For database notifications, update in the database
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification.id);
          
        if (error) {
          console.error("Error marking notification as read:", error);
          return;
        }
        
        // Update local state
        const updatedNotifications = notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        );
        setNotifications(updatedNotifications);
        setNotificationCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      // Legacy notifications are handled in UI state only
      // Database notifications need to be updated in the database
      const dbNotificationIds = notifications
        .filter(n => !n.read && !n.id.startsWith('connection-') && !n.id.startsWith('session-'))
        .map(n => n.id);
        
      if (dbNotificationIds.length > 0) {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .in('id', dbNotificationIds);
          
        if (error) {
          console.error("Error marking all notifications as read:", error);
          return;
        }
      }
      
      // Update UI for all notifications
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setNotificationCount(0);
      
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link to="/messages">
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-skill-purple text-[10px] text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </Link>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-skill-purple text-[10px] text-white flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h4 className="font-medium">Notifications</h4>
            {notificationCount > 0 && (
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
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
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
