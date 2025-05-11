import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProfileLayout from '@/components/layout/ProfileLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Messages = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientProfile, setRecipientProfile] = useState<any>(null);
  const { id: recipientId } = useParams<{ id: string }>();

  useEffect(() => {
    if (!userId || !recipientId) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
          .order('created_at', { ascending: true });

        if (error) {
          setError(error.message);
          toast({
            title: "Error fetching messages",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setMessages(data || []);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error fetching messages",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRecipientProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', recipientId)
          .single();

        if (error) {
          setError(error.message);
          toast({
            title: "Error fetching recipient profile",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setRecipientProfile(data);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error fetching recipient profile",
          description: err.message,
          variant: "destructive",
        });
      }
    };

    fetchMessages();
    fetchRecipientProfile();

    // Subscribe to real-time message inserts
    const messageSubscription = supabase
      .from('messages')
      .on('INSERT', (payload) => {
        setMessages(prevMessages => [...prevMessages, payload.new]);
      })
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
    };
  }, [userId, recipientId, toast]);

  const handleSendMessage = async () => {
    if (!message.trim() || !userId || !recipientId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: userId,
            recipient_id: recipientId,
            content: message.trim(),
          },
        ])
        .select();

      if (error) {
        setError(error.message);
        toast({
          title: "Error sending message",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setMessage('');
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error sending message",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <ProfileLayout>
      <div className="container max-w-4xl py-8">
        <Card className="space-y-4">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar>
                {recipientProfile?.avatar_url ? (
                  <AvatarImage src={recipientProfile?.avatar_url} alt={recipientProfile?.first_name} />
                ) : (
                  <AvatarFallback>{recipientProfile?.first_name?.charAt(0)}{recipientProfile?.last_name?.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{recipientProfile?.first_name} {recipientProfile?.last_name}</h2>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                <p>Loading messages...</p>
              ) : error ? (
                <p className="text-red-500">Error: {error}</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender_id === userId ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${msg.sender_id === userId ? 'bg-skill-purple text-white' : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </Card>
      </div>
    </ProfileLayout>
  );
};

export default Messages;
