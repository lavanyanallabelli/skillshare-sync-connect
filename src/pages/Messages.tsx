
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Paperclip, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample conversations data
const conversationsData = [
  {
    id: 1,
    user: {
      name: "Sarah Williams",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      status: "online",
    },
    lastMessage: "When would you like to schedule our next session?",
    timestamp: "10:23 AM",
    unread: true,
    skill: "Photography",
  },
  {
    id: 2,
    user: {
      name: "Michael Chen",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      status: "offline",
    },
    lastMessage: "The guitar exercise you suggested was really helpful!",
    timestamp: "Yesterday",
    unread: false,
    skill: "Guitar",
  },
  {
    id: 3,
    user: {
      name: "Alex Johnson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      status: "online",
    },
    lastMessage: "I've attached some examples of my work.",
    timestamp: "2 days ago",
    unread: false,
    skill: "Web Development",
  },
];

// Sample messages for the active conversation
const sampleMessages = [
  {
    id: 1,
    sender: "Sarah Williams",
    content: "Hi there! Thanks for accepting my request to learn photography.",
    timestamp: "10:05 AM",
    isFromCurrentUser: false,
  },
  {
    id: 2,
    sender: "You",
    content: "Of course! I'm excited to help you learn. What kind of photography are you most interested in?",
    timestamp: "10:08 AM",
    isFromCurrentUser: true,
  },
  {
    id: 3,
    sender: "Sarah Williams",
    content: "I'm really interested in portrait photography. I've just got a new DSLR camera but I'm not sure how to get the best results.",
    timestamp: "10:15 AM",
    isFromCurrentUser: false,
  },
  {
    id: 4,
    sender: "You",
    content: "Portrait photography is a great place to start! We can cover camera basics, lighting, composition, and how to direct your subjects.",
    timestamp: "10:18 AM",
    isFromCurrentUser: true,
  },
  {
    id: 5,
    sender: "Sarah Williams",
    content: "That sounds perfect. When would you like to schedule our next session?",
    timestamp: "10:23 AM",
    isFromCurrentUser: false,
  },
];

const Messages: React.FC = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState(conversationsData);
  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [messages, setMessages] = useState(sampleMessages);
  const [newMessage, setNewMessage] = useState("");
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const message = {
      id: messages.length + 1,
      sender: "You",
      content: newMessage,
      timestamp: "Just now",
      isFromCurrentUser: true,
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
    
    // Update the conversation's last message
    const updatedConversations = conversations.map(conv => 
      conv.id === activeConversation.id 
        ? { ...conv, lastMessage: newMessage, timestamp: "Just now" } 
        : conv
    );
    
    setConversations(updatedConversations);
    
    // Simulate a reply after 2 seconds
    setTimeout(() => {
      const reply = {
        id: messages.length + 2,
        sender: activeConversation.user.name,
        content: "I can do Tuesday afternoon or Thursday morning. What works for you?",
        timestamp: "Just now",
        isFromCurrentUser: false,
      };
      
      setMessages(prevMessages => [...prevMessages, reply]);
      
      // Update the conversation again
      const updatedWithReply = updatedConversations.map(conv => 
        conv.id === activeConversation.id 
          ? { ...conv, lastMessage: reply.content, timestamp: "Just now" } 
          : conv
      );
      
      setConversations(updatedWithReply);
    }, 2000);
  };
  
  const handleScheduleSession = () => {
    toast({
      title: "Session scheduling",
      description: "Opening the scheduler for your session with " + activeConversation.user.name,
    });
  };
  
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
              {conversations.map(conversation => (
                <div 
                  key={conversation.id}
                  className={`flex items-start gap-3 p-4 border-b cursor-pointer hover:bg-muted transition-colors ${
                    activeConversation.id === conversation.id ? 'bg-muted' : ''
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
              ))}
            </div>
          </div>
          
          {/* Messages area */}
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
              {messages.map(message => (
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
              ))}
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
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
