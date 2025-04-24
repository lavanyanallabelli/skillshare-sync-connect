
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Loader2 } from "lucide-react";

interface RequestCardProps {
  request: any;
  userId: string;
  onAccept: () => void;
  onDecline: () => void;
  isProcessing?: boolean;
}

const RequestCard: React.FC<RequestCardProps> = ({ 
  request, 
  userId, 
  onAccept, 
  onDecline,
  isProcessing = false 
}) => {
  const isReceiver = request.teacher_id === userId;
  
  // Generate a display name from teacher_id or teacher_name
  const getDisplayName = () => {
    if (request.teacher_name) return request.teacher_name;
    if (request.teacher_id) return request.teacher_id.substring(0, 8);
    return "Unknown";
  };
  
  return (
    <div className="flex items-center justify-between border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={request.avatar} alt="User avatar" />
          <AvatarFallback>
            {request.student_name 
              ? request.student_name.split(" ").map((n: string) => n[0]).join("") 
              : "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium">{request.student_name || "Student"}</h4>
          <div className="flex items-center text-sm text-muted-foreground">
            <Badge variant="outline" className="mr-2">
              {request.role === "teacher" ? "Teaching" : "Learning"}
            </Badge>
            {request.skill}
          </div>
          <p className="text-sm text-muted-foreground flex items-center mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            {request.day}, {request.time_slot}
          </p>
          {!isReceiver && (
            <p className="text-xs text-muted-foreground mt-2">
              Sent to: <span className="font-semibold">{getDisplayName()}</span>
            </p>
          )}
        </div>
      </div>
      {isReceiver && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDecline} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            Decline
          </Button>
          <Button size="sm" onClick={onAccept} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            Accept
          </Button>
        </div>
      )}
    </div>
  );
};

export default React.memo(RequestCard);
