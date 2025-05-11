import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface ScheduleTabProps {
  userId: string | null;
  upcomingSessions: any[];
  sessionRequests: any[];
  setSessionRequests: (requests: any[]) => void;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ userId, upcomingSessions, sessionRequests, setSessionRequests }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const availableTimes = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  const handleRequestSession = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to request a session.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please select a date and time for the session.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "Could not identify the current user.",
          variant: "destructive",
        });
        return;
      }

      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('sessions')
        .insert([
          {
            student_id: user.id,
            teacher_id: userId,
            day: formattedDate,
            time: selectedTime,
            notes: additionalNotes,
            status: 'pending',
          },
        ]);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Session Requested",
        description: "Your session request has been submitted.",
      });

      setSelectedDate(undefined);
      setSelectedTime("");
      setAdditionalNotes("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to request session.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptRequest = async (session: any) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status: 'accepted' })
        .eq('id', session.id);

      if (error) throw error;

      setSessionRequests(prevRequests => prevRequests.filter(req => req.id !== session.id));
      toast({
        title: "Session Accepted",
        description: "You have accepted the session request.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept session request.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineRequest = async (session: any) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', session.id);

      if (error) throw error;

      setSessionRequests(prevRequests => prevRequests.filter(req => req.id !== session.id));
      toast({
        title: "Session Declined",
        description: "You have declined the session request.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to decline session request.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request a Session</CardTitle>
          <CardDescription>Select a date and time to request a session.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time">Time</Label>
            <Select onValueChange={setSelectedTime} disabled={isSubmitting}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {availableTimes.map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any specific topics you'd like to cover?"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto bg-skill-purple hover:bg-skill-purple-dark" onClick={handleRequestSession} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Request Session"}
          </Button>
        </CardFooter>
      </Card>

      <div>
        <h3 className="text-xl font-bold mb-4">Upcoming Sessions</h3>
        {upcomingSessions.length > 0 ? (
          <div className="grid gap-4">
            {upcomingSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle>Session with {session.from}</CardTitle>
                  <CardDescription>
                    {format(new Date(session.day), 'PPP')} at {session.time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Notes: {session.notes || "No notes provided."}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No upcoming sessions scheduled.</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Session Requests</h3>
        {sessionRequests.length > 0 ? (
          <div className="grid gap-4">
            {sessionRequests.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle>Session Request from {session.from}</CardTitle>
                  <CardDescription>
                    {format(new Date(session.day), 'PPP')} at {session.time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Notes: {session.notes || "No notes provided."}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => handleDeclineRequest(session)}>
                    Decline
                  </Button>
                  <Button onClick={() => handleAcceptRequest(session)}>Accept</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No pending session requests.</p>
        )}
      </div>
    </div>
  );
};

export default ScheduleTab;
