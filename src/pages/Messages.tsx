import React from "react";
import { useAuth } from "@/contexts/AuthContext";

const Messages: React.FC = () => {
  const { userId } = useAuth();

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      {userId ? (
        <p>Welcome to your messages, user {userId}!</p>
      ) : (
        <p>Please log in to view your messages.</p>
      )}
    </div>
  );
};

export default Messages;
