
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';

// Explicitly define Message type using the Supabase Tables type
type Message = Tables<'messages'>['Row'];

interface MessageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    receiverId: string;
    receiverName: string;
    receiverAvatar: string;
}

const MessageDialog: React.FC<MessageDialogProps> = ({
    isOpen,
    onClose,
    receiverId,
    receiverName,
    receiverAvatar
}) => {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            setupRealtimeSubscription();
        }
    }, [isOpen, receiverId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast({
                title: "Error",
                description: "Failed to load messages",
                variant: "destructive",
            });
        }
    };

    const setupRealtimeSubscription = () => {
        const { data: { user } } = supabase.auth.getUser();
        if (!user) return;

        const channel = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id}))`
                },
                (payload) => {
                    setMessages(prev => [...prev, payload.new as Message]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({
                    title: "Error",
                    description: "You must be logged in to send messages",
                    variant: "destructive",
                });
                return;
            }

            setIsLoading(true);
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: user.id,
                    receiver_id: receiverId,
                    content: newMessage.trim(),
                    created_at: new Date().toISOString(),
                });

            if (error) throw error;

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: "Error",
                description: "Failed to send message",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={receiverAvatar} alt={receiverName} />
                            <AvatarFallback>{receiverName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        Chat with {receiverName}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender_id === receiverId ? 'justify-start' : 'justify-end'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${message.sender_id === receiverId
                                        ? 'bg-gray-100'
                                        : 'bg-skill-purple text-white'
                                    }`}
                            >
                                <p>{message.content}</p>
                                <p className="text-xs mt-1 opacity-70">
                                    {format(new Date(message.created_at), 'h:mm a')}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t">
                    <div className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={isLoading || !newMessage.trim()}
                            className="bg-skill-purple hover:bg-skill-purple-dark"
                        >
                            Send
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MessageDialog;
