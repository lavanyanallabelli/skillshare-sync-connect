
import React from "react";
import { useConnections } from "@/contexts/ConnectionContext";
import ConnectionItem from "./ConnectionItem";

const ConnectionsList: React.FC = () => {
  const { connections, isLoading } = useConnections();

  if (isLoading) {
    return <div className="text-center py-4">Loading connections...</div>;
  }

  if (connections.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No connections yet</p>
        <p className="text-sm mt-2">Connect with other users to grow your network</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {connections.map(connection => (
        <ConnectionItem key={connection.id} connection={connection} />
      ))}
    </div>
  );
};

export default ConnectionsList;
