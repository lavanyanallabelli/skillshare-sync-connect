
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleToken } from "@/hooks/useGoogleToken";
import { useRequestActions } from "@/hooks/useRequestActions";
import GoogleConnectionStatus from "./requests/GoogleConnectionStatus";
import RequestsList from "./requests/RequestsList";

interface RequestsTabProps {
  sessionRequests: any[];
  setSessionRequests: React.Dispatch<React.SetStateAction<any[]>>;
  userId: string;
}

const RequestsTab: React.FC<RequestsTabProps> = ({ 
  sessionRequests, 
  setSessionRequests, 
  userId 
}) => {
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  
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

  const { handleRequestAction, processingRequestId } = useRequestActions(
    userId,
    setSessionRequests,
    googleAccessToken,
    isGoogleConnected,
    connectWithGoogle
  );

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
  }, [isGoogleConnected, handleRequestAction]);

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
          
          <RequestsList
            requests={sessionRequests}
            userId={userId}
            onAccept={(id) => handleRequestAction(id, "accept")}
            onDecline={(id) => handleRequestAction(id, "decline")}
            processingRequestId={processingRequestId}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(RequestsTab);
