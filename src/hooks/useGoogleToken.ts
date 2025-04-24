
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGoogleToken = (userId: string | null, isLoggedIn: boolean) => {
  const { toast } = useToast();
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState<boolean>(false);

  const fetchGoogleAccessToken = async () => {
    if (!isLoggedIn || !userId) return;

    try {
      const localToken = localStorage.getItem("google_access_token");
      if (localToken) {
        setGoogleAccessToken(localToken);
        setIsGoogleConnected(true);
      }

      try {
        const { data, error } = await supabase
          .from('user_oauth_tokens')
          .select('*')
          .eq('user_id', userId)
          .eq('provider', 'google')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error("Error fetching Google access token:", error);
          toast({
            title: "Error",
            description: "Failed to verify Google connection. Please try reconnecting.",
            variant: "destructive",
          });
          return;
        }

        if (data && data.length > 0) {
          setGoogleAccessToken(data[0].access_token);
          localStorage.setItem("google_access_token", data[0].access_token);
          setIsGoogleConnected(true);
        } else {
          if (!localToken) {
            setIsGoogleConnected(false);
          }
        }
      } catch (dbError) {
        console.error("Database error when fetching token:", dbError);
        if (!localToken) {
          setIsGoogleConnected(false);
        }
      }
    } catch (error) {
      console.error("Unexpected error fetching Google token:", error);
    }
  };

  return {
    googleAccessToken,
    isGoogleConnected,
    isRefreshingToken,
    setIsRefreshingToken,
    fetchGoogleAccessToken,
    setGoogleAccessToken,
    setIsGoogleConnected
  };
};
