
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionCard, EmptyState } from "../common/ProfileUIComponents";

interface ProfileUpcomingSessionsProps {
  upcomingSessions: any[];
}

const ProfileUpcomingSessions: React.FC<ProfileUpcomingSessionsProps> = ({ upcomingSessions }) => {
  if (!upcomingSessions || upcomingSessions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileUpcomingSessions;
