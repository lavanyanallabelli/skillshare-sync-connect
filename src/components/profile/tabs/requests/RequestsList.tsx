
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

  // Verify that requests data is valid whenever it changes
  useEffect(() => {
    if (requests.length > 0) {
      const verifyDatabaseState = async () => {
        try {
          // Get the request IDs
          const requestIds = requests.map(req => req.id);
          
          // Verify these requests still exist in the database
          const { data, error } = await supabase
            .from('sessions')
            .select('id')
            .in('id', requestIds)
            .eq('status', 'pending');
            
          if (error) {
            console.error("[RequestsList] Error verifying request state:", error);
            return;
          }
          
          // Log if there's a mismatch between local state and database
          if (data.length !== requests.length) {
            console.warn(
              "[RequestsList] Mismatch between local state and database state. " +
              `Local: ${requests.length}, Database: ${data.length}`
            );
          }
        } catch (err) {
          console.error("[RequestsList] Error in database verification:", err);
        }
      };
      
      verifyDatabaseState();
    }
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
