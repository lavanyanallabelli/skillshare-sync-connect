
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainDashboard } from "@/components/dashboards/MainDashboard";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { isLoggedIn, userId } = useAuth();

  if (!isLoggedIn || !userId) {
    return <Navigate to="/login" />;
  }

  return (
    <ProfileLayout>
      <MainDashboard userId={userId} />
    </ProfileLayout>
  );
};

export default Dashboard;
