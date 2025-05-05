
import React, { useState, useEffect } from "react";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { userId, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [connectionNotifications, setConnectionNotifications] = useState(true);
  const [sessionRequestNotifications, setSessionRequestNotifications] = useState(true);
  
  // Fetch user data
  useEffect(() => {
    if (!userId) return;
    
    const fetchUserData = async () => {
      // Fetch user email
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
      
      // Fetch user notification preferences
      // In a real application, you would store these in a database table
      // For now, we'll use default values
    };
    
    fetchUserData();
  }, [userId]);
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully"
    });
    
    // Reset form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const handleUpdateNotifications = () => {
    // In a real application, you would save these settings to a database
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated"
    });
  };
  
  const handleDeleteAccount = async () => {
    // This would normally have a confirmation dialog
    toast({
      title: "Account deletion requested",
      description: "Please contact support to complete account deletion",
      variant: "destructive"
    });
  };
  
  return (
    <ProfileLayout>
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      disabled
                    />
                    <p className="text-sm text-muted-foreground">
                      To change your email, please contact support
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleUpdatePassword}>
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                    <span>Email Notifications</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Receive notifications via email
                    </span>
                  </Label>
                  <Switch 
                    id="email-notifications" 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="connection-notifications" className="flex flex-col space-y-1">
                    <span>Connection Requests</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Get notified about new connection requests
                    </span>
                  </Label>
                  <Switch 
                    id="connection-notifications" 
                    checked={connectionNotifications}
                    onCheckedChange={setConnectionNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="session-request-notifications" className="flex flex-col space-y-1">
                    <span>Session Requests</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Get notified about new learning session requests
                    </span>
                  </Label>
                  <Switch 
                    id="session-request-notifications" 
                    checked={sessionRequestNotifications}
                    onCheckedChange={setSessionRequestNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="session-reminders" className="flex flex-col space-y-1">
                    <span>Session Reminders</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Receive reminders about upcoming sessions
                    </span>
                  </Label>
                  <Switch 
                    id="session-reminders" 
                    checked={sessionReminders}
                    onCheckedChange={setSessionReminders}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="message-notifications" className="flex flex-col space-y-1">
                    <span>Message Notifications</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Get notified when you receive new messages
                    </span>
                  </Label>
                  <Switch 
                    id="message-notifications" 
                    checked={messageNotifications}
                    onCheckedChange={setMessageNotifications}
                  />
                </div>
                
                <Button 
                  onClick={handleUpdateNotifications} 
                  className="w-full mt-4"
                >
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProfileLayout>
  );
};

export default Settings;
