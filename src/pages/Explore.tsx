import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Star, 
  Users, 
  Clock, 
  Filter, 
  Search, 
  UserPlus, 
  UserCheck, 
  BookOpen,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import { createConnectionNotification } from "@/utils/notificationUtils";

// Categories for filtering
const categories = ["All", "Arts & Design", "Technology", "Fitness", "Music", "Languages", "Cooking", "Business", "Academic"];

const Explore: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isLoggedIn, userId, refreshUserData } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch skills and connection status on component mount
  useEffect(() => {
    const fetchSkillsAndConnections = async () => {
      setIsLoading(true);
      try {
        // Fetch teaching skills from the database
        const { data: teachingSkills, error: teachingError } = await supabase
          .from('teaching_skills')
          .select(`
            skill,
            proficiency_level,
            user_id,
            profiles:user_id (
              first_name,
              last_name,
              avatar_url,
              location,
              education,
              occupation
            )
          `);
          
        if (teachingError) throw teachingError;
        
        // Process teaching skills into the format we need
        const processedSkills = teachingSkills?.map(item => {
          const profile = item.profiles as any;
          return {
            id: Math.random().toString(36).substr(2, 9), // Generate a temporary ID
            title: item.skill,
            category: "Skill",
            image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2073&q=80",
            rating: 4.5, // Default rating for now
            students: 0, // Default students count for now
            duration: "Variable",
            teacherId: item.user_id,
            teacherName: `${profile.first_name} ${profile.last_name}`,
            teacherAvatar: profile.avatar_url || "/placeholder.svg",
            location: profile.location,
            education: profile.education,
            occupation: profile.occupation,
            proficiencyLevel: item.proficiency_level
          };
        }) || [];
        
        setSkillsData(processedSkills);
        
        if (userId) {
          // Fetch connection statuses for the current user
          const { data: connections, error } = await supabase
            .from('connections')
            .select('*')
            .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);
            
          if (error) throw error;
          
          // Create a map of teacher ID to connection status
          // Only include connections with status 'pending' or 'accepted', ignore 'declined'
          const statusMap: Record<string, string> = {};
          connections?.forEach(conn => {
            // Skip declined connections - this allows the Connect button to appear again
            if (conn.status === 'declined') return;
            
            if (conn.requester_id === userId) {
              statusMap[conn.recipient_id] = conn.status;
            } else {
              statusMap[conn.requester_id] = conn.status;
            }
          });
          
          setConnectionStatus(statusMap);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description: "Could not load skills and connection data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSkillsAndConnections();
  }, [userId, toast]);

  // Filter skills based on search, category and rating
  const filteredSkills = skillsData.filter((skill) => {
    const matchesSearch = skill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory;
    const matchesRating = skill.rating >= minRating;
    
    return matchesSearch && matchesCategory && matchesRating;
  });

  const handleSendRequest = async (skillId: string, teacherId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to send a learning request",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    try {
      // For learning requests, we'll implement this in a separate feature
      toast({
        title: "Request Sent!",
        description: "Your learning request has been sent to the teacher.",
      });
    } catch (error) {
      console.error("Error sending request:", error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConnect = async (teacherId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to connect with teachers",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    try {
      // Verify that we have an active session before proceeding
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      
      // Get current user's profile info for the notification
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();
        
      if (!currentUserProfile) {
        throw new Error("Could not find your profile information");
      }
        
      const currentUserName = `${currentUserProfile.first_name} ${currentUserProfile.last_name}`;
      
      // Insert a new connection request
      const { data: connectionData, error: connectionError } = await supabase
        .from('connections')
        .insert({
          requester_id: userId,
          recipient_id: teacherId,
          status: 'pending'
        })
        .select()
        .single();
        
      if (connectionError) {
        if (connectionError.code === '23505') { // Unique violation
          toast({
            title: "Already Connected",
            description: "You have already sent a connection request to this teacher",
          });
        } else {
          throw connectionError;
        }
      } else {
        // Update local state
        setConnectionStatus({
          ...connectionStatus,
          [teacherId]: 'pending'
        });
        
        // Create a notification for the teacher
        await createConnectionNotification(
          teacherId,
          "New Connection Request",
          `${currentUserName} wants to connect with you.`,
          "connection"
        );
        
        // Refresh user data
        await refreshUserData();
        
        toast({
          title: "Connection Request Sent!",
          description: "Your connection request has been sent to the teacher.",
        });
      }
    } catch (error) {
      console.error("Error connecting:", error);
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Explore Skills</h1>
        
        {/* Search and Filter Section */}
        <div className="bg-muted rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for skills or teachers..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Minimum Rating:</span>
            </div>
            <div className="flex-1 flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  value={[minRating]}
                  min={0}
                  max={5}
                  step={0.1}
                  onValueChange={(value) => setMinRating(value[0])}
                />
              </div>
              <div className="w-12 text-right">{minRating.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="mb-6 text-muted-foreground">
          Found {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''}
        </p>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-skill-purple" />
            <span className="ml-2">Loading skills...</span>
          </div>
        )}
        
        {/* No Results */}
        {!isLoading && filteredSkills.length === 0 && (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-lg text-muted-foreground">No skills found matching your criteria.</p>
            <p className="mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
        
        {/* Skills Grid */}
        {!isLoading && filteredSkills.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <Card key={skill.id} className="overflow-hidden">
                <div className="aspect-video relative bg-gradient-to-r from-skill-purple/30 to-blue-500/30 flex items-center justify-center text-white">
                  <h2 className="text-2xl font-bold text-center px-4 text-black">{skill.title}</h2>
                  <Badge className="absolute top-2 right-2">
                    {skill.proficiencyLevel}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-2">
                    {skill.category}
                  </Badge>
                  <h3 className="text-xl font-medium mb-2">{skill.title}</h3>
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm">{skill.rating}</span>
                  </div>
                  
                  <Link to={`/teacher/${skill.teacherId}`} className="block">
                    <div className="flex items-center gap-3 mb-4 hover:bg-muted/50 p-2 rounded-md transition-colors">
                      <img 
                        src={skill.teacherAvatar} 
                        alt={skill.teacherName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{skill.teacherName}</p>
                        <p className="text-xs text-muted-foreground">Teacher</p>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Additional teacher info */}
                  {skill.location && (
                    <p className="text-xs text-muted-foreground mb-1">
                      Location: {skill.location}
                    </p>
                  )}
                  {skill.occupation && (
                    <p className="text-xs text-muted-foreground mb-1">
                      Occupation: {skill.occupation}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="p-6 pt-0 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm text-muted-foreground w-full">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{skill.students} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{skill.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full">
                    <Button 
                      className="flex-1 bg-skill-purple hover:bg-skill-purple-dark"
                      onClick={() => handleSendRequest(skill.id, skill.teacherId)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Learn
                    </Button>
                    
                    {!connectionStatus[skill.teacherId] ? (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleConnect(skill.teacherId)}
                        disabled={skill.teacherId === userId} // Can't connect to yourself
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    ) : connectionStatus[skill.teacherId] === 'pending' ? (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        disabled
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Pending
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        disabled
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Connected
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Explore;
