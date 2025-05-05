import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRequestActions = (
  userId: string,
  setSessionRequests: React.Dispatch<React.SetStateAction<any[]>>,
  googleAccessToken: string | null,
  isGoogleConnected: boolean,
  connectWithGoogle: () => Promise<void>
) => {
  const { toast } = useToast();
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const handleRequestAction = async (id: string, action: "accept" | "decline") => {
    try {
      setProcessingRequestId(id);
      
      // Get session details first to create appropriate notification
      const { data: sessionDetails } = await supabase
        .from('sessions')
        .select('*, student_id, teacher_id, skill, day, time_slot')
        .eq('id', id)
        .single();
      
      if (!sessionDetails) {
        console.error("Could not find session with id:", id);
        return;
      }

      if (action === "accept") {
        console.log('[RequestActions] Accepting request, checking Google connection...');
        console.log('[RequestActions] isGoogleConnected:', isGoogleConnected);
        
        if (!isGoogleConnected) {
          console.warn('[RequestActions] Google not connected: isGoogleConnected is false');
          toast({
            title: "Google Calendar Required",
            description: "Please connect your Google account to generate a meeting link.",
            variant: "destructive",
          });
          
          sessionStorage.setItem("pendingRequestId", id);
          sessionStorage.setItem("pendingRequestAction", "accept");
          
          toast({
            title: "Action Required",
            description: "Redirecting to Google authorization...",
          });
          
          setTimeout(() => {
            connectWithGoogle();
          }, 1500);
          
          return;
        }
        
        let accessToken = googleAccessToken || localStorage.getItem("google_access_token");
        console.log('[RequestActions] Initial accessToken:', accessToken ? accessToken.substring(0, 10) + '...' : 'None');
        
        if (!accessToken) {
          try {
            const { data, error } = await supabase
              .from('user_oauth_tokens')
              .select('access_token')
              .eq('user_id', userId)
              .eq('provider', 'google')
              .single();

            if (error || !data?.access_token) {
              console.error("[RequestActions] Failed to get Google token from DB:", error);
              
              sessionStorage.setItem("pendingRequestId", id);
              sessionStorage.setItem("pendingRequestAction", "accept");
              
              toast({
                title: "Google Access Required",
                description: "Redirecting to Google authorization...",
              });
              
              setTimeout(() => {
                connectWithGoogle();
              }, 1500);
              
              return;
            }

            accessToken = data.access_token;
            localStorage.setItem("google_access_token", accessToken);
            console.log("[RequestActions] Retrieved token from database:", accessToken.substring(0, 10) + "...");
          } catch (dbError) {
            console.error("[RequestActions] Database error when fetching token:", dbError);
            return;
          }
        }

        if (!accessToken) {
          console.error('[RequestActions] No Google access token found after all attempts.');
          toast({
            title: "Authentication Error",
            description: "Could not retrieve Google token. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const { data: sessionResult } = await supabase.auth.getSession();
        const userSession = sessionResult.session;
        
        if (!userSession) {
          toast({
            title: "Authentication Error",
            description: "User session not found. Please try logging in again.",
            variant: "destructive",
          });
          return;
        }

        const session = await supabase
          .from('sessions')
          .select('*')
          .eq('id', id)
          .single();

        if (!session.data) {
          console.error("Session not found:", id);
          toast({
            title: "Error",
            description: "Session not found. Please refresh and try again.",
            variant: "destructive",
          });
          return;
        }
        
        // Get time slot from the correct property
        const timeSlot = session.data.time_slot || "";
        const startTime = timeSlot.includes(" - ") ? timeSlot.split(" - ")[0] : timeSlot;
        
        if (!session.data.day) {
          console.error("No date information found in session:", session.data);
          toast({
            title: "Error",
            description: "Session date information is missing. Please contact support.",
            variant: "destructive",
          });
          return;
        }
        
        const dateString = session.data.day;
        const timeString = startTime + ":00";
        
        console.log("Creating calendar event with:", {
          date: dateString,
          time: timeString
        });
        
        const start = new Date(`${dateString}T${timeString}`);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        console.log("Calling edge function with data:", {
          start: start.toISOString(),
          end: end.toISOString(),
          access_token_length: accessToken ? accessToken.length : 0,
          token_preview: accessToken ? `${accessToken.substring(0, 10)}...` : "No token",
        });

        toast({
          title: "Creating Google Meet link",
          description: "Please wait while we generate your meeting...",
        });
        
        // Get participant information using the session data
        const { data: teacherData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', session.data.teacher_id)
          .single();
          
        const { data: studentData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', session.data.student_id)
          .single();

        // Fetch participant emails using the new get_user_email function
        const { data: teacherEmailData, error: teacherEmailError } = await supabase.rpc('get_user_email', { user_id: session.data.teacher_id });
        const { data: studentEmailData, error: studentEmailError } = await supabase.rpc('get_user_email', { user_id: session.data.student_id });

        if (teacherEmailError || studentEmailError) {
          console.error("Error fetching emails:", { teacherEmailError, studentEmailError });
          toast({
            title: "Email Retrieval Error",
            description: "Could not retrieve participant emails.",
            variant: "destructive",
          });
          return;
        }

        const teacherEmail = teacherEmailData;
        const studentEmail = studentEmailData;

        const teacherName = teacherData ? `${teacherData.first_name} ${teacherData.last_name}` : "Teacher";
        const studentName = studentData ? `${studentData.first_name} ${studentData.last_name}` : "Student";

        const edgeRes = await fetch("https://rojydqsndhoielitdquu.functions.supabase.co/create-google-meet-link", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userSession.access_token}`
          },
          body: JSON.stringify({
            access_token: accessToken,
            summary: `Learning Session: ${session.data.skill}`,
            description: `Google Meet for your session with ${studentName}`,
            start: start.toISOString(),
            end: end.toISOString(),
            attendees: [
              { email: studentEmail || "" },
              { email: teacherEmail || "" }
            ].filter(a => a.email),
          }),
        });
        
        if (!edgeRes.ok) {
          const edgeData = await edgeRes.json();
          console.error("Edge function error:", edgeData);
          
          if (edgeData.error_code === 'token_expired' || 
              edgeData.details?.error?.message?.includes('invalid_grant') || 
              edgeData.details?.error?.message?.includes('Invalid Credentials')) {
            toast({
              title: "Google Token Expired",
              description: "Redirecting to reconnect your Google account...",
              variant: "destructive",
            });
            
            localStorage.removeItem("google_access_token");
            
            sessionStorage.setItem("pendingRequestId", id);
            sessionStorage.setItem("pendingRequestAction", "accept");
            
            setTimeout(() => {
              connectWithGoogle();
            }, 1500);
            
            return;
          }
          
          if (edgeData.error_code === 'insufficient_permissions' || 
              edgeData.details?.error?.message?.includes('insufficient permission')) {
            sessionStorage.setItem("pendingRequestId", id);
            sessionStorage.setItem("pendingRequestAction", "accept");
            
            toast({
              title: "Insufficient Permissions",
              description: "Redirecting to reconnect with proper permissions...",
              variant: "destructive",
            });
            
            setTimeout(() => {
              connectWithGoogle();
            }, 1500);
            
            return;
          }
          
          toast({
            title: "Google Meet Error",
            description: edgeData.error || "Could not create Meet link",
            variant: "destructive",
          });
          return;
        }

        const edgeData = await edgeRes.json();
        console.log("Edge function response:", edgeData);
        
        if (!edgeData.meetLink) {
          console.error("No meet link in response:", edgeData);
          toast({
            title: "Google Meet Error",
            description: "No meeting link was returned from Google",
            variant: "destructive",
          });
          return;
        }

        const meetingLink = edgeData.meetLink;

        try {
          const { data, error } = await supabase
            .from('sessions')
            .update({ 
              status: 'accepted',
              meeting_link: meetingLink
            })
            .eq('id', id)
            .select();

          if (error) {
            console.error("Database error:", error);
            throw error;
          }

          if (data && data.length > 0) {
            const acceptedSession = { ...data[0] };
            console.log("Session accepted:", acceptedSession);
            window.dispatchEvent(new CustomEvent('sessionAccepted', { detail: acceptedSession }));
            
            // Create notification for the student about accepted session
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert({
                user_id: acceptedSession.student_id,
                type: 'session',
                title: 'Session Request Accepted',
                description: `Your session request for ${acceptedSession.skill} on ${acceptedSession.day} at ${acceptedSession.time_slot} has been accepted`,
                action_url: '/sessions',
                read: false,
                created_at: new Date().toISOString()
              });

            if (notificationError) {
              console.error("Error creating notification for session acceptance:", notificationError);
            } else {
              console.log("Notification created for session acceptance");
            }
            
            toast({
              title: "Request accepted",
              description: "The session has been added to your schedule with a Google Meet link.",
            });
            
            setSessionRequests((prevRequests) => prevRequests.filter(request => request.id !== id));
          }
        } catch (dbError) {
          console.error("Database error when updating session:", dbError);
          toast({
            title: "Database Error",
            description: "Could not update session status. Please try again.",
            variant: "destructive",
          });
          return;
        }
      } else {
        console.log("Declining request with ID:", id);
        try {
          const { error } = await supabase
            .from('sessions')
            .update({ status: 'declined' })
            .eq('id', id);

          if (error) {
            console.error("Database error when declining:", error);
            throw error;
          }
          
          // Create notification for the student about declined session
          if (sessionDetails) {
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert({
                user_id: sessionDetails.student_id,
                type: 'session',
                title: 'Session Request Declined',
                description: `Your session request for ${sessionDetails.skill} on ${sessionDetails.day} at ${sessionDetails.time_slot} has been declined`,
                action_url: '/sessions',
                read: false,
                created_at: new Date().toISOString()
              });

            if (notificationError) {
              console.error("Error creating notification for session decline:", notificationError);
            } else {
              console.log("Notification created for session decline");
            }
          }

          toast({
            title: "Request declined",
            description: "The request has been declined",
          });
          
          setSessionRequests((prevRequests) => prevRequests.filter(request => request.id !== id));
        } catch (dbError) {
          console.error("Database error when declining session:", dbError);
          toast({
            title: "Error",
            description: "Could not decline session. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error handling request:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} request. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setProcessingRequestId(null);
    }
  };

  return {
    handleRequestAction,
    processingRequestId
  };
};
