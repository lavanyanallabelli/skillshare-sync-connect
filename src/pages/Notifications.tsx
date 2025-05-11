import React from 'react';
import ProfileLayout from '@/components/layout/ProfileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Notifications = () => {
  const { userId } = useAuth();

  return (
    <ProfileLayout>
      <div className="container max-w-6xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {userId ? (
              <p>Notifications for user: {userId}</p>
            ) : (
              <p>Please log in to see your notifications.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  );
};

export default Notifications;
