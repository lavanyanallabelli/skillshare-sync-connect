
// Connection service
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Connection {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  requesterId: string;
  recipientId: string;
  requesterName?: string;
  recipientName?: string;
  requesterAvatar?: string;
  recipientAvatar?: string;
  createdAt: string;
}

export const connectionService = {
  async sendConnectionRequest(requesterId: string, recipientId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc(
        'handle_connection_request',
        {
          p_requester_id: requesterId,
          p_recipient_id: recipientId
        }
      );
      
      if (error) {
        console.error("Connection request error details:", error);
        
        // Check if it's a duplicate connection error
        if (error.code === '23505' && error.message.includes('connections_requester_id_recipient_id_key')) {
          toast({
            title: "Connection Request Pending",
            description: "You've already sent a request to this user.",
            variant: "warning"
          });
          return false;
        }
        
        throw error;
      }
      
      // Create notification for the recipient
      const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', requesterId)
        .single();
        
      if (requesterProfile) {
        const requesterName = `${requesterProfile.first_name} ${requesterProfile.last_name}`;
        
        await supabase.from('notifications').insert([{
          user_id: recipientId,
          type: 'connection_request',
          title: 'New Connection Request',
          description: `${requesterName} wants to connect with you.`,
          action_url: `/profile?tab=connections`,
          read: false
        }]);
      }
      
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully."
      });
      
      return true;
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  },
  
  async getConnections(userId: string): Promise<Connection[]> {
    try {
      // Get accepted connections
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(first_name, last_name, avatar_url),
          recipient:profiles!connections_recipient_id_fkey(first_name, last_name, avatar_url)
        `)
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return (data || []).map(conn => ({
        id: conn.id,
        status: conn.status,
        requesterId: conn.requester_id,
        recipientId: conn.recipient_id,
        requesterName: conn.requester ? `${conn.requester.first_name} ${conn.requester.last_name}` : 'Unknown',
        recipientName: conn.recipient ? `${conn.recipient.first_name} ${conn.recipient.last_name}` : 'Unknown',
        requesterAvatar: conn.requester ? conn.requester.avatar_url : undefined,
        recipientAvatar: conn.recipient ? conn.recipient.avatar_url : undefined,
        createdAt: conn.created_at
      }));
    } catch (error) {
      console.error('Error getting connections:', error);
      return [];
    }
  },
  
  async getPendingRequests(userId: string): Promise<Connection[]> {
    try {
      // Get pending connection requests where user is recipient
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(first_name, last_name, avatar_url)
        `)
        .eq('recipient_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return (data || []).map(conn => ({
        id: conn.id,
        status: conn.status,
        requesterId: conn.requester_id,
        recipientId: conn.recipient_id,
        requesterName: conn.requester ? `${conn.requester.first_name} ${conn.requester.last_name}` : 'Unknown',
        requesterAvatar: conn.requester ? conn.requester.avatar_url : undefined,
        createdAt: conn.created_at
      }));
    } catch (error) {
      console.error('Error getting pending requests:', error);
      return [];
    }
  },
  
  async respondToRequest(connectionId: string, accept: boolean): Promise<boolean> {
    try {
      // Get connection details for notification
      const { data: connData, error: connError } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(first_name, last_name),
          recipient:profiles!connections_recipient_id_fkey(first_name, last_name)
        `)
        .eq('id', connectionId)
        .single();
        
      if (connError || !connData) throw connError;
      
      // Update connection status
      const { error } = await supabase
        .from('connections')
        .update({ 
          status: accept ? 'accepted' : 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);
        
      if (error) throw error;
      
      // Create notification for the requester
      const requesterName = connData.requester ? `${connData.requester.first_name} ${connData.requester.last_name}` : 'Someone';
      const recipientName = connData.recipient ? `${connData.recipient.first_name} ${connData.recipient.last_name}` : 'Someone';
      
      await supabase.from('notifications').insert([{
        user_id: connData.requester_id,
        type: accept ? 'connection_accepted' : 'connection_declined',
        title: accept ? 'Connection Accepted' : 'Connection Declined',
        description: accept 
          ? `${recipientName} has accepted your connection request.` 
          : `${recipientName} has declined your connection request.`,
        action_url: accept ? `/profile?tab=connections` : null,
        read: false
      }]);
      
      toast({
        title: accept ? "Connection Accepted" : "Connection Declined",
        description: accept 
          ? `You are now connected with ${requesterName}.` 
          : `You have declined the connection request from ${requesterName}.`
      });
      
      return true;
    } catch (error) {
      console.error('Error responding to connection request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to connection request. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  },
  
  async removeConnection(connectionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);
        
      if (error) throw error;
      
      toast({
        title: "Connection Removed",
        description: "The connection has been removed."
      });
      
      return true;
    } catch (error) {
      console.error('Error removing connection:', error);
      toast({
        title: "Error",
        description: "Failed to remove connection. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }
};
