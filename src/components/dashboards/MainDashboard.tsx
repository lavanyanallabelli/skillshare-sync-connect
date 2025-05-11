
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MainDashboardProps {
  userId: string;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ userId }) => {
  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Sessions</CardTitle>
            <CardDescription>
              Upcoming learning and teaching sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>You have no upcoming sessions.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>
              Recent conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>No recent messages.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Skills</CardTitle>
            <CardDescription>
              Skills you're teaching and learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>No skills added yet.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
