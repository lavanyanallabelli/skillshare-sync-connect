
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { createConnectionNotification } from "@/utils/notificationUtils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const RequestsTab: React.FC = () => {
  const { userId } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // Fetch pending connection requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('connections')
          .select(`
            *,
            requester:profiles!connections_requester_id_fkey(first_name, last_name),
            recipient:profiles!connections_recipient_id_fkey(first_name, last_name)
          `)
          .eq('recipient_id', userId)
          .eq('status', 'pending');

        if (requestsError) throw requestsError;
        setRequests(requestsData || []);

        // Fetch user data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        setUserData(profileData);

      } catch (error) {
        console.error("Error fetching connection requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userId]);

  const handleAcceptConnection = async (connection: any, userId: string | null) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connection.id);

      if (error) throw error;

      if (userData) {
        await createConnectionNotification(
          connection.requester_id,
          "accepted",
          `${userData.first_name} ${userData.last_name} accepted your connection request`
        );
      }

      setRequests(prevRequests => prevRequests.filter(req => req.id !== connection.id));
      setLoading(false);
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  const handleDeclineConnection = async (connection: any, userId: string | null) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connection.id);

      if (error) throw error;

      if (userData) {
        await createConnectionNotification(
          connection.requester_id,
          "declined",
          `${userData.first_name} ${userData.last_name} declined your connection request`
        );
      }

      setRequests(prevRequests => prevRequests.filter(req => req.id !== connection.id));
      setLoading(false);
    } catch (error) {
      console.error("Error declining connection:", error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connection Requests</CardTitle>
          <CardDescription>Loading connection requests...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Requests</CardTitle>
        <CardDescription>Respond to pending connection requests</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length > 0 ? (
          <ul className="space-y-4">
            {requests.map((request) => (
              <li key={request.id} className="flex items-center justify-between border p-4 rounded-md">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt="Requesting User Avatar" />
                    <AvatarFallback>{request.requester?.first_name?.charAt(0)}{request.requester?.last_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.requester?.first_name} {request.requester?.last_name}</p>
                    <p className="text-sm text-muted-foreground">Requesting to connect</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAcceptConnection(request, userId)}>Accept</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeclineConnection(request, userId)}>Decline</Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No pending connection requests.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestsTab;
