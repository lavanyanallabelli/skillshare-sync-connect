
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProfileLayout from "@/components/layout/ProfileLayout";

const Dashboard = () => {
  const { isLoggedIn, userId } = useAuth();

  if (!isLoggedIn || !userId) {
    return <div>Not authenticated.</div>;
  }

  return (
    <ProfileLayout>
      <div className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Welcome Back</h2>
            <p>Your dashboard is currently in development. Check back soon for more features!</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Sessions</h2>
            <p>No upcoming sessions found.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <p>You have no unread messages.</p>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Dashboard;
