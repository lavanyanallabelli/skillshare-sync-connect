
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";
import { useDebugNotifications } from "@/hooks/useDebugNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NotificationDebugger = () => {
  const { userId } = useAuth();
  const { testNotificationCreation, debugResult, loading } = useDebugNotifications();
  const [showDebugger, setShowDebugger] = useState(false);

  const handleTest = async () => {
    if (!userId) return;
    await testNotificationCreation(userId);
  };

  if (!showDebugger) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="fixed bottom-4 right-4 z-50 opacity-70 hover:opacity-100"
        onClick={() => setShowDebugger(true)}
      >
        Debug Notifications
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          Notification Debugger
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDebugger(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-xs">
          <div>
            <p>User ID: {userId || 'Not logged in'}</p>
          </div>
          
          <Button 
            onClick={handleTest}
            size="sm" 
            disabled={loading || !userId}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Create Notification'}
          </Button>
          
          {debugResult && (
            <div className={`p-2 rounded text-xs ${debugResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="font-medium">{debugResult.success ? 'Success!' : 'Error'}</p>
              <p className="mt-1">{debugResult.message}</p>
              {debugResult.error && (
                <pre className="mt-1 text-xs overflow-auto max-h-40">
                  {JSON.stringify(debugResult.error, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationDebugger;
