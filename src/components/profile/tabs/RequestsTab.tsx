import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Link as LinkIcon, Video as VideoIcon } from "lucide-react";
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
        const accessToken = localStorage.getItem("google_access_token");
        if (!accessToken) {
          toast({
            title: "Google access required",
            description: "Please connect your Google account to generate a Meet link",
            variant: "destructive",
          });
          return;
        }

        const session = sessionRequests.find(req => req.id === id);
        const start = new Date(`${session.date}T${session.time.split(' - ')[0]}:00`);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        const edgeRes = await fetch("https://rojydqsndhoielitdquu.functions.supabase.co/create-google-meet-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: accessToken,
            summary: `Learning Session: ${session.skill}`,
            description: `Google Meet for your session with ${session.from}`,
            start: start.toISOString(),
            end: end.toISOString(),
            attendees: [
              { email: session.student_email || "" },
              { email: session.teacher_email || "" }
            ].filter(a => a.email),
          }),
        });
        const edgeData = await edgeRes.json();
        if (!edgeRes.ok) {
          toast({
            title: "Google Meet Error",
            description: edgeData.error || "Could not create Meet link",
            variant: "destructive",
          });
          return;
        }

        const meetingLink = edgeData.meetLink;

        const { data, error } = await supabase
          .from('sessions')
          .update({ 
            status: 'accepted',
            meeting_link: meetingLink
          })
          .eq('id', id)
          .select();

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const acceptedSession = { ...data[0] };
          window.dispatchEvent(new CustomEvent('sessionAccepted', { detail: acceptedSession }));
        }

        toast({
          title: "Request accepted",
          description: "The session has been added to your schedule.",
        });
      } else {
        console.log("Declining request with ID:", id);
        const { error } = await supabase
          .from('sessions')
          .update({ status: 'declined' })
          .eq('id', id);

        if (error) {
          console.error("Database error when declining:", error);
          throw error;
        }

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
        description: `Failed to ${action} request. Please try again.`,
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
