
import React from "react";
import { useConnections } from "@/contexts/ConnectionContext";
import RequestItem from "./RequestItem";

const RequestsList: React.FC = () => {
  const { pendingRequests, isLoading } = useConnections();

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
