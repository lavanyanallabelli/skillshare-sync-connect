import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import { EmptyState } from "../common/ProfileUIComponents";
import RequestCard from "./requests/RequestCard";
import GoogleConnectionStatus from "./requests/GoogleConnectionStatus";
import { useGoogleToken } from "@/hooks/useGoogleToken";

interface RequestsTabProps {
  sessionRequests: any[];
  setSessionRequests: React.Dispatch<React.SetStateAction<any[]>>;
  userId: string;
}

const RequestsTab: React.FC<RequestsTabProps> = ({ sessionRequests, setSessionRequests, userId }) => {
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  
  const {
    googleAccessToken,
    isGoogleConnected,
    isRefreshingToken,
    setIsRefreshingToken,
    fetchGoogleAccessToken,
    setGoogleAccessToken,
    setIsGoogleConnected,
    lastChecked
  } = useGoogleToken(userId, isLoggedIn);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (isLoggedIn && userId) {
        fetchGoogleAccessToken();
      }
    }, 60000);
    
    return () => clearInterval(checkInterval);
  }, [isLoggedIn, userId, fetchGoogleAccessToken]);
  
  useEffect(() => {
    console.log("[RequestsTab] Google connection status:", {
      isGoogleConnected,
      tokenLength: googleAccessToken ? googleAccessToken.length : 0,
      tokenPreview: googleAccessToken ? `${googleAccessToken.substring(0, 10)}...` : "No token",
      lastChecked: lastChecked ? lastChecked.toISOString() : null
    });
  }, [isGoogleConnected, googleAccessToken, lastChecked]);

  const connectWithGoogle = async () => {
    try {
      toast({
        title: "Connecting to Google",
        description: "You will be redirected to authorize with Google...",
      });
      
      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem("authRedirectPath", currentPath);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile?tab=requests`,
          scopes: 'https://www.googleapis.com/auth/calendar',
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Google connection error:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect with Google",
        variant: "destructive",
      });
    }
  };

  const refreshGoogleConnection = async () => {
    try {
      setIsRefreshingToken(true);
      toast({
        title: "Reconnecting with Google",
        description: "Please wait while we refresh your connection...",
      });
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshError) {
          const { data: newSession } = await supabase.auth.getSession();
          
          if (newSession?.session?.provider_token) {
            localStorage.setItem("google_access_token", newSession.session.provider_token);
            setGoogleAccessToken(newSession.session.provider_token);
            
            await supabase
              .from('user_oauth_tokens')
              .upsert({
                user_id: userId,
                provider: 'google',
                access_token: newSession.session.provider_token,
                refresh_token: newSession.session.provider_refresh_token || null,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id,provider'
              });
            
            setIsGoogleConnected(true);
            toast({
              title: "Google reconnected",
              description: "Your Google account has been successfully reconnected.",
            });
            
            return;
          }
        }
      }
      
      await connectWithGoogle();
      
    } catch (error) {
      console.error("Error refreshing Google connection:", error);
      toast({
        title: "Error",
        description: "Failed to refresh Google connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const handleRequestAction = async (id: string, action: "accept" | "decline") => {
    try {
      setProcessingRequestId(id);
      
      if (action === "accept") {
        console.log('[RequestsTab] Accepting request, checking Google connection...');
        console.log('[RequestsTab] isGoogleConnected:', isGoogleConnected);
        
        if (!isGoogleConnected) {
          console.warn('[RequestsTab] Google not connected: isGoogleConnected is false');
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
        console.log('[RequestsTab] Initial accessToken:', accessToken ? accessToken.substring(0, 10) + '...' : 'None');
        
        if (!accessToken) {
          try {
            const { data, error } = await supabase
              .from('user_oauth_tokens')
              .select('access_token')
              .eq('user_id', userId)
              .eq('provider', 'google')
              .single();

            if (error || !data?.access_token) {
              console.error("[RequestsTab] Failed to get Google token from DB:", error);
              
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
            setGoogleAccessToken(accessToken);
            localStorage.setItem("google_access_token", accessToken);
            console.log("[RequestsTab] Retrieved token from database:", accessToken.substring(0, 10) + "...");
          } catch (dbError) {
            console.error("[RequestsTab] Database error when fetching token:", dbError);
            
            sessionStorage.setItem("pendingRequestId", id);
            sessionStorage.setItem("pendingRequestAction", "accept");
            
            toast({
              title: "Error",
              description: "Could not retrieve your Google token. Redirecting to reconnect.",
              variant: "destructive",
            });
            
            setTimeout(() => {
              connectWithGoogle();
            }, 1500);
            
            return;
          }
        }

        if (!accessToken) {
          console.error('[RequestsTab] No Google access token found after all attempts.');
          toast({
            title: "Authentication Error",
            description: "Could not retrieve Google token. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const session = sessionRequests.find(req => req.id === id);
        if (!session) {
          console.error("Session not found:", id);
          toast({
            title: "Error",
            description: "Session not found. Please refresh and try again.",
            variant: "destructive",
          });
          return;
        }
        
        const timeSlot = session.time_slot || session.time || "";
        const startTime = timeSlot.includes(" - ") ? timeSlot.split(" - ")[0] : timeSlot;
        
        if (!session.day && !session.date) {
          console.error("No date information found in session:", session);
          toast({
            title: "Error",
            description: "Session date information is missing. Please contact support.",
            variant: "destructive",
          });
          return;
        }
        
        const dateString = session.day || session.date;
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

        const userSession = await supabase.auth.getSession().data.session;
        
        if (!userSession) {
          toast({
            title: "Authentication Error",
            description: "User session not found. Please try logging in again.",
            variant: "destructive",
          });
          return;
        }

        const edgeRes = await fetch("https://rojydqsndhoielitdquu.functions.supabase.co/create-google-meet-link", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userSession.access_token}`
          },
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
            setGoogleAccessToken(null);
            setIsGoogleConnected(false);
            
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

  useEffect(() => {
    const checkPendingRequest = async () => {
      const pendingId = sessionStorage.getItem("pendingRequestId");
      const pendingAction = sessionStorage.getItem("pendingRequestAction");
      
      if (pendingId && pendingAction && isGoogleConnected) {
        console.log("[RequestsTab] Found pending request to resume:", pendingId, pendingAction);
        
        sessionStorage.removeItem("pendingRequestId");
        sessionStorage.removeItem("pendingRequestAction");
        
        setTimeout(() => {
          handleRequestAction(pendingId, pendingAction as "accept" | "decline");
        }, 1000);
      }
    };
    
    if (isGoogleConnected) {
      checkPendingRequest();
    }
  }, [isGoogleConnected]);

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <GoogleConnectionStatus
            isGoogleConnected={isGoogleConnected}
            isRefreshingToken={isRefreshingToken}
            onConnect={connectWithGoogle}
            onRefresh={refreshGoogleConnection}
          />
          
          {sessionRequests.length > 0 ? (
            <div className="space-y-4">
              {sessionRequests.map((request) => (
                <RequestCard 
                  key={request.id}
                  request={request}
                  userId={userId}
                  onAccept={() => handleRequestAction(request.id, "accept")}
                  onDecline={() => handleRequestAction(request.id, "decline")}
                  isProcessing={processingRequestId === request.id}
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
