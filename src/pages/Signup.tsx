
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea"; 
import MainLayout from "@/components/layout/MainLayout";
import { Facebook, Mail, Github, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";

const Signup: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  
  // Basic info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Profile info
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
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

    // Move to step 2
    setStep(2);
  };

  const handleSubmitStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Create user object with unique ID
    const userId = `user_${Date.now()}`;
    const userData = {
      id: userId,
      firstName,
      lastName,
      email,
      bio,
      location,
      occupation,
      education,
      createdAt: new Date().toISOString(),
      teachingSkills: [],
      learningSkills: [],
      avatar: "/placeholder.svg",
    };
    
    // Store user data in localStorage
    localStorage.setItem("userData", JSON.stringify(userData));
    
    // Simulate signup
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });
      // Log the user in
      login();
      // Redirect to profile page
      navigate("/profile");
    }, 1000);
  };

  const handleSkipProfileInfo = () => {
    setIsLoading(true);
    
    // Create user object with unique ID but minimal info
    const userId = `user_${Date.now()}`;
    const userData = {
      id: userId,
      firstName,
      lastName,
      email,
      bio: "",
      location: "",
      occupation: "",
      education: "",
      createdAt: new Date().toISOString(),
      teachingSkills: [],
      learningSkills: [],
      avatar: "/placeholder.svg",
    };
    
    // Store user data in localStorage
    localStorage.setItem("userData", JSON.stringify(userData));
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account created!",
        description: "You can complete your profile later.",
      });
      // Log the user in
      login();
      // Redirect to profile page
      navigate("/profile");
    }, 1000);
  };

  const handleSocialSignup = (provider: string) => {
    toast({
      title: `${provider} signup`,
      description: `Signup with ${provider} is coming soon.`,
    });
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
                  onClick={() => handleSocialSignup("Github")}
                >
                  <Github className="mr-2 h-4 w-4" />
                  Github
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  type="button"
                  onClick={() => handleSocialSignup("Google")}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  type="button"
                  onClick={() => handleSocialSignup("Facebook")}
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
