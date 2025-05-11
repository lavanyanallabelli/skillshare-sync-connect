import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ReportDialogProps {
  userIdToReport: string;
}

const ReportDialog: React.FC<ReportDialogProps> = ({ userIdToReport }) => {
  const { userId } = useAuth();

  const handleReport = () => {
    // Implement your reporting logic here
    console.log(`Reporting user ${userIdToReport} from user ${userId}`);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="text-red-600 hover:text-red-800">Report</button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will submit a report for this user.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReport}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReportDialog;
