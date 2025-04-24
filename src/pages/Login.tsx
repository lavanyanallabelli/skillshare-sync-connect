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
  useEffect(() => {
    const getGoogleAccessToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[Google OAuth] Supabase session:', session);
        
        if (session) {
          let googleAccessToken = session.provider_token || session.provider_access_token;
          console.log('[Google OAuth] provider_token:', session.provider_token);
          console.log('[Google OAuth] provider_access_token:', session.provider_access_token);
          
          // Fallback: check identities
          if (!googleAccessToken && session.user && session.user.identities && session.user.identities.length > 0) {
            googleAccessToken = session.user.identities[0].identity_data?.access_token;
            console.log('[Google OAuth] identity_data.access_token:', session.user.identities[0].identity_data?.access_token);
          }
          
          if (googleAccessToken) {
            // First store in localStorage for immediate availability
            localStorage.setItem("google_access_token", googleAccessToken);
            console.log('[Google OAuth] Token saved to localStorage');
            
            // Then store in database
            const { error: tokenError } = await supabase
              .from('user_oauth_tokens')
              .upsert({
                user_id: session.user.id,
                provider: 'google',
                access_token: googleAccessToken,
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
              console.log('[Google OAuth] Token successfully stored in database');
            }
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
  }, [toast]);

  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authInProgress, setAuthInProgress] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
          console.log("OAuth provider token found, storing...", {
            provider: session.provider_refresh_token ? 'google' : 'github',
            tokenPreview: `${session.provider_token.substring(0, 10)}...`
          });
          
          // Store the token in localStorage first for immediate availability
          localStorage.setItem("google_access_token", session.provider_token);
          if (session.provider_refresh_token) {
            localStorage.setItem("google_refresh_token", session.provider_refresh_token);
          }
          
          // Then store in database - wrapped in setTimeout to avoid blocking the auth flow
          setTimeout(async () => {
            try {
              const { error } = await supabase
                .from('user_oauth_tokens')
                .upsert({
                  user_id: session.user.id,
                  provider: session.provider_refresh_token ? 'google' : 'github',
                  access_token: session.provider_token,
                  refresh_token: session.provider_refresh_token || null,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id,provider'
                });
  
              if (error) {
                console.error("Error storing OAuth token:", error);
                toast({
                  title: "Error",
                  description: "Failed to store your access token. Some features may not work correctly.",
                  variant: "destructive",
                });
              } else {
                console.log("OAuth token stored successfully in database");
                toast({
                  title: "Success",
                  description: "Your account has been connected successfully.",
                });
              }
            } catch (error) {
              console.error("Error handling OAuth token:", error);
            }
          }, 0);
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
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/profile`,
          scopes: provider === 'google' ? 'https://www.googleapis.com/auth/calendar' : undefined,
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
