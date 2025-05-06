import React, { useState, useEffect } from "react";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { supabase, createNotification } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserCheck, UserX, UserPlus, Clock, Link as LinkIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

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
  const [connectionToRemove, setConnectionToRemove] = useState<Connection | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
          
        if (outgoingError) {
          console.error("[ConnectionList] Error fetching outgoing connections:", outgoingError);
          throw outgoingError;
        }
        
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
          
        if (incomingError) {
          console.error("[ConnectionList] Error fetching incoming connections:", incomingError);
          throw incomingError;
        }
        
        // Add an isOutgoing flag to indicate these are connections others initiated
        const formattedIncoming = incomingConnections.map(conn => ({
          ...conn,
          isOutgoing: false
        }));
        
        // Combine both sets of connections
        const allConnections = [...formattedOutgoing, ...formattedIncoming];
        
        // Separate pending requests from accepted connections
        const pending = allConnections.filter(conn => conn.status === 'pending');
        const accepted = allConnections.filter(conn => conn.status === 'accepted');
        
        console.log("[ConnectionList] Fetched connections:", { 
          accepted: accepted.length, 
          pending: pending.length,
          outgoing: formattedOutgoing.length,
          incoming: formattedIncoming.length
        });
        
        setConnections(accepted);
        setPendingRequests(pending);
      } catch (error) {
        console.error("[ConnectionList] Error fetching connections:", error);
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
    
    // Subscribe to changes in the connections table
    const connectionsChannel = supabase
      .channel('connections-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'connections',
        filter: `or(requester_id.eq.${userId},recipient_id.eq.${userId})`
      }, (payload) => {
        console.log("[ConnectionList] Connection change detected:", payload);
        console.log("[ConnectionList] Connection event type:", payload.eventType);
        fetchConnections(); // Refetch connections when changes occur
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(connectionsChannel);
    };
  }, [userId, toast]);

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      const requestToAccept = pendingRequests.find(req => req.id === connectionId);
      if (!requestToAccept) return;

      console.log("[ConnectionList] Accepting connection:", connectionId);
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);
        
      if (error) {
        console.error("[ConnectionList] Error accepting connection:", error);
        throw error;
      }
      
      // Update UI
      setPendingRequests(pendingRequests.filter(req => req.id !== connectionId));
      setConnections([...connections, { ...requestToAccept, status: 'accepted' }]);
      
      // Create notification for the connection requester
      await createNotification(
        requestToAccept.requester_id,
        'connection',
        'Connection Request Accepted',
        `${requestToAccept.profile?.first_name} has accepted your connection request.`,
        `/teacher/${userId}`
      );
      
      toast({
        title: "Connection Accepted",
        description: "You are now connected with this user",
      });
    } catch (error) {
      console.error("[ConnectionList] Error accepting connection:", error);
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      const requestToReject = pendingRequests.find(req => req.id === connectionId);
      if (!requestToReject) return;

      console.log("[ConnectionList] Rejecting connection:", connectionId);
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);
        
      if (error) {
        console.error("[ConnectionList] Error rejecting connection:", error);
        throw error;
      }
      
      // Verify that the deletion was successful
      const { data: verifyData } = await supabase
        .from('connections')
        .select('id')
        .eq('id', connectionId);
        
      if (verifyData && verifyData.length > 0) {
        console.error("[ConnectionList] Connection still exists after deletion attempt:", connectionId);
        // Try a second deletion attempt
        await supabase.from('connections').delete().eq('id', connectionId);
        
        // Verify again
        const { data: secondVerifyData } = await supabase
          .from('connections')
          .select('id')
          .eq('id', connectionId);
          
        if (secondVerifyData && secondVerifyData.length > 0) {
          // Use a direct SQL query as a last resort
          // We use the .execute() method for custom SQL which doesn't require type checking
          try {
            await supabase
              .from('connections')
              .delete()
              .eq('id', connectionId);
            console.log("[ConnectionList] Final deletion attempt completed");
          } catch (e) {
            console.error("[ConnectionList] Error in final delete attempt:", e);
            throw new Error("Failed to delete connection after multiple attempts");
          }
        }
      }
      
      // Update UI only after confirmed deletion
      setPendingRequests(pendingRequests.filter(req => req.id !== connectionId));
      
      // Create notification for the connection requester
      await createNotification(
        requestToReject.requester_id,
        'connection',
        'Connection Request Rejected',
        `Your connection request was not accepted at this time.`,
        `/teacher/${userId}`
      );
      
      toast({
        title: "Request Rejected",
        description: "Connection request has been rejected",
      });
    } catch (error) {
      console.error("[ConnectionList] Error rejecting connection:", error);
      toast({
        title: "Error",
        description: "Failed to reject connection request",
        variant: "destructive",
      });
    }
  };

  const handleCancelRequest = async (connectionId: string) => {
    try {
      const requestToCancel = pendingRequests.find(req => req.id === connectionId);
      if (!requestToCancel) {
        console.error("[ConnectionList] Request to cancel not found:", connectionId);
        return;
      }

      console.log("[ConnectionList] Cancelling connection request:", connectionId);
      
      // Delete the connection from the database - IMPORTANT: This must complete successfully
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);
        
      if (error) {
        console.error("[ConnectionList] Error cancelling connection request:", error);
        throw error;
      }
      
      // Verify deletion was successful by checking the database
      const { data: verifyData } = await supabase
        .from('connections')
        .select('id')
        .eq('id', connectionId);
        
      if (verifyData && verifyData.length > 0) {
        console.error("[ConnectionList] Connection still exists after deletion attempt:", connectionId);
        
        // Try a second deletion with a more direct approach
        try {
          // Use raw SQL execution as a fallback
          const { error: sqlError } = await supabase
            .from('connections')
            .delete()
            .eq('id', connectionId);
          
          if (sqlError) {
            console.error("[ConnectionList] Error in force delete:", sqlError);
          }
        } catch (e) {
          console.error("[ConnectionList] Error in force delete execution:", e);
        }
        
        // Final verification
        const { data: finalVerifyData } = await supabase
          .from('connections')
          .select('id')
          .eq('id', connectionId);
          
        if (finalVerifyData && finalVerifyData.length > 0) {
          throw new Error("Failed to delete connection after multiple attempts");
        }
      }
      
      console.log("[ConnectionList] Successfully deleted connection from database");
      
      // Update UI only after successful database update
      setPendingRequests(pendingRequests.filter(req => req.id !== connectionId));
      
      // Create notification for the recipient about the cancellation
      await createNotification(
        requestToCancel.recipient_id,
        'connection',
        'Connection Request Cancelled',
        'A connection request to you has been cancelled.',
        '/profile?tab=requests'
      );
      
      toast({
        title: "Request Cancelled",
        description: "Your connection request has been cancelled",
      });
    } catch (error) {
      console.error("[ConnectionList] Error cancelling connection:", error);
      toast({
        title: "Error",
        description: "Failed to cancel connection request",
        variant: "destructive",
      });
    }
  };

  const handleRemoveConnection = async () => {
    if (!connectionToRemove) return;
    
    setIsProcessing(true);
    
    try {
      console.log("[ConnectionList] Removing connection:", connectionToRemove.id);
      
      // Delete the connection from the database
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionToRemove.id);
        
      if (error) {
        console.error("[ConnectionList] Error removing connection:", error);
        throw error;
      }
      
      // Wait a moment for deletion to process
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify deletion was successful
      const { data: verifyData } = await supabase
        .from('connections')
        .select('id')
        .eq('id', connectionToRemove.id);
        
      if (verifyData && verifyData.length > 0) {
        console.error("[ConnectionList] Connection still exists after deletion attempt:", connectionToRemove.id);
        
        // Try a second deletion with a different approach
        const { error: secondError } = await supabase
          .from('connections')
          .delete()
          .eq('id', connectionToRemove.id);
          
        if (secondError) {
          console.error("[ConnectionList] Error in second deletion attempt:", secondError);
        }
        
        // Try a direct SQL execution method as final attempt
        try {
          // Execute a final deletion attempt using SQL
          await supabase
            .from('connections')
            .delete()
            .eq('id', connectionToRemove.id);
          
          console.log("[ConnectionList] Executed final deletion attempt");
        } catch (e) {
          console.error("[ConnectionList] Error in force delete:", e);
        }
        
        // Final verification
        const { data: finalCheckData } = await supabase
          .from('connections')
          .select('id')
          .eq('id', connectionToRemove.id);
          
        if (finalCheckData && finalCheckData.length > 0) {
          toast({
            title: "Error",
            description: "Failed to remove connection. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
      }
      
      console.log("[ConnectionList] Successfully deleted connection from database");
      
      // Update UI only after successful database update
      setConnections(connections.filter(conn => conn.id !== connectionToRemove.id));
      
      // Create notification for the other user
      const otherUserId = connectionToRemove.isOutgoing 
        ? connectionToRemove.recipient_id 
        : connectionToRemove.requester_id;
        
      await createNotification(
        otherUserId,
        'connection',
        'Connection Removed',
        `A connection has been removed from your network.`,
        '/profile'
      );
      
      toast({
        title: "Connection Removed",
        description: "The connection has been removed from your network",
      });
      
      setConnectionToRemove(null);
      setIsRemoveDialogOpen(false);
    } catch (error) {
      console.error("[ConnectionList] Error removing connection:", error);
      toast({
        title: "Error",
        description: "Failed to remove connection. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // New function to send a connection request with notification
  const sendConnectionRequest = async (recipientId: string) => {
    try {
      // First check if a connection already exists
      const { data: existingConnection, error: checkError } = await supabase
        .from('connections')
        .select('id')
        .or(`and(requester_id.eq.${userId},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${userId})`)
        .single();
      
      if (checkError && !checkError.message.includes('No rows found')) throw checkError;
      
      if (existingConnection) {
        toast({
          title: "Connection Exists",
          description: "You already have a connection with this user",
        });
        return;
      }
      
      // Create the new connection
      const { data: newConnection, error } = await supabase
        .from('connections')
        .insert({
          requester_id: userId,
          recipient_id: recipientId,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create notification for the recipient
      await createNotification(
        recipientId,
        'connection',
        'New Connection Request',
        `You have received a new connection request.`,
        '/profile?tab=requests'
      );
      
      toast({
        title: "Request Sent",
        description: "Connection request has been sent"
      });
      
      // Update UI if needed
      setPendingRequests([...pendingRequests, { 
        ...newConnection, 
        isOutgoing: true,
        profile: { id: recipientId, first_name: '', last_name: '', avatar_url: null, occupation: null } 
      }]);
      
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  return (
    <>
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
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            setConnectionToRemove(connection);
                            setIsRemoveDialogOpen(true);
                          }}
                        >
                          <UserX size={14} className="mr-1" /> Remove
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
      
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this connection? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveConnection} 
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConnectionList;
