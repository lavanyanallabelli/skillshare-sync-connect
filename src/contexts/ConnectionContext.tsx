
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { supabase, createNotification } from "@/integrations/supabase/client";

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

interface ConnectionContextType {
  connections: Connection[];
  pendingRequests: Connection[];
  isLoading: boolean;
  isProcessing: boolean;
  connectionToRemove: Connection | null;
  isRemoveDialogOpen: boolean;
  setIsRemoveDialogOpen: (isOpen: boolean) => void;
  setConnectionToRemove: (connection: Connection | null) => void;
  handleAcceptRequest: (connectionId: string) => Promise<void>;
  handleRejectRequest: (connectionId: string) => Promise<void>;
  handleCancelRequest: (connectionId: string) => Promise<void>;
  handleRemoveConnection: () => Promise<void>;
  sendConnectionRequest: (recipientId: string) => Promise<void>;
  forceUpdate: number;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionToRemove, setConnectionToRemove] = useState<Connection | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const fetchConnections = useCallback(async () => {
    if (!userId) return;
    
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
        console.error("[ConnectionContext] Error fetching outgoing connections:", outgoingError);
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
        console.error("[ConnectionContext] Error fetching incoming connections:", incomingError);
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
      
      console.log("[ConnectionContext] Fetched connections:", { 
        accepted: accepted.length, 
        pending: pending.length,
        outgoing: formattedOutgoing.length,
        incoming: formattedIncoming.length
      });
      
      setConnections(accepted);
      setPendingRequests(pending);
    } catch (error) {
      console.error("[ConnectionContext] Error fetching connections:", error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    if (!userId) return;
    
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
        console.log("[ConnectionContext] Connection change detected:", payload);
        console.log("[ConnectionContext] Connection event type:", payload.eventType);
        fetchConnections(); // Refetch connections when changes occur
        setForceUpdate(prev => prev + 1);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(connectionsChannel);
    };
  }, [userId, fetchConnections]);

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      const requestToAccept = pendingRequests.find(req => req.id === connectionId);
      if (!requestToAccept) return;

      console.log("[ConnectionContext] Accepting connection:", connectionId);
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);
        
      if (error) {
        console.error("[ConnectionContext] Error accepting connection:", error);
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
      console.error("[ConnectionContext] Error accepting connection:", error);
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      setIsProcessing(true);
      const requestToReject = pendingRequests.find(req => req.id === connectionId);
      if (!requestToReject) {
        setIsProcessing(false);
        return;
      }

      console.log("[ConnectionContext] Rejecting connection:", connectionId);
      
      // First deletion attempt
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);
        
      if (error) {
        console.error("[ConnectionContext] Error in first delete attempt:", error);
        throw error;
      }
      
      // Update UI optimistically
      setPendingRequests(prev => prev.filter(req => req.id !== connectionId));
      
      // Double-check deletion success
      const { data: checkData } = await supabase
        .from('connections')
        .select('id')
        .eq('id', connectionId);
      
      if (checkData && checkData.length > 0) {
        console.error("[ConnectionContext] Connection still exists after deletion attempt:", connectionId);
        
        // Second deletion attempt
        await supabase
          .from('connections')
          .delete()
          .eq('id', connectionId);
          
        // Final verification
        const { data: finalCheck } = await supabase
          .from('connections')
          .select('id')
          .eq('id', connectionId);
          
        if (finalCheck && finalCheck.length > 0) {
          console.error("[ConnectionContext] Connection still exists after second deletion attempt");
          throw new Error("Failed to delete connection after multiple attempts");
        }
      }
      
      // Create notification for the connection requester
      if (requestToReject.requester_id) {
        await createNotification(
          requestToReject.requester_id,
          'connection',
          'Connection Request Rejected',
          `Your connection request was not accepted.`,
          `/teacher/${userId}`
        );
      }
      
      toast({
        title: "Request Rejected",
        description: "Connection request has been rejected",
      });
      
    } catch (error) {
      console.error("[ConnectionContext] Error rejecting connection:", error);
      toast({
        title: "Error",
        description: "Failed to reject connection request. Please try again.",
        variant: "destructive",
      });
      // Refresh connections to ensure UI is in sync with database
      fetchConnections();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRequest = async (connectionId: string) => {
    try {
      setIsProcessing(true);
      const requestToCancel = pendingRequests.find(req => req.id === connectionId);
      if (!requestToCancel) {
        console.error("[ConnectionContext] Request to cancel not found:", connectionId);
        setIsProcessing(false);
        return;
      }

      console.log("[ConnectionContext] Cancelling connection request:", connectionId);
      
      // First deletion attempt
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);
        
      if (error) {
        console.error("[ConnectionContext] Error in first delete attempt:", error);
        throw error;
      }
      
      // Update UI optimistically
      setPendingRequests(prev => prev.filter(req => req.id !== connectionId));
      
      // Double-check deletion success
      const { data: checkData } = await supabase
        .from('connections')
        .select('id')
        .eq('id', connectionId);
      
      if (checkData && checkData.length > 0) {
        console.error("[ConnectionContext] Connection still exists after deletion attempt:", connectionId);
        
        // Second deletion attempt
        await supabase
          .from('connections')
          .delete()
          .eq('id', connectionId);
          
        // Final verification
        const { data: finalCheck } = await supabase
          .from('connections')
          .select('id')
          .eq('id', connectionId);
          
        if (finalCheck && finalCheck.length > 0) {
          console.error("[ConnectionContext] Connection still exists after second deletion attempt");
          throw new Error("Failed to delete connection after multiple attempts");
        }
      }
      
      // Create notification
      if (requestToCancel.recipient_id) {
        await createNotification(
          requestToCancel.recipient_id,
          'connection',
          'Connection Request Cancelled',
          'A connection request to you has been cancelled.',
          '/profile?tab=requests'
        );
      }
      
      toast({
        title: "Request Cancelled",
        description: "Your connection request has been cancelled",
      });
    } catch (error) {
      console.error("[ConnectionContext] Error cancelling connection:", error);
      toast({
        title: "Error",
        description: "Failed to cancel connection request. Please try again.",
        variant: "destructive",
      });
      // Refresh connections to ensure UI is in sync with database
      fetchConnections();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!connectionToRemove) return;
    
    setIsProcessing(true);
    
    try {
      console.log("[ConnectionContext] Removing connection:", connectionToRemove.id);
      
      // First deletion attempt
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionToRemove.id);
        
      if (error) {
        console.error("[ConnectionContext] Error in first delete attempt:", error);
        throw error;
      }
      
      // Update UI optimistically
      setConnections(prev => prev.filter(conn => conn.id !== connectionToRemove.id));
      
      // Double-check deletion success
      const { data: checkData } = await supabase
        .from('connections')
        .select('id')
        .eq('id', connectionToRemove.id);
      
      if (checkData && checkData.length > 0) {
        console.error("[ConnectionContext] Connection still exists after deletion attempt:", connectionToRemove.id);
        
        // Second deletion attempt
        await supabase
          .from('connections')
          .delete()
          .eq('id', connectionToRemove.id);
          
        // Final verification
        const { data: finalCheck } = await supabase
          .from('connections')
          .select('id')
          .eq('id', connectionToRemove.id);
          
        if (finalCheck && finalCheck.length > 0) {
          console.error("[ConnectionContext] Connection still exists after second deletion attempt");
          throw new Error("Failed to delete connection after multiple attempts");
        }
      }
      
      // Create notification for the other user
      const otherUserId = connectionToRemove.isOutgoing 
        ? connectionToRemove.recipient_id 
        : connectionToRemove.requester_id;
        
      if (otherUserId) {
        await createNotification(
          otherUserId,
          'connection',
          'Connection Removed',
          `A connection has been removed from your network.`,
          '/profile'
        );
      }
      
      toast({
        title: "Connection Removed",
        description: "The connection has been removed from your network",
      });
      
      setConnectionToRemove(null);
      setIsRemoveDialogOpen(false);
    } catch (error) {
      console.error("[ConnectionContext] Error removing connection:", error);
      toast({
        title: "Error",
        description: "Failed to remove connection. Please try again.",
        variant: "destructive",
      });
      // Refresh connections to ensure UI is in sync with database
      fetchConnections();
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to send a connection request with notification
  const sendConnectionRequest = async (recipientId: string) => {
    try {
      // First check if a connection already exists
      const { data: existingConnection, error: checkError } = await supabase
        .from('connections')
        .select('id, status')
        .or(`and(requester_id.eq.${userId},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${userId})`)
        .maybeSingle();
      
      if (checkError && !checkError.message.includes('No rows found')) {
        throw checkError;
      }
      
      if (existingConnection) {
        const status = existingConnection.status === 'pending' ? 'pending' : 'already connected';
        toast({
          title: "Connection Exists",
          description: `You ${status === 'pending' ? 'already have a pending request' : 'are already connected'} with this user`,
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

  const value = {
    connections,
    pendingRequests,
    isLoading,
    isProcessing,
    connectionToRemove,
    isRemoveDialogOpen,
    setIsRemoveDialogOpen,
    setConnectionToRemove,
    handleAcceptRequest,
    handleRejectRequest,
    handleCancelRequest,
    handleRemoveConnection,
    sendConnectionRequest,
    forceUpdate
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnections = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnections must be used within a ConnectionProvider");
  }
  return context;
};

export default ConnectionContext;
