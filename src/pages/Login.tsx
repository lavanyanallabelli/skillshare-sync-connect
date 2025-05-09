import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import MainLayout from "@/components/layout/MainLayout";
import { Facebook, Mail, Github, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, refreshUserData } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authInProgress, setAuthInProgress] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const getGoogleAccessToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[Google OAuth] Supabase session:', session);
        
        if (session) {
          console.log('[Google OAuth] Supabase session after login:', session);
          
          // Check if this is a Google login
          const isGoogleLogin = session.user?.app_metadata?.provider === 'google' ||
                               session.user?.identities?.some(id => id.provider === 'google') || 
                               !!session.provider_refresh_token;
                               
          console.log('[Google OAuth] Is Google login:', isGoogleLogin);
          console.log('[Google OAuth] User metadata:', session.user?.user_metadata);
          
          // Save avatar URL from Google if available
          if (isGoogleLogin && session.user?.user_metadata?.avatar_url) {
            console.log('[Google OAuth] Avatar URL found:', session.user.user_metadata.avatar_url);
            
            // Update the user profile with the avatar URL
            const { error: avatarError } = await supabase
              .from('profiles')
              .update({ avatar_url: session.user.user_metadata.avatar_url })
              .eq('id', session.user.id);
              
            if (avatarError) {
              console.error('[Google OAuth] Error updating avatar URL:', avatarError);
            } else {
              console.log('[Google OAuth] Avatar URL updated in profile');
              refreshUserData();
            }
          }
          
          if (!session.provider_token) {
            console.warn('[Google OAuth] No provider_token found in session. Google OAuth may not be configured correctly in Supabase.');
          }
          
          // Store Google OAuth tokens only
          if (isGoogleLogin && session.provider_token) {
            // First store in localStorage for immediate availability
            localStorage.setItem("google_access_token", session.provider_token);
            console.log('[Google OAuth] Token saved to localStorage');
            
            try {
              const { error: tokenError } = await supabase
                .from('user_oauth_tokens')
                .upsert({
                  user_id: session.user.id,
                  provider: 'google',
                  access_token: session.provider_token,
                  refresh_token: session.provider_refresh_token || null,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id,provider'
                });

              if (tokenError) {
                console.error('[Google OAuth] Error storing token in database:', tokenError);
                toast({
                  title: "Warning",
                  description: "Failed to store Google token. Some features may not work correctly.",
                  variant: "destructive",
                });
              } else {
                console.log('[Google OAuth] Token successfully stored in database with provider: google');
              }
            } catch (dbError) {
              console.error('[Google OAuth] Database error:', dbError);
            }
          } else if (!isGoogleLogin) {
            console.log('[Google OAuth] Not a Google login; token not stored in database.');
          } else {
            console.warn('[Google OAuth] No Google access token found in session');
          }
        } else {
          console.warn('[Google OAuth] No Supabase session found');
        }
      } catch (error) {
        console.error('[Google OAuth] Error handling token:', error);
      }
    };
    
    getGoogleAccessToken();
  }, [toast, refreshUserData]);

  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      setAuthError(`Authentication failed: ${errorDescription || error}`);
      toast({
        title: "Authentication Error",
        description: errorDescription || "Failed to authenticate with provider",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.provider_token && session?.user) {
          // Determine if this is a Google login
          const isGoogleLogin = session.user?.app_metadata?.provider === 'google' ||
                               session.user?.identities?.some(id => id.provider === 'google') || 
                               !!session.provider_refresh_token;
                               
          console.log("OAuth provider check:", {
            provider: session.user?.app_metadata?.provider || 'unknown',
            hasProviderToken: !!session.provider_token,
            isGoogleLogin: isGoogleLogin
          });
                               
          if (isGoogleLogin) {
            // Store the token in localStorage for immediate availability
            localStorage.setItem("google_access_token", session.provider_token);
            if (session.provider_refresh_token) {
              localStorage.setItem("google_refresh_token", session.provider_refresh_token);
            }
            
            setTimeout(async () => {
              try {
                const { error } = await supabase
                  .from('user_oauth_tokens')
                  .upsert({
                    user_id: session.user.id,
                    provider: 'google',
                    access_token: session.provider_token,
                    refresh_token: session.provider_refresh_token || null,
                    updated_at: new Date().toISOString()
                  }, {
                    onConflict: 'user_id,provider'
                  });
    
                if (error) {
                  console.error("Error storing Google OAuth token:", error);
                  toast({
                    title: "Error",
                    description: "Failed to store your Google access token. Some features may not work correctly.",
                    variant: "destructive",
                  });
                } else {
                  console.log("Google OAuth token stored successfully in database");
                  toast({
                    title: "Success",
                    description: "Your Google account has been connected successfully.",
                  });
                }
              } catch (error) {
                console.error("Error handling Google OAuth token:", error);
              }
            }, 0);
          } else {
            console.log("Not a Google login; token not stored in database.");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkSession();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data?.user) {
        console.log("User authenticated successfully:", data.user.id);
        login();
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profileData) {
          console.log("Profile data fetched:", profileData);
          localStorage.setItem("userData", JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            firstName: profileData.first_name,
            lastName: profileData.last_name,
            bio: profileData.bio || "",
            location: profileData.location || "",
            occupation: profileData.occupation || "",
            education: profileData.education || "",
            avatar: profileData.avatar_url || "/placeholder.svg",
            teachingSkills: [],
            learningSkills: [],
            createdAt: profileData.created_at
          }));
        }
        
        navigate("/profile");
      }
    } catch (error: any) {
      setAuthError(error.message || "Failed to login");
      toast({
        title: "Login failed",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    try {
      setAuthInProgress(true);
      setAuthError(null);
      
      toast({
        title: `Connecting to ${provider}`,
        description: "You will be redirected to continue login...",
      });
      
      const scopes = provider === 'google' ? 'https://www.googleapis.com/auth/calendar profile' : undefined;
      
      const redirectUrl = provider === 'google' 
        ? `${window.location.origin}/profile?tab=requests`
        : `${window.location.origin}/profile`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          scopes: scopes,
        }
      });

      if (error) throw error;
      
      // If we get a url property, redirect the user instead of waiting for auto-redirect
      if (data?.url) {
        window.location.href = data.url;
      }
      
    } catch (error: any) {
      setAuthError(error.message || `Failed to sign in with ${provider}`);
      toast({
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed`,
        description: error.message || "Failed to sign in with " + provider,
        variant: "destructive",
      });
      setAuthInProgress(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue your learning journey
            </p>
          </div>
          
          {authError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-skill-purple hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-skill-purple hover:bg-skill-purple-dark"
              disabled={isLoading || authInProgress}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="w-full" 
              type="button"
              onClick={() => handleSocialLogin("github")}
              disabled={authInProgress}
            >
              {authInProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
              Github
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={authInProgress}
            >
              {authInProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Google
            </Button>
          </div>
          
          <p className="text-center mt-8 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-skill-purple hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
