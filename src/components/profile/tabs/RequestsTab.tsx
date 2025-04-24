import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import { EmptyState } from "../common/ProfileUIComponents";
import { RequestCard } from "./requests/RequestCard";
import { GoogleConnectionStatus } from "./requests/GoogleConnectionStatus";
import { useGoogleToken } from "@/hooks/useGoogleToken";

interface RequestsTabProps {
  sessionRequests: any[];
  setSessionRequests: React.Dispatch<React.SetStateAction<any[]>>;
  userId: string;
}

const RequestsTab: React.FC<RequestsTabProps> = ({ sessionRequests, setSessionRequests, userId }) => {
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const {
    googleAccessToken,
    isGoogleConnected,
    isRefreshingToken,
    setIsRefreshingToken,
    fetchGoogleAccessToken,
    setGoogleAccessToken,
    setIsGoogleConnected
  } = useGoogleToken(userId, isLoggedIn);

  const connectWithGoogle = async () => {
    try {
      toast({
        title: "Connecting to Google",
        description: "You will be redirected to authorize with Google...",
      });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`,
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
      if (action === "accept") {
        if (!isGoogleConnected) {
          toast({
            title: "Google Calendar Required",
            description: "Please connect your Google account to generate a meeting link.",
            variant: "destructive",
          });
          if (window.confirm("Connect with Google to generate meeting links?")) {
            await connectWithGoogle();
          }
          return;
        }
        
        let accessToken = googleAccessToken || localStorage.getItem("google_access_token");
        
        if (!accessToken) {
          try {
            const { data, error } = await supabase
              .from('user_oauth_tokens')
              .select('access_token')
              .eq('user_id', userId)
              .eq('provider', 'google')
              .single();

            if (error || !data?.access_token) {
              console.error("Failed to get Google token:", error);
              toast({
                title: "Google access required",
                description: "Please connect your Google account to generate a Meet link",
                variant: "destructive",
              });
              if (window.confirm("Connect with Google to generate meeting links?")) {
                await connectWithGoogle();
              }
              return;
            }

            accessToken = data.access_token;
            setGoogleAccessToken(accessToken);
            localStorage.setItem("google_access_token", accessToken);
            console.log("Retrieved token from database");
          } catch (dbError) {
            console.error("Database error when fetching token:", dbError);
            toast({
              title: "Error",
              description: "Could not retrieve your Google token. Please reconnect your account.",
              variant: "destructive",
            });
            return;
          }
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
        
        const start = new Date(`${session.date}T${session.time.split(' - ')[0]}:00`);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        console.log("Calling edge function with data:", {
          start: start.toISOString(),
          end: end.toISOString(),
          access_token: accessToken ? "Token provided" : "No token",
        });

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
        
        if (!edgeRes.ok) {
          const edgeData = await edgeRes.json();
          console.error("Edge function error:", edgeData);
          
          if (edgeData.error_code === 'token_expired' || 
              edgeData.details?.error?.message?.includes('invalid_grant') || 
              edgeData.details?.error?.message?.includes('Invalid Credentials')) {
            toast({
              title: "Google Token Expired",
              description: "Your Google authorization has expired. Please reconnect your account.",
              variant: "destructive",
            });
            localStorage.removeItem("google_access_token");
            setGoogleAccessToken(null);
            setIsGoogleConnected(false);
            
            if (window.confirm("Reconnect with Google to generate meeting links?")) {
              await connectWithGoogle();
            }
            return;
          }
          
          if (edgeData.error_code === 'insufficient_permissions' || 
              edgeData.details?.error?.message?.includes('insufficient permission')) {
            toast({
              title: "Insufficient Permissions",
              description: "Your Google account doesn't have calendar permissions. Please reconnect.",
              variant: "destructive",
            });
            
            if (window.confirm("Reconnect with Google Calendar permissions?")) {
              await connectWithGoogle();
            }
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
          }

          toast({
            title: "Request accepted",
            description: "The session has been added to your schedule.",
          });
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
