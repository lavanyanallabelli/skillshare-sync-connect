import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainDashboard } from "@/components/dashboards/MainDashboard";

const Dashboard: React.FC = () => {
  const { isLoggedIn, userId } = useAuth();

  if (!isLoggedIn || !userId) {
    return <div>Not authenticated.</div>;
  }

  return (
    <MainDashboard userId={userId} />
  );
};

export default Dashboard;
