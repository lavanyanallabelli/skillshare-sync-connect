
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useConnections } from "@/contexts/ConnectionContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const RemoveConnectionDialog: React.FC = () => {
  const { 
    isRemoveDialogOpen, 
    setIsRemoveDialogOpen, 
    handleRemoveConnection, 
    isProcessing,
    connectionToRemove 
  } = useConnections();
  
  const [retryCount, setRetryCount] = useState(0);
  const [removingInProgress, setRemovingInProgress] = useState(false);

  const connectionName = connectionToRemove ? 
    `${connectionToRemove.profile?.first_name} ${connectionToRemove.profile?.last_name}` : 
    "this connection";
    
  const handleRemoveWithRetry = async () => {
    setRemovingInProgress(true);
    try {
      await handleRemoveConnection();
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error("Error during connection removal:", error);
      
      // If we've already retried, show a different error message
      if (retryCount > 0) {
        toast({
          title: "Persistent Error",
          description: "We're having trouble removing this connection. Please try again later.",
          variant: "destructive",
        });
        setIsRemoveDialogOpen(false);
      } else {
        // Otherwise, increment retry count and try again
        setRetryCount(prevCount => prevCount + 1);
        toast({
          title: "Retry",
          description: "First attempt failed, retrying...",
        });
        setTimeout(() => {
          handleRemoveConnection().catch(err => {
            console.error("Error during retry:", err);
            toast({
              title: "Connection Error",
              description: "Failed to remove connection after retry. Please try again later.",
              variant: "destructive",
            });
            setIsRemoveDialogOpen(false);
          }).finally(() => {
            setRemovingInProgress(false);
          });
        }, 1000);
        return;
      }
    }
    setRemovingInProgress(false);
  };

  const isButtonDisabled = isProcessing || removingInProgress;

  return (
    <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Connection</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove your connection with {connectionName}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isButtonDisabled}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleRemoveWithRetry} 
            className="bg-red-500 text-white hover:bg-red-600"
            disabled={isButtonDisabled}
          >
            {(isProcessing || removingInProgress) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {retryCount > 0 ? "Retrying..." : "Processing..."}
              </>
            ) : (
              'Remove'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveConnectionDialog;
