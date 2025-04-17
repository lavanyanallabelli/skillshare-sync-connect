
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "lucide-react";

interface SessionCardProps {
  session: any;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => (
  <div className="flex items-center justify-between border rounded-lg p-4">
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={session.avatar} alt="User avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div>
        <h4 className="font-medium">{session.with}</h4>
        <div className="flex items-center text-sm text-muted-foreground">
          <Badge variant="outline" className="mr-2">
            {session.role === "teacher" ? "Teaching" : "Learning"}
          </Badge>
          {session.skill}
        </div>
        <p className="text-sm text-muted-foreground flex items-center mt-1">
          <CalendarIcon className="h-3 w-3 mr-1" />
          {session.date}, {session.time}
        </p>
      </div>
    </div>
    <Button variant="outline" size="sm">
      Join
    </Button>
  </div>
);

interface EmptyStateProps {
  message: string;
  subMessage: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, subMessage }) => (
  <div className="text-center py-8 text-muted-foreground">
    <p>{message}</p>
    <p className="text-sm mt-2">{subMessage}</p>
  </div>
);
