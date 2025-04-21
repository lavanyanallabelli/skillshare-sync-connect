
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Video as VideoIcon, Link as LinkIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "../common/ProfileUIComponents";

interface SessionsTabProps {
  upcomingSessions: any[];
}

const SessionCard = ({ session }: { session: any }) => {
  const openMeetingLink = () => {
    if (session.meeting_link) {
      window.open(session.meeting_link, '_blank');
    }
  };

  const copyMeetingLink = () => {
    if (session.meeting_link) {
      navigator.clipboard.writeText(session.meeting_link);
      // Toast is handled by the copy button itself
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={session.avatar} alt="User avatar" />
                <AvatarFallback>
                  {session.student_name ? session.student_name.split(" ").map((n: string) => n[0]).join("") : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{session.student_name || "Student"}</h4>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Badge variant="outline" className="mr-2">
                    {session.skill}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {session.day}, {session.time_slot}
                </p>
              </div>
            </div>
          </div>

          {session.meeting_link && (
            <div className="mt-4 space-y-3">
              <h5 className="text-sm font-medium flex items-center">
                <VideoIcon className="h-4 w-4 mr-2" /> Meeting Link
              </h5>
              <div className="flex items-center gap-2">
                <div className="bg-muted p-2 rounded text-sm flex-1 truncate">
                  {session.meeting_link}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="flex-shrink-0"
                  onClick={copyMeetingLink}
                  title="Copy link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="flex-shrink-0"
                  onClick={openMeetingLink}
                >
                  Join
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SessionsTab: React.FC<SessionsTabProps> = ({ upcomingSessions }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <EmptyState 
              message="No upcoming sessions" 
              subMessage="Accept session requests to schedule meetings"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionsTab;
