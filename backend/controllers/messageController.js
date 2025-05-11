
const { supabase } = require('../config/supabaseClient');

// Get all messages between the current user and another user
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    // Mark all messages from the other user as read
    const messagesToUpdate = data
      .filter(msg => msg.sender_id === otherUserId && msg.receiver_id === userId && !msg.read_at)
      .map(msg => msg.id);
      
    if (messagesToUpdate.length > 0) {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messagesToUpdate);
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all conversations for the current user
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all messages sent by or received by the current user
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Group messages by conversation partner
    const conversations = {};
    
    for (const message of messages) {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          userId: otherUserId,
          lastMessage: message,
          unreadCount: message.receiver_id === userId && !message.read_at ? 1 : 0
        };
      } else {
        if (message.receiver_id === userId && !message.read_at) {
          conversations[otherUserId].unreadCount += 1;
        }
      }
    }
    
    // Get user details for all conversation partners
    const userIds = Object.keys(conversations);
    
    if (userIds.length === 0) {
      return res.status(200).json([]);
    }
    
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .in('id', userIds);
      
    if (usersError) throw usersError;
    
    // Map users to conversations
    const result = users.map(user => {
      const conversation = conversations[user.id];
      return {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url
        },
        lastMessage: conversation.lastMessage,
        unreadCount: conversation.unreadCount
      };
    });
    
    // Sort by most recent message
    result.sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase.rpc('get_unread_message_count', {
      user_id: userId
    });
    
    if (error) throw error;
    
    res.status(200).json({ count: data });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send a message to another user
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }
    
    // Check if the receiver exists
    const { data: receiverData, error: receiverError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', receiverId)
      .single();
      
    if (receiverError) {
      if (receiverError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Receiver not found' });
      }
      throw receiverError;
    }
    
    // Create the message
    const message = {
      sender_id: senderId,
      receiver_id: receiverId,
      content
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select();
      
    if (error) throw error;
    
    // Create a notification for the receiver
    const notification = {
      user_id: receiverId,
      title: 'New Message',
      description: 'You have received a new message',
      type: 'new_message',
      action_url: `/messages/${senderId}`
    };
    
    await supabase
      .from('notifications')
      .insert([notification]);
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark a message as read
const markMessageAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    
    // Check if the message exists and the user is the receiver
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .eq('receiver_id', userId)
      .single();
      
    if (messageError) {
      if (messageError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Message not found' });
      }
      throw messageError;
    }
    
    // Update the message
    const { data, error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .select();
      
    if (error) throw error;
    
    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMessages,
  getConversations,
  getUnreadCount,
  sendMessage,
  markMessageAsRead
};
