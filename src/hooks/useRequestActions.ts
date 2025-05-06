import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase, createNotification } from "@/integrations/supabase/client";

// Helper function to convert time slot to a 24-hour format
const getTimeFromSlot = (timeSlot: string) => {
  const [time, period] = timeSlot.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0; // Midnight

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:00`;
};

export const useRequestActions = (
  userId: string | null,
  setSessionRequests: React.Dispatch<React.SetStateAction<any[]>>,
  googleAccessToken: string | null,
  isGoogleConnected: boolean,
  onConnectGoogle: () => void
) => {
  const { toast } = useToast();
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  // Update the handleRequestAction function to include notifications
  const handleRequestAction = useCallback(
    async (requestId: string, action: "accept" | "decline") => {
      if (!userId) {
        toast({
          title: "Authentication Required",
          description: "Please log in to handle session requests",
          variant: "destructive",
        });
        return;
      }

      setProcessingRequestId(requestId);

      try {
        // Step 1: Check Google connection status first
        if (action === "accept" && !isGoogleConnected) {
          console.log("[RequestActions] Google not connected for calendar integration");
          
          // Store the pending request details in session storage
          sessionStorage.setItem("pendingRequestId", requestId);
          sessionStorage.setItem("pendingRequestAction", action);
          
          // Trigger Google connection
          onConnectGoogle();
          return;
        }

        // Find the session request using fetch instead of local state
        const { data: requestsData } = await supabase
          .from("sessions")
          .select(`
            *, 
            student:profiles!student_id(id, first_name, last_name),
            teacher:profiles!teacher_id(id, first_name, last_name)
          `)
          .eq("id", requestId)
          .single();
          
        if (!requestsData) {
          console.error(`[RequestActions] Request not found: ${requestId}`);
          toast({
            title: "Error",
            description: "Session request not found. It may have been deleted.",
            variant: "destructive",
          });
          setProcessingRequestId(null);
          return;
        }
        
        const requestToUpdate = requestsData;
        console.log(`[RequestActions] Handling ${action} for session request:`, requestToUpdate);
        
        if (action === "accept") {
          // We need the student's email for the calendar invite
          // Since the email is not in the profiles table, we need to fetch it separately
          const { data: studentData, error: studentError } = await supabase
            .rpc('get_user_email', { user_id: requestToUpdate.student_id });
            
          if (studentError) {
            console.error("[RequestActions] Error fetching student email:", studentError);
            toast({
              title: "Error",
              description: "Failed to retrieve student email for calendar invite.",
              variant: "destructive",
            });
            setProcessingRequestId(null);
            return;
          }
          
          const studentEmail = studentData;
          
          // Create Google Meet link if accepting
          let meetingLink = "";

          try {
            // Create meeting link through Google Calendar API
            const meetResponse = await fetch(
              `https://rojydqsndhoielitdquu.supabase.co/functions/v1/create-google-meet-link`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${googleAccessToken}`,
                },
                body: JSON.stringify({
                  summary: `SkillSync Session: ${requestToUpdate.skill}`,
                  description: `Session between ${requestToUpdate.student?.first_name} and ${requestToUpdate.teacher?.first_name} for ${requestToUpdate.skill}`,
                  start: {
                    dateTime: `${requestToUpdate.day}T${getTimeFromSlot(requestToUpdate.time_slot)}`,
                  },
                  attendee_email: studentEmail,
                }),
              }
            );

            if (!meetResponse.ok) {
              throw new Error(`Failed to create meeting: ${meetResponse.statusText}`);
            }

            const meetData = await meetResponse.json();
            meetingLink = meetData.meetLink || "";
            console.log("[RequestActions] Created meeting link:", meetingLink);
          } catch (error) {
            console.error("[RequestActions] Error creating meeting:", error);
            toast({
              title: "Meeting Creation Failed",
              description: "Failed to create meeting link. Please try again.",
              variant: "destructive",
            });
            setProcessingRequestId(null);
            return;
          }

          // Update session status to accepted with meeting link
          const { error: updateError } = await supabase
            .from("sessions")
            .update({
              status: "accepted",
              meeting_link: meetingLink,
            })
            .eq("id", requestId);

          if (updateError) {
            console.error("[RequestActions] Error updating session:", updateError);
            toast({
              title: "Error",
              description: "Failed to accept session request. Please try again.",
              variant: "destructive",
            });
            setProcessingRequestId(null);
            return;
          }

          // Create notification for the student
          await createNotification(
            requestToUpdate.student_id,
            'session',
            'Session Request Accepted',
            `Your session for ${requestToUpdate.skill} has been accepted. Click to view details.`,
            `/sessions`
          );

          toast({
            title: "Success",
            description: "Session request accepted. A calendar invitation has been sent.",
          });
        } else if (action === "decline") {
          // Update session status to declined
          const { error: updateError } = await supabase
            .from("sessions")
            .update({ status: "declined" })
            .eq("id", requestId);

          if (updateError) {
            console.error("[RequestActions] Error declining session:", updateError);
            toast({
              title: "Error",
              description: "Failed to decline session request. Please try again.",
              variant: "destructive",
            });
            setProcessingRequestId(null);
            return;
          }

          // Create notification for the student
          await createNotification(
            requestToUpdate.student_id,
            'session',
            'Session Request Declined',
            `Your session request for ${requestToUpdate.skill} was declined. Browse other teachers for this skill.`,
            `/skills/${encodeURIComponent(requestToUpdate.skill)}`
          );

          toast({
            title: "Success",
            description: "Session request has been declined.",
          });
        }

        // Update local state
        setSessionRequests((prev) =>
          prev.filter((request) => request.id !== requestId)
        );
      } catch (error) {
        console.error("[RequestActions] Error handling request action:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setProcessingRequestId("");
      }
    },
    [
      userId,
      googleAccessToken,
      isGoogleConnected,
      onConnectGoogle,
      toast,
      setSessionRequests,
    ]
  );

  return { handleRequestAction, processingRequestId };
};
