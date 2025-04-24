
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoogleToken = (userId: string | null, isLoggedIn: boolean) => {
  const { toast } = useToast();
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchGoogleAccessToken = useCallback(async () => {
    if (!isLoggedIn || !userId) {
      console.log("[useGoogleToken] Not logged in or no user ID, skipping token fetch");
      return;
    }

    try {
      console.log("[useGoogleToken] Fetching Google token for user:", userId);
      
      // First check localStorage
      const localToken = localStorage.getItem("google_access_token");
      if (localToken) {
        console.log("[useGoogleToken] Found token in localStorage");
        setGoogleAccessToken(localToken);
        setIsGoogleConnected(true);
      } else {
        console.log("[useGoogleToken] No token in localStorage");
      }

      // Then get the latest from the database
      try {
        const { data, error } = await supabase
          .from('user_oauth_tokens')
          .select('*')
          .eq('user_id', userId)
          .eq('provider', 'google')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error("[useGoogleToken] Error fetching Google access token from DB:", error);
          toast({
            title: "Error",
            description: "Failed to verify Google connection. Please try reconnecting.",
            variant: "destructive",
          });
          return;
        }

        if (data && data.length > 0) {
          console.log("[useGoogleToken] Found token in database:", data[0].access_token.substring(0, 10) + "...");
          setGoogleAccessToken(data[0].access_token);
          localStorage.setItem("google_access_token", data[0].access_token);
          setIsGoogleConnected(true);
        } else {
          console.log("[useGoogleToken] No token found in database");
          if (!localToken) {
            setIsGoogleConnected(false);
          }
        }
      } catch (dbError) {
        console.error("[useGoogleToken] Database error when fetching token:", dbError);
        if (!localToken) {
          setIsGoogleConnected(false);
        }
      }
      
      setLastChecked(new Date());
    } catch (error) {
      console.error("[useGoogleToken] Unexpected error fetching Google token:", error);
    }
  }, [isLoggedIn, userId, toast]);

  // Check for token on component mount and when userId changes
  useEffect(() => {
    fetchGoogleAccessToken();
  }, [fetchGoogleAccessToken]);

  // Listen for auth state changes that might affect Google tokens
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("[useGoogleToken] Auth state changed:", event);
          // Wait a moment for other auth handlers to complete
          setTimeout(() => {
            fetchGoogleAccessToken();
          }, 500);
        } else if (event === 'SIGNED_OUT') {
          setGoogleAccessToken(null);
          setIsGoogleConnected(false);
          localStorage.removeItem("google_access_token");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchGoogleAccessToken]);

  return {
    googleAccessToken,
    isGoogleConnected,
    isRefreshingToken,
    setIsRefreshingToken,
    fetchGoogleAccessToken,
    setGoogleAccessToken,
    setIsGoogleConnected,
    lastChecked
  };
};
