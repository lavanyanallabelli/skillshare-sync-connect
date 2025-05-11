
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageSquare } from "lucide-react";
import { messageService } from "@/services/messageService";
import MessageDialog from "@/components/messages/MessageDialog";
import { Conversation } from "@/models/Message";
import { format } from "date-fns";

const Messages: React.FC = () => {
  const { userId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      loadConversations();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadConversations = async () => {
    try {
      if (!userId) return;
      setLoading(true);
      const data = await messageService.getConversations(userId);
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsMessageDialogOpen(true);
  };

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userId) {
    return (
      <div className="container h-screen flex items-center justify-center">
        <Card className="max-w-md w-full text-center p-6">
          <h2 className="text-xl font-semibold mb-2">Please Log In</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to view your messages.</p>
          <Button className="bg-skill-purple hover:bg-skill-purple-dark" asChild>
            <a href="/login">Log In</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All Messages</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8 w-[250px]"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-skill-purple border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-muted-foreground">Loading conversations...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <Card
                  key={conversation.userId}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    conversation.unreadCount > 0 ? "border-l-4 border-l-skill-purple" : ""
                  }`}
                  onClick={() => handleOpenConversation(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.userAvatar || "/placeholder.svg"} alt={conversation.userName} />
                        <AvatarFallback>{conversation.userName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium truncate">{conversation.userName}</p>
                          {conversation.lastMessageDate && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(conversation.lastMessageDate), "MMM d, h:mm a")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="bg-skill-purple text-white text-xs h-5 min-w-5 rounded-full flex items-center justify-center px-1.5">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">No conversations yet</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? "No conversations match your search." 
                  : "Your messages will appear here once you start chatting with others."}
              </p>
              
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-skill-purple border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-muted-foreground">Loading conversations...</p>
            </div>
          ) : filteredConversations.filter(c => c.unreadCount > 0).length > 0 ? (
            <div className="space-y-2">
              {filteredConversations
                .filter(c => c.unreadCount > 0)
                .map((conversation) => (
                  <Card
                    key={conversation.userId}
                    className="cursor-pointer transition-colors hover:bg-muted/50 border-l-4 border-l-skill-purple"
                    onClick={() => handleOpenConversation(conversation)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.userAvatar || "/placeholder.svg"} alt={conversation.userName} />
                          <AvatarFallback>{conversation.userName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium truncate">{conversation.userName}</p>
                            {conversation.lastMessageDate && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(conversation.lastMessageDate), "MMM d, h:mm a")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage || "No messages yet"}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="bg-skill-purple text-white text-xs h-5 min-w-5 rounded-full flex items-center justify-center px-1.5">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">No unread messages</h3>
              <p className="text-muted-foreground">You're all caught up! Check back later.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedConversation && (
        <MessageDialog
          isOpen={isMessageDialogOpen}
          onClose={() => {
            setIsMessageDialogOpen(false);
            loadConversations(); // Refresh conversations after closing dialog
          }}
          receiverId={selectedConversation.userId}
          receiverName={selectedConversation.userName}
          receiverAvatar={selectedConversation.userAvatar || "/placeholder.svg"}
        />
      )}
    </div>
  );
};

export default Messages;
