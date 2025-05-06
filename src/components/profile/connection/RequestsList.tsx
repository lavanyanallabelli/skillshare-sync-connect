
import React, { useEffect } from "react";
import { useConnections } from "@/contexts/ConnectionContext";
import RequestItem from "./RequestItem";
import { supabase } from "@/integrations/supabase/client";

const RequestsList: React.FC = () => {
  const { pendingRequests, isLoading } = useConnections();

  // Add verification mechanism to ensure we're showing the correct state
  useEffect(() => {
    if (pendingRequests.length > 0) {
      const verifyRequests = async () => {
        try {
          // Get all pending request IDs
          const requestIds = pendingRequests.map(request => request.id);

          // Verify these connections still exist in the database
          const { data, error } = await supabase
            .from('connections')
            .select('id, status')
            .in('id', requestIds);

          if (error) {
            console.error("[RequestsList] Error verifying connection state:", error);
            return;
          }

          // Check for any inconsistencies between local state and database
          if (data.length !== requestIds.length) {
            console.warn(
              "[RequestsList] Mismatch between local state and database. " +
              `Local: ${requestIds.length}, Database: ${data.length}`
            );
            
            // Note: Not forcing a refresh here, since this is just a verification,
            // and the context's subscription should handle updates
          }
        } catch (err) {
          console.error("[RequestsList] Verification error:", err);
        }
      };

      verifyRequests();
    }
  }, [pendingRequests]);

  if (isLoading) {
    return <div className="text-center py-4">Loading requests...</div>;
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No pending requests</p>
        <p className="text-sm mt-2">When someone wants to connect with you, it will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingRequests.map(request => (
        <RequestItem key={request.id} request={request} />
      ))}
    </div>
  );
};

export default RequestsList;
