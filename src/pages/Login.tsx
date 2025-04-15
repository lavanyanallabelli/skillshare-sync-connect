
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import MainLayout from "@/components/layout/MainLayout";
import { Facebook, Mail, Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";

const Login: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Basic validation
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
        login();
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
        navigate("/profile");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'github' | 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      });

      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: `${provider} login failed`,
        description: error.message,
        variant: "destructive",
      });
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
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
              disabled={isLoading}
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
          
          <div className="grid grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="w-full" 
              type="button"
              onClick={() => handleSocialLogin("github")}
            >
              <Github className="mr-2 h-4 w-4" />
              Github
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              type="button"
              onClick={() => handleSocialLogin("google")}
            >
              <Mail className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              type="button"
              onClick={() => handleSocialLogin("facebook")}
            >
              <Facebook className="mr-2 h-4 w-4" />
              Facebook
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
