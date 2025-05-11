import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { createConnectionNotification } from "@/utils/notificationUtils";

interface ConnectionListProps {
  userId: string | null;
}

const ConnectionList: React.FC<ConnectionListProps> = ({ userId }) => {
  const [connections, setConnections] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  React.useEffect(() => {
    const fetchConnections = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // Fetch accepted connections
        const { data: connectionsData, error: connectionsError } = await supabase
          .from('user_connections')
          .select('*')
          .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
          .eq('status', 'accepted');

        if (connectionsError) throw connectionsError;

        const formattedConnections = connectionsData?.map(conn => {
          const connectedUserId = conn.user_id === userId ? conn.connected_user_id : conn.user_id;
          return {
            ...conn,
            connected_user_id: connectedUserId
          };
        }) || [];

        setConnections(formattedConnections);

        // Fetch pending connection requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('user_connections')
          .select('*')
          .eq('connected_user_id', userId)
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
        console.error("Error fetching connections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [userId]);

  const handleAcceptConnection = async (connection: any, userId: string | null) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted' })
        .eq('id', connection.id);

      if (error) throw error;

      await createConnectionNotification(
        connection.requester_id,
        "accepted",
        `${userData.first_name} ${userData.last_name} accepted your connection request`
      );

      setRequests(prevRequests => prevRequests.filter(req => req.id !== connection.id));
      setConnections(prevConnections => [...prevConnections, { ...connection, status: 'accepted' }]);
      setLoading(false);
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  const handleDeclineConnection = async (connection: any, userId: string | null) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', connection.id);

      if (error) throw error;

      await createConnectionNotification(
        connection.requester_id,
        "declined",
        `${userData.first_name} ${userData.last_name} declined your connection request`
      );

      setRequests(prevRequests => prevRequests.filter(req => req.id !== connection.id));
      setLoading(false);
    } catch (error) {
      console.error("Error declining connection:", error);
    }
  };

  if (loading) {
    return <p>Loading connections...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Connections</h2>
        {connections.length > 0 ? (
          <ul className="space-y-4">
            {connections.map((connection) => (
              <li key={connection.id} className="flex items-center gap-4 border p-4 rounded-md">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" alt="Connected User Avatar" />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">User Name</p>
                  <p className="text-sm text-muted-foreground">User Title</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No connections yet.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Connection Requests</h2>
        {requests.length > 0 ? (
          <ul className="space-y-4">
            {requests.map((request) => (
              <li key={request.id} className="flex items-center justify-between border p-4 rounded-md">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt="Requesting User Avatar" />
                    <AvatarFallback>RU</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">User Name</p>
                    <p className="text-sm text-muted-foreground">User Title</p>
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
      </div>
    </div>
  );
};

export default ConnectionList;
