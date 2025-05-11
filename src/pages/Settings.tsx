import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileLayout from '@/components/layout/ProfileLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { userId, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  
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
  
  // Theme settings
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  
  // Fetch user data and settings
  useEffect(() => {
    if (!userId) return;
    
    const fetchUserData = async () => {
      try {
        setSettingsLoading(true);
        
        // Fetch user email
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setEmail(user.email);
        }
        
        // Fetch user notification preferences from the new settings table
        const { data: userSettings, error: settingsError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (settingsError) {
          if (settingsError.code !== 'PGRST116') { // PGRST116 is "row not found" error
            console.error("Error fetching user settings:", settingsError);
          } else {
            // Create default settings if not found
            const { error: createError } = await supabase
              .from('user_settings')
              .insert([{ user_id: userId }]);
              
            if (createError) {
              console.error("Error creating default settings:", createError);
            }
          }
        } else if (userSettings) {
          // Set form values from fetched settings
          setEmailNotifications(userSettings.email_notifications ?? true);
          setTheme(userSettings.theme || "system");
          setLanguage(userSettings.language || "en");
          
          // These fields are from our app logic, not stored in DB yet
          setSessionReminders(true);
          setMessageNotifications(true);
          setConnectionNotifications(true);
          setSessionRequestNotifications(true);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error loading settings",
          description: "Could not load your user settings. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setSettingsLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, toast]);
  
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
  
  const handleUpdateNotifications = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('user_settings')
        .update({ 
          email_notifications: emailNotifications,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error updating notification settings:", error);
        toast({
          title: "Error",
          description: "Could not update notification settings. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated"
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateGeneralSettings = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('user_settings')
        .update({ 
          theme,
          language,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error updating general settings:", error);
        toast({
          title: "Error",
          description: "Could not update general settings. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Settings saved",
        description: "Your general preferences have been updated"
      });
    } catch (error) {
      console.error("Error saving general settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    // This would normally have a confirmation dialog
    toast({
      title: "Account deletion requested",
      description: "Please contact support to complete account deletion",
      variant: "destructive"
    });
  };
  
  if (settingsLoading) {
    return (
      <ProfileLayout>
        <div className="container max-w-4xl py-8">
          <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
          <div className="text-center py-12">Loading your settings...</div>
        </div>
      </ProfileLayout>
    );
  }
  
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <select 
                      id="theme" 
                      className="w-full px-3 py-2 border rounded-md"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <option value="system">System default</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select 
                      id="language" 
                      className="w-full px-3 py-2 border rounded-md"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={handleUpdateGeneralSettings}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Settings"}
                  </Button>
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
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Notification Settings"}
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
