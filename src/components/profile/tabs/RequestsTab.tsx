
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "../common/ProfileUIComponents";
import { supabase } from "@/integrations/supabase/client";
import { generateMeetLink } from "@/utils/meetingUtils";

interface RequestsTabProps {
  sessionRequests: any[];
  setSessionRequests: React.Dispatch<React.SetStateAction<any[]>>;
  userId: string;
}

const RequestCard = memo(({ request, userId, onAccept, onDecline }: { 
  request: any,
  userId: string,
  onAccept: () => void,
  onDecline: () => void
}) => {
  const isReceiver = request.teacher_id === userId;
  return (
    <div className="flex items-center justify-between border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={request.avatar} alt="User avatar" />
          <AvatarFallback>
            {request.from ? request.from.split(" ").map((n: string) => n[0]).join("") : "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium">{request.from}</h4>
          <div className="flex items-center text-sm text-muted-foreground">
            <Badge variant="outline" className="mr-2">
              {request.role === "teacher" ? "Teaching" : "Learning"}
            </Badge>
            {request.skill}
          </div>
          <p className="text-sm text-muted-foreground flex items-center mt-1">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {request.date}, {request.time}
          </p>
          {!isReceiver && (
            <p className="text-xs text-muted-foreground mt-2">
              Sent to: <span className="font-semibold">{request.teacher_name || request.teacher_id}</span>
            </p>
          )}
        </div>
      </div>
      {isReceiver ? (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={onAccept}>
            Accept
          </Button>
        </div>
      ) : null}
    </div>
  );
});

const RequestsTab: React.FC<RequestsTabProps> = ({ sessionRequests, setSessionRequests, userId }) => {
  const { toast } = useToast();

  const handleRequestAction = async (id: string, action: "accept" | "decline") => {
    try {
      if (action === "accept") {
        const meetingLink = generateMeetLink();
        // Update the session in the database
        const { data, error } = await supabase
          .from('sessions')
          .update({ 
            status: 'accepted',
            meeting_link: meetingLink
          })
          .eq('id', id)
          .select();

        if (error) throw error;

        // Add the accepted session to upcomingSessions in parent Profile (via window event)
        if (data && data.length > 0) {
          const acceptedSession = { ...data[0], meeting_link: meetingLink };
          window.dispatchEvent(new CustomEvent('sessionAccepted', { detail: acceptedSession }));
        }

        toast({
          title: "Request accepted",
          description: "The session has been added to your schedule and notifications have been sent.",
        });
      } else {
        const { error } = await supabase
          .from('sessions')
          .update({ status: 'declined' })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Request declined",
          description: "The request has been declined",
        });
      }

      setSessionRequests((prevRequests) => prevRequests.filter(request => request.id !== id));
    } catch (error) {
      console.error('Error handling request:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionRequests.length > 0 ? (
            <div className="space-y-4">
              {sessionRequests.map((request) => (
                <RequestCard 
                  key={request.id}
                  request={request}
                  userId={userId}
                  onAccept={() => handleRequestAction(request.id, "accept")}
                  onDecline={() => handleRequestAction(request.id, "decline")}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              message="No pending requests" 
              subMessage="New session requests will appear here"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(RequestsTab);
