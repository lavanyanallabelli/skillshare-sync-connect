import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import MobileNotifications from "@/components/notifications/MobileNotifications";

const Notifications: React.FC = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="container h-screen flex items-center justify-center">
        Please log in to view your notifications.
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <MobileNotifications />
    </div>
  );
};

export default Notifications;
