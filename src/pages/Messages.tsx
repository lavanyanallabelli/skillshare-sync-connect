import React, { useState, useEffect } from 'react';
import ProfileLayout from '@/components/layout/ProfileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle } from 'lucide-react';
import MessageDialog from '@/components/messages/MessageDialog';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

const Messages = () => {
  const { userId } = useAuth();
  const [contacts, setContacts] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar')
          .neq('id', userId);

        if (error) {
          console.error('Error fetching contacts:', error);
          return;
        }

        setContacts(data || []);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [userId]);

  const filteredContacts = contacts.filter(contact =>
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactClick = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <ProfileLayout>
        <div className="container max-w-6xl py-8">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>Loading messages...</CardContent>
          </Card>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="container max-w-6xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {filteredContacts.length > 0 ? (
              <ul className="space-y-4">
                {filteredContacts.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center gap-4 p-4 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => handleContactClick(user)}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.first_name} />
                      <AvatarFallback>{user.first_name.charAt(0)}{user.last_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.first_name} {user.last_name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                {searchQuery ? (
                  <p className="text-muted-foreground">No contacts found matching your search.</p>
                ) : (
                  <p className="text-muted-foreground">No contacts yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {selectedUser && (
          <MessageDialog
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
            receiverId={selectedUser.id}
            receiverName={`${selectedUser.first_name} ${selectedUser.last_name}`}
            receiverAvatar={selectedUser.avatar || '/placeholder.svg'}
          />
        )}
      </div>
    </ProfileLayout>
  );
};

export default Messages;
