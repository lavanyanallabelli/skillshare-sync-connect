import React, { memo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Link as LinkIcon, Video as VideoIcon, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "../common/ProfileUIComponents";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";

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
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState<boolean>(false);

  useEffect(() => {
    const fetchGoogleAccessToken = async () => {
      if (!isLoggedIn || !userId) return;

      try {
        console.log("Fetching Google access token for user:", userId);
        
        // First try to get from localStorage for fast startup
        const localToken = localStorage.getItem("google_access_token");
        if (localToken) {
          console.log("Found token in localStorage");
          setGoogleAccessToken(localToken);
          setIsGoogleConnected(true);
        }

        // Always fetch the latest token from database
        const { data, error } = await supabase
          .from('user_oauth_tokens')
          .select('access_token, updated_at')
          .eq('user_id', userId)
          .eq('provider', 'google')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log("No Google token found in database");
            setIsGoogleConnected(false);
          } else {
            console.error("Error fetching Google access token:", error);
            toast({
              title: "Error",
              description: "Failed to verify Google connection. Please try reconnecting.",
              variant: "destructive",
            });
          }
          return;
        }

        if (data?.access_token) {
          console.log("Found token in database, updated at:", data.updated_at);
          setGoogleAccessToken(data.access_token);
          localStorage.setItem("google_access_token", data.access_token);
          setIsGoogleConnected(true);
        } else {
          console.log("No Google access token found in database");
          setIsGoogleConnected(false);
        }
      } catch (error) {
        console.error("Unexpected error fetching Google token:", error);
      }
    };

    fetchGoogleAccessToken();
  }, [isLoggedIn, userId, toast]);

  const refreshGoogleConnection = async () => {
    try {
      setIsRefreshingToken(true);
      toast({
        title: "Reconnecting with Google",
        description: "Please wait while we refresh your connection...",
      });
      
      // First try to see if we already have a session that can be refreshed
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session) {
        // Try to get a new session by refreshing the current one
        const { error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshError) {
          // Check if we got a new token
          const { data: newSession } = await supabase.auth.getSession();
          
          if (newSession?.session?.provider_token) {
            // Store the new token
            localStorage.setItem("google_access_token", newSession.session.provider_token);
            setGoogleAccessToken(newSession.session.provider_token);
            
            // Update the token in the database
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
      
      // If refreshing didn't work, we need to reconnect with Google
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
      
      // If we get a url property, redirect the user instead of waiting for auto-redirect
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

  const handleRequestAction = async (id: string, action: "accept" | "decline") => {
    try {
      if (action === "accept") {
        console.log("Accepting request:", id);
        
        // Check if user has Google connected
        if (!isGoogleConnected) {
          toast({
            title: "Google Calendar Required",
            description: "Please connect your Google account to generate a meeting link.",
            variant: "destructive",
          });
          // Offer to connect with Google
          if (window.confirm("Connect with Google to generate meeting links?")) {
            await connectWithGoogle();
          }
          return;
        }
        
        // First, try to get token from state or local storage
        let accessToken = googleAccessToken || localStorage.getItem("google_access_token");

        // If no token in state or local storage, fetch from database
        if (!accessToken) {
          console.log("No token in state or localStorage, fetching from database...");
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
            // Offer to connect with Google
            if (window.confirm("Connect with Google to generate meeting links?")) {
              await connectWithGoogle();
            }
            return;
          }

          accessToken = data.access_token;
          setGoogleAccessToken(accessToken);
          localStorage.setItem("google_access_token", accessToken);
          console.log("Retrieved token from database");
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
        
        console.log("Processing session:", session);
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
          
          // Handle token expiration more explicitly
          if (edgeData.error_code === 'token_expired' || 
              edgeData.details?.error?.message?.includes('invalid_grant') || 
              edgeData.details?.error?.message?.includes('Invalid Credentials')) {
            toast({
              title: "Google Token Expired",
              description: "Your Google authorization has expired. Please reconnect your account.",
              variant: "destructive",
            });
            // Clear invalid token
            localStorage.removeItem("google_access_token");
            setGoogleAccessToken(null);
            setIsGoogleConnected(false);
            
            // Offer to reconnect
            if (window.confirm("Reconnect with Google to generate meeting links?")) {
              await connectWithGoogle();
            }
            return;
          }
          
          // Handle permission issues
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
          {!isGoogleConnected ? (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm font-medium mb-2">Google Calendar Not Connected</p>
              <p className="text-yellow-700 text-xs mb-2">
                You need to connect your Google account to generate meeting links when accepting sessions.
              </p>
              <Button size="sm" variant="outline" onClick={connectWithGoogle} className="bg-white">
                Connect Google Account
              </Button>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-green-800 text-sm font-medium">Google Calendar Connected</p>
                  <p className="text-green-700 text-xs">
                    You can now generate Google Meet links when accepting sessions.
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={refreshGoogleConnection} 
                  className="bg-white"
                  disabled={isRefreshingToken}
                >
                  {isRefreshingToken ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>
          )}
          
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
