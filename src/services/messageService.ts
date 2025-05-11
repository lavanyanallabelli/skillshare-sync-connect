
// Message service
import { supabase } from '@/integrations/supabase/client';
import { Message, Conversation } from '@/models/Message';
import { toast } from '@/hooks/use-toast';

export const messageService = {
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_unread_message_count', { user_id: userId });
      
      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  },
  
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      // This is a complex query that would ideally be a database function
      // For now, we'll simulate the functionality with multiple queries
      
      // Get all users the current user has exchanged messages with
      const { data: sentMessages } = await supabase
        .from('messages')
        .select('receiver_id')
        .eq('sender_id', userId);
        
      const { data: receivedMessages } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', userId);
        
      // Extract user IDs
      const sentToUserIds = sentMessages ? sentMessages.map(msg => msg.receiver_id) : [];
      const receivedFromUserIds = receivedMessages ? receivedMessages.map(msg => msg.sender_id) : [];
      
      // Combine and remove duplicates
      const conversationUserIds = [...new Set([...sentToUserIds, ...receivedFromUserIds])];
      
      if (conversationUserIds.length === 0) return [];
      
      // Get user details and last messages
      const conversations: Conversation[] = [];
      
      for (const partnerId of conversationUserIds) {
        // Get partner profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', partnerId)
          .single();
          
        if (!profileData) continue;
        
        // Get most recent message
        const { data: lastMessageData } = await supabase
          .from('messages')
          .select('content, created_at')
          .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
          .order('created_at', { ascending: false })
          .limit(1);
          
        // Count unread messages
        const { data: unreadCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('sender_id', partnerId)
          .eq('receiver_id', userId)
          .is('read_at', null);
          
        conversations.push({
          userId: partnerId,
          userName: `${profileData.first_name} ${profileData.last_name}`,
          userAvatar: profileData.avatar_url,
          lastMessage: lastMessageData && lastMessageData.length > 0 ? lastMessageData[0].content : undefined,
          lastMessageDate: lastMessageData && lastMessageData.length > 0 ? lastMessageData[0].created_at : undefined,
          unreadCount: unreadCount || 0
        });
      }
      
      return conversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  },
  
  async getMessages(userId: string, partnerId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', partnerId)
        .eq('receiver_id', userId)
        .is('read_at', null);
        
      // Transform data to match Message interface
      return (data || []).map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        content: msg.content,
        readAt: msg.read_at,
        createdAt: msg.created_at
      }));
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },
  
  async sendMessage(senderId: string, receiverId: string, content: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: senderId,
          receiver_id: receiverId,
          content
        }]);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }
};
