
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface GoogleConnectionStatusProps {
  isGoogleConnected: boolean;
  isRefreshingToken: boolean;
  onConnect: () => void;
  onRefresh: () => void;
}

const GoogleConnectionStatus: React.FC<GoogleConnectionStatusProps> = ({
  isGoogleConnected,
  isRefreshingToken,
  onConnect,
  onRefresh
}) => {
  if (!isGoogleConnected) {
    return (
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800 text-sm font-medium mb-2">Google Calendar Not Connected</p>
        <p className="text-yellow-700 text-xs mb-2">
          You need to connect your Google account to generate meeting links when accepting sessions.
        </p>
        <Button size="sm" variant="outline" onClick={onConnect} className="bg-white">
          Connect Google Account
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-green-800 text-sm font-medium">Google Calendar Connected</p>
          <p className="text-green-700 text-xs">
            You can now generate Google Meet links when accepting sessions.
          </p>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onRefresh} 
          className="bg-white"
          disabled={isRefreshingToken}
        >
          {isRefreshingToken ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default GoogleConnectionStatus;
