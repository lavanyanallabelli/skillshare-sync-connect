
import React, { useEffect } from 'react';
import { EmptyState } from "../../common/ProfileUIComponents";
import RequestCard from "./RequestCard";
import { supabase } from '@/integrations/supabase/client';

interface RequestsListProps {
  requests: any[];
  userId: string;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  processingRequestId: string | null;
}

const RequestsList: React.FC<RequestsListProps> = ({ 
  requests, 
  userId, 
  onAccept, 
  onDecline, 
  processingRequestId 
}) => {
  useEffect(() => {
    console.log("[RequestsList] Current requests:", requests.length);
  }, [requests]);

  if (requests.length === 0) {
    return (
      <EmptyState 
        message="No pending requests" 
        subMessage="New session requests will appear here"
      />
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <RequestCard 
          key={request.id}
          request={request}
          userId={userId}
          onAccept={() => onAccept(request.id)}
          onDecline={() => onDecline(request.id)}
          isProcessing={processingRequestId === request.id}
        />
      ))}
    </div>
  );
};

export default RequestsList;
