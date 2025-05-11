
import React from 'react';

interface MainDashboardProps {
  userId: string;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ userId }) => {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard, user {userId}!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Activity</h2>
          <p className="text-muted-foreground">No recent activity</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Upcoming Sessions</h2>
          <p className="text-muted-foreground">No upcoming sessions</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Skills Progress</h2>
          <p className="text-muted-foreground">No skills in progress</p>
        </div>
      </div>
    </div>
  );
};
