
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Flag } from "lucide-react";
import { useAuth } from "@/App";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ReportDialogProps {
  reportedUserId: string;
  reportedUserName: string;
  isTeacher?: boolean;
  className?: string;
}

const ReportDialog: React.FC<ReportDialogProps> = ({ 
  reportedUserId, 
  reportedUserName,
  isTeacher = false,
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { userId } = useAuth();

  // Only show the report button for learners reporting teachers
  if (!isTeacher) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the report",
        variant: "destructive"
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to report a user",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: userId,
          reported_user_id: reportedUserId,
          reason: reason.trim()
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for your report. We will review it shortly."
      });
      setOpen(false);
      setReason('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <Dialog open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className={`absolute top-4 right-4 h-8 w-8 rounded-full ${className}`}
              >
                <Flag className="h-4 w-4 text-destructive" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Report Teacher</p>
          </TooltipContent>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report {reportedUserName}</DialogTitle>
              <DialogDescription>
                Please provide details about why you're reporting this teacher.
                Reports are reviewed by our moderation team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Describe the issue..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  Submit Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ReportDialog;
