
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "../common/ProfileUIComponents";

interface RequestsTabProps {
  sessionRequests: any[];
  setSessionRequests: React.Dispatch<React.SetStateAction<any[]>>;
}

const RequestsTab: React.FC<RequestsTabProps> = ({ sessionRequests, setSessionRequests }) => {
  const { toast } = useToast();

  const handleRequestAction = (id: number, action: "accept" | "decline") => {
    toast({
      title: action === "accept" ? "Request accepted" : "Request declined",
      description: action === "accept"
        ? "The session has been added to your schedule"
        : "The request has been declined",
    });

    // Fix: properly typing the function to match React.Dispatch<React.SetStateAction<any[]>>
    setSessionRequests((prevRequests) => prevRequests.filter(request => request.id !== id));
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
                <div
                  key={request.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.avatar} alt="User avatar" />
                      <AvatarFallback>
                        {request.from.split(" ").map((n: string) => n[0]).join("")}
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
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestAction(request.id, "decline")}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRequestAction(request.id, "accept")}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
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

export default RequestsTab;
