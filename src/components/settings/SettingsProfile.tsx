
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsProfileProps {
  userId: string | null;
}

export const SettingsProfile: React.FC<SettingsProfileProps> = ({ userId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Profile settings for user {userId || 'unknown'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
