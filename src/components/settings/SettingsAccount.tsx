
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsAccountProps {
  userId: string | null;
}

export const SettingsAccount: React.FC<SettingsAccountProps> = ({ userId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Account settings for user {userId || 'unknown'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
