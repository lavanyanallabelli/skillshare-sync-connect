
import React from "react";
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

const RemoveConnectionDialog: React.FC = () => {
  const { 
    isRemoveDialogOpen, 
    setIsRemoveDialogOpen, 
    handleRemoveConnection, 
    isProcessing,
    connectionToRemove 
  } = useConnections();

  const connectionName = connectionToRemove ? 
    `${connectionToRemove.profile?.first_name} ${connectionToRemove.profile?.last_name}` : 
    "this connection";

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
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleRemoveConnection} 
            className="bg-red-500 text-white hover:bg-red-600"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
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
