
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Paperclip, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import MessageDialog from "@/components/messages/MessageDialog";

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    status: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  skill: string;
}

interface Message {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: string;
  isFromCurrentUser: boolean;
}

const Messages: React.FC = () => {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  // Fetch conversations
  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        // Get unique users the current user has exchanged messages with
        const { data: userData, error: userError } = await supabase
          .rpc('get_message_conversations', { user_id: userId });

        if (userError) throw userError;

        if (userData && userData.length > 0) {
          // Format the conversation data
          const formattedConversations: Conversation[] = await Promise.all(
            userData.map(async (user: any) => {
              // Get the latest message
              const { data: latestMessage } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${userId},receiver_id.eq.${user.user_id}),and(sender_id.eq.${user.user_id},receiver_id.eq.${userId})`)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

              // Get unread count
              const { data: unreadCount } = await supabase
                .from('messages')
                .select('count', { count: 'exact' })
                .eq('receiver_id', userId)
                .eq('sender_id', user.user_id)
                .is('read_at', null);

              // Format the timestamp
              const timestamp = latestMessage 
                ? new Date(latestMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return {
                id: user.user_id,
                user: {
                  id: user.user_id,
                  name: user.full_name || 'User',
                  avatar: user.avatar_url || '/placeholder.svg',
                  status: 'online', // For simplicity, we're setting all users as online
                },
                lastMessage: latestMessage ? latestMessage.content : '',
                timestamp: timestamp,
                unread: unreadCount && unreadCount > 0,
                skill: user.skill || 'General',
              };
            })
          );

          setConversations(formattedConversations);
          
          // Set the first conversation as active if there's no active conversation
          if (formattedConversations.length > 0 && !activeConversation) {
            setActiveConversation(formattedConversations[0]);
            fetchMessages(formattedConversations[0].user.id);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);

  // Fetch messages for the active conversation
  const fetchMessages = async (otherUserId: string) => {
    if (!userId || !otherUserId) return;

    try {
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('receiver_id', userId)
        .eq('sender_id', otherUserId)
        .is('read_at', null);

      // Get messages
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get user profile for the sender
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', otherUserId)
        .single();

      const senderName = senderProfile 
        ? `${senderProfile.first_name} ${senderProfile.last_name}`.trim() 
        : 'User';

      if (data) {
        const formattedMessages: Message[] = data.map(message => ({
          id: message.id,
          sender: message.sender_id === userId ? 'You' : senderName,
          senderId: message.sender_id,
          content: message.content,
          timestamp: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFromCurrentUser: message.sender_id === userId,
        }));

        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.user.id);
    }
  }, [activeConversation, userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !userId || !activeConversation) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          receiver_id: activeConversation.user.id,
          content: newMessage.trim(),
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };
  
  const handleScheduleSession = () => {
    if (activeConversation) {
      setMessageDialogOpen(false);
      window.location.href = `/teacher/${activeConversation.user.id}`;
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-8">Messages</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-skill-purple"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>
        
        <div className="bg-card border rounded-lg overflow-hidden flex h-[calc(100vh-300px)] min-h-[500px]">
          {/* Conversations sidebar */}
          <div className="w-full max-w-xs border-r">
            <div className="p-4 border-b">
              <Input placeholder="Search conversations..." />
            </div>
            
            <div className="overflow-y-auto h-[calc(100%-57px)]">
              {conversations.length > 0 ? (
                conversations.map(conversation => (
                  <div 
                    key={conversation.id}
                    className={`flex items-start gap-3 p-4 border-b cursor-pointer hover:bg-muted transition-colors ${
                      activeConversation?.id === conversation.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                        <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {conversation.user.status === 'online' && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium truncate">{conversation.user.name}</h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {conversation.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        Skill: {conversation.skill}
                      </span>
                    </div>
                    
                    {conversation.unread && (
                      <div className="h-2 w-2 rounded-full bg-skill-purple"></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start messaging other users to see them here</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Messages area */}
          {activeConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Conversation header */}
              <div className="p-4 border-b flex justify-between items-center bg-muted/50">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={activeConversation.user.avatar} alt={activeConversation.user.name} />
                    <AvatarFallback>{activeConversation.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{activeConversation.user.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeConversation.user.status === 'online' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={handleScheduleSession}
                  >
                    <Calendar size={14} />
                    Schedule Session
                  </Button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map(message => (
                    <div 
                      key={message.id}
                      className={`flex ${message.isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${
                        message.isFromCurrentUser 
                          ? 'bg-skill-purple text-white rounded-tl-lg rounded-tr-sm rounded-bl-lg' 
                          : 'bg-muted rounded-tr-lg rounded-tl-sm rounded-br-lg'
                      } p-3 shadow-sm`}>
                        <p>{message.content}</p>
                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                          message.isFromCurrentUser ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          <Clock size={10} />
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <p>No messages yet</p>
                      <p className="text-sm mt-2">Send a message to start the conversation</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                <Button type="button" variant="ghost" size="icon">
                  <Paperclip size={20} />
                </Button>
                <Input 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="bg-skill-purple hover:bg-skill-purple-dark">
                  <Send size={20} />
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Select a conversation</p>
                <p className="text-sm mt-2">Choose a conversation from the list to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {activeConversation && (
        <MessageDialog
          isOpen={messageDialogOpen}
          onClose={() => setMessageDialogOpen(false)}
          receiverId={activeConversation.user.id}
          receiverName={activeConversation.user.name}
          receiverAvatar={activeConversation.user.avatar}
        />
      )}
    </MainLayout>
  );
};

export default Messages;
