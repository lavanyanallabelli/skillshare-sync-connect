
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Notifications = () => {
  const { userId } = useAuth();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    unreadCount,
  } = useNotifications(userId);

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : activeFilter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === activeFilter);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <Badge className="bg-blue-100 text-blue-800">Connection</Badge>;
      case 'session':
        return <Badge className="bg-green-100 text-green-800">Session</Badge>;
      case 'message':
        return <Badge className="bg-purple-100 text-purple-800">Message</Badge>;
      default:
        return <Badge>Notification</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Bell className="mr-2" /> Notifications
            </h1>
            <p className="text-muted-foreground mt-2">
              Stay updated on connection requests, session bookings, and more
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark all as read
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all" onClick={() => setActiveFilter('all')}>
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" onClick={() => setActiveFilter('unread')}>
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
                <TabsTrigger value="connection" onClick={() => setActiveFilter('connection')}>
                  Connections
                </TabsTrigger>
                <TabsTrigger value="session" onClick={() => setActiveFilter('session')}>
                  Sessions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="pt-2">
                {loading ? (
                  <div className="text-center py-8">Loading notifications...</div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="mx-auto h-12 w-12 mb-4 opacity-20" />
                    <p>No notifications to display</p>
                    <p className="text-sm mt-2">When you get new notifications, they'll appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg relative ${
                          !notification.read ? 'bg-muted/20' : ''
                        }`}
                        onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {getNotificationIcon(notification.type)}
                              <span className="font-semibold">{notification.title}</span>
                            </div>
                            {notification.description && (
                              <p className="text-muted-foreground">{notification.description}</p>
                            )}
                            {notification.action_url && (
                              <Link
                                to={notification.action_url}
                                className="text-skill-purple hover:underline text-sm mt-2 inline-block"
                              >
                                View details
                              </Link>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleDateString()} at {' '}
                            {new Date(notification.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {!notification.read && (
                          <div className="absolute top-4 right-4 h-2 w-2 bg-skill-purple rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unread" className="pt-2">
                {/* Content will be filtered by the activeFilter state */}
              </TabsContent>

              <TabsContent value="connection" className="pt-2">
                {/* Content will be filtered by the activeFilter state */}
              </TabsContent>

              <TabsContent value="session" className="pt-2">
                {/* Content will be filtered by the activeFilter state */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Notifications;
