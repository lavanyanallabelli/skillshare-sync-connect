import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea"; 
import MainLayout from "@/components/layout/MainLayout";
import { Facebook, Mail, Github, Eye, EyeOff, AlertCircle, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Signup: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.provider_token && session.user) {
        console.log("OAuth provider token found in signup, storing...");
        
        const isGoogleLogin = session.user?.app_metadata?.provider === 'google' ||
                            session.user?.identities?.some(id => id.provider === 'google') || 
                            !!session.provider_refresh_token;
        
        if (isGoogleLogin) {
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
              console.error("Error storing OAuth token:", error);
            } else {
              console.log("OAuth token stored successfully as google provider");
              localStorage.setItem("google_access_token", session.provider_token);
              
              const userData = session.user.user_metadata || {};
              const { error: profileError } = await supabase
                .from('profiles')
                .update({
                  first_name: userData.full_name ? userData.full_name.split(' ')[0] : userData.name || '',
                  last_name: userData.full_name ? userData.full_name.split(' ').slice(1).join(' ') : '',
                  avatar_url: userData.avatar_url || '',
                  updated_at: new Date().toISOString()
                })
                .eq('id', session.user.id);
                
              if (profileError) {
                console.error("Error updating profile:", profileError);
              } else {
                console.log("Profile updated with OAuth data");
              }
            }
          } catch (error) {
            console.error("Error handling OAuth token:", error);
          }
        } else {
          console.log("Not a Google login; token not stored");
        }
      }
    };

    checkSession();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Terms required",
        description: "Please accept the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setStep(2);
  };

  const handleSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;

      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            bio,
            location,
            occupation,
            education,
          })
          .eq('id', data.user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        }

        toast({
          title: "Account created!",
          description: "Please check your email for verification.",
        });

        login();
        
        navigate("/profile");
      }
    } catch (error: any) {
      setAuthError(error.message || "Failed to create account");
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipProfileInfo = async () => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;

      if (data?.user) {
        toast({
          title: "Account created!",
          description: "Please check your email for verification.",
        });

        login();
        
        navigate("/profile");
      }
    } catch (error: any) {
      setAuthError(error.message || "Failed to create account");
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'github' | 'google') => {
    try {
      setAuthInProgress(true);
      setAuthError(null);
      
      toast({
        title: `Connecting to ${provider}`,
        description: "You will be redirected to continue sign up...",
      });
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/profile`,
          scopes: provider === 'google' ? 'https://www.googleapis.com/auth/calendar' : undefined,
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      setAuthError(error.message || `Failed to sign up with ${provider}`);
      toast({
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} signup failed`,
        description: error.message || `Failed to sign up with ${provider}`,
        variant: "destructive",
      });
    } finally {
      setAuthInProgress(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create an account</h1>
            <p className="text-muted-foreground">
              Join SkillSync to start learning and teaching new skills
            </p>
          </div>
          
          {authError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <div className="bg-blue-50 p-4 rounded-md text-blue-700 mb-6 flex items-start gap-3">
            <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Connected to Supabase</p>
              <p className="text-xs mt-1">
                Email verification is handled by Supabase. For development purposes, 
                you may want to disable email verification in the Supabase dashboard.
              </p>
            </div>
          </div>
          
          {step === 1 && (
            <form onSubmit={handleSubmitStep1} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Enter your first name" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Enter your last name" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Create a password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm font-normal">
                  I agree to the{" "}
                  <Link to="/terms" className="text-skill-purple hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-skill-purple hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-skill-purple hover:bg-skill-purple-dark"
                disabled={authInProgress}
              >
                Continue
              </Button>
              
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
              
              <div className="grid grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  type="button"
                  onClick={() => handleSocialSignup("github")}
                  disabled={authInProgress}
                >
                  {authInProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
                  Github
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  type="button"
                  onClick={() => handleSocialSignup("google")}
                  disabled={authInProgress}
                >
                  {authInProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  type="button"
                  onClick={() => toast({ title: "Facebook signup", description: "Facebook is coming soon." })}
                  disabled={authInProgress}
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
              </div>
              
              <p className="text-center mt-8 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-skill-purple hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
          
          {step === 2 && (
            <form onSubmit={handleSubmitStep2} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">About you</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us about yourself, your interests, and what you want to learn or teach" 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="City, Country" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input 
                  id="occupation" 
                  placeholder="Your current job title" 
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input 
                  id="education" 
                  placeholder="Your highest education" 
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-skill-purple hover:bg-skill-purple-dark"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </div>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full mt-2"
                onClick={handleSkipProfileInfo}
                disabled={isLoading}
              >
                Skip for now
              </Button>
              
              <p className="text-center mt-4 text-xs text-muted-foreground">
                You can always update your profile later
              </p>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Signup;
