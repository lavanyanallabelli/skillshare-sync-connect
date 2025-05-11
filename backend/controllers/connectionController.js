
const { supabase } = require('../config/supabaseClient');

// Get all connections for the current user
const getUserConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get connections where the user is either the requester or the recipient and the status is accepted
    const { data, error } = await supabase
      .from('connections')
      .select(`
        id, 
        status, 
        created_at, 
        requester:requester_id(id, first_name, last_name, avatar_url, headline), 
        recipient:recipient_id(id, first_name, last_name, avatar_url, headline)
      `)
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Format the response to be more user-friendly
    const formattedConnections = data.map(conn => {
      const otherUser = conn.requester_id === userId ? conn.recipient : conn.requester;
      return {
        id: conn.id,
        status: conn.status,
        createdAt: conn.created_at,
        user: {
          id: otherUser.id,
          firstName: otherUser.first_name,
          lastName: otherUser.last_name,
          avatarUrl: otherUser.avatar_url,
          headline: otherUser.headline
        }
      };
    });
    
    res.status(200).json(formattedConnections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all connection requests for the current user
const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get connections where the user is the recipient and the status is pending
    const { data, error } = await supabase
      .from('connections')
      .select(`
        id, 
        status, 
        created_at, 
        requester:requester_id(id, first_name, last_name, avatar_url, headline)
      `)
      .eq('recipient_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching connection requests:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send a connection request to another user
const sendConnectionRequest = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { recipientId } = req.body;
    
    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required' });
    }
    
    if (requesterId === recipientId) {
      return res.status(400).json({ error: 'Cannot send a connection request to yourself' });
    }
    
    // Check if the recipient exists
    const { data: recipientData, error: recipientError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', recipientId)
      .single();
      
    if (recipientError) {
      if (recipientError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Recipient not found' });
      }
      throw recipientError;
    }
    
    // Check if there's an existing connection (in either direction) that's not declined
    const { data: existingConn, error: connError } = await supabase
      .from('connections')
      .select('id, status')
      .or(`and(requester_id.eq.${requesterId},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${requesterId})`)
      .neq('status', 'declined');
      
    if (connError) throw connError;
    
    if (existingConn && existingConn.length > 0) {
      const conn = existingConn[0];
      if (conn.status === 'accepted') {
        return res.status(400).json({ error: 'You are already connected with this user' });
      } else if (conn.status === 'pending') {
        return res.status(400).json({ error: 'A connection request already exists between you and this user' });
      }
    }
    
    // Call the function to handle connection request
    const { data, error } = await supabase.rpc('handle_connection_request', {
      p_requester_id: requesterId,
      p_recipient_id: recipientId
    });
    
    if (error) throw error;
    
    // Create a notification for the recipient
    const notification = {
      user_id: recipientId,
      title: 'New Connection Request',
      description: 'You have received a new connection request',
      type: 'connection_request',
      action_url: '/profile?tab=requests'
    };
    
    await supabase
      .from('notifications')
      .insert([notification]);
    
    res.status(201).json({ 
      message: 'Connection request sent successfully',
      connectionId: data
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ error: error.message });
  }
};

// Accept or decline a connection request
const respondToConnectionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { connectionId } = req.params;
    const { status } = req.body;
    
    if (!status || !['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either "accepted" or "declined"' });
    }
    
    // Check if the connection exists and the user is the recipient
    const { data: connData, error: connError } = await supabase
      .from('connections')
      .select('*')
      .eq('id', connectionId)
      .eq('recipient_id', userId)
      .single();
      
    if (connError) {
      if (connError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Connection request not found' });
      }
      throw connError;
    }
    
    // Update the connection status
    const { data, error } = await supabase
      .from('connections')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId)
      .select();
      
    if (error) throw error;
    
    // Create a notification for the requester
    const notification = {
      user_id: connData.requester_id,
      title: status === 'accepted' ? 'Connection Request Accepted' : 'Connection Request Declined',
      description: status === 'accepted' 
        ? 'Your connection request has been accepted' 
        : 'Your connection request has been declined',
      type: status === 'accepted' ? 'connection_accepted' : 'connection_declined',
      action_url: status === 'accepted' ? `/profile/${userId}` : '/profile?tab=connections'
    };
    
    await supabase
      .from('notifications')
      .insert([notification]);
    
    res.status(200).json({
      message: `Connection request ${status} successfully`,
      connection: data[0]
    });
  } catch (error) {
    console.error(`Error ${req.body.status} connection request:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Remove a connection
const removeConnection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { connectionId } = req.params;
    
    // Check if the connection exists and the user is part of it
    const { data: connData, error: connError } = await supabase
      .from('connections')
      .select('*')
      .eq('id', connectionId)
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .single();
      
    if (connError) {
      if (connError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Connection not found' });
      }
      throw connError;
    }
    
    // Delete the connection
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);
      
    if (error) {
      // If regular delete fails, try the force delete function
      const { data: forceDeleteResult, error: forceDeleteError } = await supabase
        .rpc('force_delete_connection', {
          connection_id: connectionId
        });
        
      if (forceDeleteError || !forceDeleteResult) {
        throw error || new Error('Failed to delete connection');
      }
    }
    
    res.status(200).json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserConnections,
  getConnectionRequests,
  sendConnectionRequest,
  respondToConnectionRequest,
  removeConnection
};
