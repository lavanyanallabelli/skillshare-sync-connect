
import React, { useState, useEffect } from "react";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, UserX, UserPlus, Clock, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { createConnectionNotification } from "@/utils/notificationUtils";

type Connection = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    occupation: string | null;
  };
  isOutgoing: boolean;
};

const ConnectionList: React.FC = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const fetchConnections = async () => {
      setIsLoading(true);
      try {
        // Fetch connections where the user is the requester
        const { data: outgoingConnections, error: outgoingError } = await supabase
          .from('connections')
          .select(`
            id,
            requester_id,
            recipient_id,
            status,
            created_at,
            profile:profiles!connections_recipient_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url,
              occupation
            )
          `)
          .eq('requester_id', userId);
          
        if (outgoingError) throw outgoingError;
        
        // Add an isOutgoing flag to indicate these are connections the user initiated
        const formattedOutgoing = outgoingConnections.map(conn => ({
          ...conn,
          isOutgoing: true
        }));
        
        // Fetch connections where the user is the recipient
        const { data: incomingConnections, error: incomingError } = await supabase
          .from('connections')
          .select(`
            id,
            requester_id,
            recipient_id,
            status,
            created_at,
            profile:profiles!connections_requester_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url,
              occupation
            )
          `)
          .eq('recipient_id', userId);
          
        if (incomingError) throw incomingError;
        
        // Add an isOutgoing flag to indicate these are connections others initiated
        const formattedIncoming = incomingConnections.map(conn => ({
          ...conn,
          isOutgoing: false
        }));
        
        // Combine both sets of connections
        const allConnections = [...formattedOutgoing, ...formattedIncoming];
        
        // Separate pending requests from accepted connections and filter out declined ones
        const pending = allConnections.filter(conn => conn.status === 'pending');
        const accepted = allConnections.filter(conn => conn.status === 'accepted');
        
        // Do not include declined connections in either list - this allows users to send a new connection request
        
        setConnections(accepted);
        setPendingRequests(pending);
      } catch (error) {
        console.error("Error fetching connections:", error);
        toast({
          title: "Error",
          description: "Failed to load connections",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConnections();
  }, [userId, toast]);

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      // First get the connection details to access the requester information
      const { data: connection, error: fetchError } = await supabase
        .from('connections')
        .select(`
          requester_id,
          recipient_id,
          profile:profiles!connections_requester_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('id', connectionId)
        .single();
        
      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);
        
      if (error) throw error;
      
      // Update UI
      const updatedRequest = pendingRequests.find(req => req.id === connectionId);
      if (updatedRequest) {
        setPendingRequests(pendingRequests.filter(req => req.id !== connectionId));
        setConnections([...connections, { ...updatedRequest, status: 'accepted' }]);
      }
      
      toast({
        title: "Connection Accepted",
        description: "You are now connected with this user",
      });

      // Create a notification for the requester that their connection was accepted
      if (connection) {
        // Get current user's name for the notification
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', userId)
          .single();

        const currentUserName = currentUserProfile ? 
          `${currentUserProfile.first_name} ${currentUserProfile.last_name}` : 
          "Someone";
        
        console.log('[ConnectionList] Creating accept notification:', {
          requester_id: connection.requester_id,
          recipient_id: connection.recipient_id,
          requesterName: connection.profile?.first_name + " " + connection.profile?.last_name,
          currentUserName
        });
        
        // Fix: Updated to match the new function signature
        await createConnectionNotification(
          connection.requester_id,
          'accept',
          `${currentUserName} accepted your connection request.`,
          "connection"
        );
      }
      
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      // First get the connection details to access the requester information
      const { data: connection, error: fetchError } = await supabase
        .from('connections')
        .select(`
          requester_id,
          recipient_id,
          profile:profiles!connections_requester_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('id', connectionId)
        .single();
        
      if (fetchError) throw fetchError;

      // Update the status to 'declined' instead of deleting
      const { error } = await supabase
        .from('connections')
        .update({ status: 'declined' })
        .eq('id', connectionId);
        
      if (error) throw error;
      
      // Update UI - remove from pending requests
      setPendingRequests(pendingRequests.filter(req => req.id !== connectionId));
      
      toast({
        title: "Request Declined",
        description: "Connection request has been declined",
      });

      // Create a notification for the requester that their connection was declined
      if (connection) {
        // Get current user's name for the notification
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', userId)
          .single();

        const currentUserName = currentUserProfile ? 
          `${currentUserProfile.first_name} ${currentUserProfile.last_name}` : 
          "Someone";
        
        console.log('[ConnectionList] Creating decline notification for:', {
          requester_id: connection.requester_id,
          recipient_id: connection.recipient_id
        });
        
        await createConnectionNotification(
          connection.requester_id,
          'decline',
          `${currentUserName} declined your connection request.`,
          "connection"
        );
      }
    } catch (error) {
      console.error("Error rejecting connection:", error);
      toast({
        title: "Error",
        description: "Failed to decline connection request",
        variant: "destructive",
      });
    }
  };

  const handleCancelRequest = async (connectionId: string) => {
    try {
      // Just delete outgoing connection requests that are being cancelled by the requester
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);
        
      if (error) throw error;
      
      // Update UI
      setPendingRequests(pendingRequests.filter(req => req.id !== connectionId));
      
      toast({
        title: "Request Cancelled",
        description: "Your connection request has been cancelled",
      });
    } catch (error) {
      console.error("Error cancelling connection:", error);
      toast({
        title: "Error",
        description: "Failed to cancel connection request",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connections">
          <TabsList className="mb-4">
            <TabsTrigger value="connections">
              Connections ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({pendingRequests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="connections">
            {isLoading ? (
              <div className="text-center py-4">Loading connections...</div>
            ) : connections.length > 0 ? (
              <div className="space-y-4">
                {connections.map(connection => (
                  <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={connection.profile?.avatar_url || "/placeholder.svg"} 
                          alt={`${connection.profile?.first_name} ${connection.profile?.last_name}`}
                        />
                        <AvatarFallback>
                          {connection.profile?.first_name?.[0]}{connection.profile?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link 
                          to={`/teacher/${connection.profile?.id}`}
                          className="font-medium hover:underline flex items-center gap-1"
                        >
                          {connection.profile?.first_name} {connection.profile?.last_name}
                          <LinkIcon size={12} />
                        </Link>
                        {connection.profile?.occupation && (
                          <p className="text-sm text-muted-foreground">{connection.profile.occupation}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" className="flex items-center gap-1">
                        <UserCheck size={14} /> Connected
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No connections yet</p>
                <p className="text-sm mt-2">Connect with other users to grow your network</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="requests">
            {isLoading ? (
              <div className="text-center py-4">Loading requests...</div>
            ) : pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={request.profile?.avatar_url || "/placeholder.svg"} 
                          alt={`${request.profile?.first_name} ${request.profile?.last_name}`}
                        />
                        <AvatarFallback>
                          {request.profile?.first_name?.[0]}{request.profile?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link 
                          to={`/teacher/${request.profile?.id}`}
                          className="font-medium hover:underline flex items-center gap-1"
                        >
                          {request.profile?.first_name} {request.profile?.last_name}
                          <LinkIcon size={12} />
                        </Link>
                        {request.profile?.occupation && (
                          <p className="text-sm text-muted-foreground">{request.profile.occupation}</p>
                        )}
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={12} />
                          {request.isOutgoing ? 'Request sent' : 'Wants to connect with you'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {request.isOutgoing ? (
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleCancelRequest(request.id)}
                        >
                          <UserX size={14} className="mr-1" /> Cancel
                        </Button>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-skill-purple" 
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            <UserCheck size={14} className="mr-1" /> Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            <UserX size={14} className="mr-1" /> Decline
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No pending requests</p>
                <p className="text-sm mt-2">When someone wants to connect with you, it will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default React.memo(ConnectionList);
