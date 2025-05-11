
import React, { useState, useEffect } from "react";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  Calendar, 
  Bell, 
  User, 
  Book, 
  PenTool, 
  Clock, 
  Users,
  Star,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/App";
import { useProfileData } from "@/hooks/useProfileData";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";

// Define interfaces for our data types
interface Session {
  id: string;
  title: string;
  with: string;
  avatar?: string;
  date: string;
  time: string;
  status: string;
}

interface NotificationType {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  read: boolean;
}

interface TeachingSkill {
  id: string;
  title: string;
  category: string;
  students: number;
  rating: number;
}

interface LearningSkill {
  id: string;
  title: string;
  category: string;
  teacher: string;
  progress: number;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { userId } = useAuth();
  const { notifications, loading: notificationsLoading } = useNotifications(userId);
  const { 
    userData, 
    teachingSkills: rawTeachingSkills, 
    learningSkills: rawLearningSkills, 
    loading: profileLoading 
  } = useProfileData(userId);
  
  // State for session data
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [teachingSkills, setTeachingSkills] = useState<TeachingSkill[]>([]);
  const [learningSkills, setLearningSkills] = useState<LearningSkill[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sessions data from Supabase
  useEffect(() => {
    const fetchSessions = async () => {
      if (!userId) return;
      
      try {
        const { data: sessionsData, error } = await supabase
          .from('sessions')
          .select(`
            id,
            skill,
            day,
            time_slot,
            status,
            student_id,
            teacher_id,
            profiles!sessions_teacher_id_fkey(first_name, last_name, avatar_url)
          `)
          .eq('status', 'accepted')
          .or(`student_id.eq.${userId},teacher_id.eq.${userId}`)
          .order('day', { ascending: true })
          .limit(5);
          
        if (error) throw error;
        
        // Transform the data into the required format
        const formattedSessions = sessionsData.map(session => {
          const isTeacher = session.teacher_id === userId;
          const otherPerson = session.profiles;
          const name = otherPerson ? `${otherPerson.first_name} ${otherPerson.last_name}` : (isTeacher ? "Student" : "Teacher");
          
          const sessionDate = new Date(session.day);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          let dateDisplay;
          if (sessionDate.toDateString() === today.toDateString()) {
            dateDisplay = "Today";
          } else if (sessionDate.toDateString() === tomorrow.toDateString()) {
            dateDisplay = "Tomorrow";
          } else {
            dateDisplay = sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
          
          return {
            id: session.id,
            title: session.skill,
            with: name,
            avatar: otherPerson?.avatar_url || undefined,
            date: dateDisplay,
            time: session.time_slot,
            status: 'upcoming'
          };
        });
        
        setUpcomingSessions(formattedSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };
    
    fetchSessions();
  }, [userId]);
  
  // Transform teaching skills data
  useEffect(() => {
    if (!rawTeachingSkills || profileLoading) return;
    
    const fetchTeachingData = async () => {
      try {
        // For each teaching skill, get the number of students and average rating
        const processedSkills = await Promise.all(rawTeachingSkills.map(async (skill) => {
          // Count students (users who requested sessions for this skill)
          const { count: studentCount, error: studentsError } = await supabase
            .from('sessions')
            .select('student_id', { count: 'exact' })
            .eq('teacher_id', userId)
            .eq('skill', skill)
            .neq('student_id', userId);
            
          if (studentsError) throw studentsError;
          
          // Get average rating
          const { data: ratings, error: ratingsError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('recipient_id', userId);
            
          if (ratingsError) throw ratingsError;
          
          let avgRating = 5.0; // Default rating
          if (ratings && ratings.length > 0) {
            const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
            avgRating = Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal
          }
          
          // Get the category
          const { data: skillData } = await supabase
            .from('skills_catalog')
            .select('category')
            .eq('name', skill)
            .single();
          
          const category = skillData?.category || "Other";
            
          return {
            id: skill,
            title: skill,
            category: category,
            students: studentCount || 0,
            rating: avgRating
          };
        }));
        
        setTeachingSkills(processedSkills);
      } catch (error) {
        console.error("Error processing teaching skills:", error);
      }
    };
    
    fetchTeachingData();
  }, [rawTeachingSkills, userId, profileLoading]);
  
  // Transform learning skills data
  useEffect(() => {
    if (!rawLearningSkills || profileLoading) return;
    
    const fetchLearningData = async () => {
      try {
        const processedSkills = await Promise.all(rawLearningSkills.map(async (skill) => {
          // Find the teacher for this skill
          const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select(`
              teacher_id,
              profiles!sessions_teacher_id_fkey(first_name, last_name)
            `)
            .eq('student_id', userId)
            .eq('skill', skill)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          let teacherName = "Not assigned";
          if (sessionData?.profiles) {
            teacherName = `${sessionData.profiles.first_name} ${sessionData.profiles.last_name}`;
          }
          
          // Calculate progress (could be based on quiz results or session completion)
          // For now, we'll use a random progress between 10-90%
          const progress = Math.floor(Math.random() * 80) + 10;
          
          // Get the category
          const { data: skillData } = await supabase
            .from('skills_catalog')
            .select('category')
            .eq('name', skill)
            .single();
          
          const category = skillData?.category || "Other";
            
          return {
            id: skill,
            title: skill,
            category: category,
            teacher: teacherName,
            progress: progress
          };
        }));
        
        setLearningSkills(processedSkills);
      } catch (error) {
        console.error("Error processing learning skills:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLearningData();
  }, [rawLearningSkills, userId, profileLoading]);
  
  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };
  
  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    if (notifications && notifications.length > 0 && userId) {
      const { markAllAsRead } = useNotifications(userId);
      await markAllAsRead();
    }
  };
  
  // Loading state
  if (loading && (profileLoading || notificationsLoading)) {
    return (
      <ProfileLayout>
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <div className="h-96 flex items-center justify-center">
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </ProfileLayout>
    );
  }
  
  return (
    <ProfileLayout>
      <div className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-3">
            <Link to="/messages">
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare size={16} />
                Messages
              </Button>
            </Link>
            <Link to="/explore">
              <Button className="bg-skill-purple hover:bg-skill-purple-dark flex items-center gap-2">
                <Users size={16} />
                Find Teachers
              </Button>
            </Link>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User size={16} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="teaching" className="flex items-center gap-2">
              <PenTool size={16} />
              Teaching
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <Book size={16} />
              Learning
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell size={16} />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar size={24} className="text-skill-purple" />
                    <h3 className="font-medium">Upcoming Sessions</h3>
                    <p className="text-3xl font-bold">{upcomingSessions.length}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Link to="/sessions">
                    <Button variant="ghost" size="sm" className="text-skill-purple">
                      View Schedule
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-2">
                    <PenTool size={24} className="text-skill-teal" />
                    <h3 className="font-medium">Teaching</h3>
                    <p className="text-3xl font-bold">{teachingSkills.length}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Link to="/teach">
                    <Button variant="ghost" size="sm" className="text-skill-teal">
                      Manage Skills
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-2">
                    <Book size={24} className="text-skill-orange" />
                    <h3 className="font-medium">Learning</h3>
                    <p className="text-3xl font-bold">{learningSkills.length}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Link to="/explore">
                    <Button variant="ghost" size="sm" className="text-skill-orange">
                      Explore Skills
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
            
            {/* Upcoming Sessions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Upcoming Sessions</h2>
                <Link to="/sessions">
                  <Button variant="ghost" size="sm" className="text-skill-purple">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <Card key={session.id}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-muted p-3 rounded-full">
                          <Clock size={24} className="text-skill-purple" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium">{session.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {session.avatar ? (
                              <img 
                                src={session.avatar} 
                                alt={session.with} 
                                className="h-5 w-5 rounded-full object-cover" 
                              />
                            ) : (
                              <User size={14} />
                            )}
                            <span>with {session.with}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium">{session.date}</p>
                          <p className="text-xs text-muted-foreground">{session.time}</p>
                        </div>
                        
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No upcoming sessions</p>
                      <Link to="/explore" className="mt-2 inline-block">
                        <Button size="sm" className="bg-skill-purple hover:bg-skill-purple-dark">
                          Find Teachers
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            {/* Recent Notifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Notifications</h2>
                <Button
                  onClick={() => setActiveTab("notifications")}
                  variant="ghost"
                  size="sm"
                  className="text-skill-purple"
                >
                  View All
                </Button>
              </div>
              
              <div className="space-y-2">
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 3).map((notification) => (
                    <Card key={notification.id}>
                      <CardContent className="p-4 flex items-center gap-3">
                        {notification.type === "message" && (
                          <div className="bg-blue-500/10 p-2 rounded-full text-blue-500">
                            <MessageSquare size={16} />
                          </div>
                        )}
                        {notification.type === "session" && (
                          <div className="bg-green-500/10 p-2 rounded-full text-green-500">
                            <Calendar size={16} />
                          </div>
                        )}
                        {notification.type === "connection" && (
                          <div className="bg-amber-500/10 p-2 rounded-full text-amber-500">
                            <Users size={16} />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <p className={notification.read ? "text-muted-foreground" : "font-medium"}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(notification.created_at)}
                          </p>
                        </div>
                        
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-skill-purple"></div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No notifications</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="teaching" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Skills You're Teaching</h2>
              <Link to="/teach">
                <Button className="bg-skill-purple hover:bg-skill-purple-dark">
                  Create New Skill
                </Button>
              </Link>
            </div>
            
            {teachingSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teachingSkills.map((skill) => (
                  <Card key={skill.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-2">
                        {skill.category}
                      </Badge>
                      <h3 className="text-xl font-medium mb-4">{skill.title}</h3>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-1">
                          <Users size={16} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {skill.students} Students
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star size={16} fill="currentColor" />
                          <span className="text-sm">{skill.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-skill-purple hover:bg-skill-purple-dark">
                          View Requests
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-muted rounded-lg">
                <h3 className="text-lg font-medium mb-2">No teaching skills added yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start sharing your knowledge by creating your first skill listing.
                </p>
                <Link to="/teach">
                  <Button className="bg-skill-purple hover:bg-skill-purple-dark">
                    Become a Teacher
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Skills You're Learning</h2>
              <Link to="/explore">
                <Button className="bg-skill-purple hover:bg-skill-purple-dark">
                  Find New Skills
                </Button>
              </Link>
            </div>
            
            {learningSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {learningSkills.map((skill) => (
                  <Card key={skill.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-2">
                        {skill.category}
                      </Badge>
                      <h3 className="text-xl font-medium mb-2">{skill.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Teacher: {skill.teacher}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{skill.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-skill-purple rounded-full" 
                            style={{ width: `${skill.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Button className="flex-1 bg-skill-purple hover:bg-skill-purple-dark">
                          Continue Learning
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Message Teacher
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-muted rounded-lg">
                <h3 className="text-lg font-medium mb-2">No learning skills added yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your learning journey by exploring our skill catalog.
                </p>
                <Link to="/explore">
                  <Button className="bg-skill-purple hover:bg-skill-purple-dark">
                    Explore Skills
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Notifications</h2>
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                Mark All as Read
              </Button>
            </div>
            
            {notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card key={notification.id}>
                    <CardContent className="p-4 flex items-center gap-3">
                      {notification.type === "message" && (
                        <div className="bg-blue-500/10 p-2 rounded-full text-blue-500">
                          <MessageSquare size={16} />
                        </div>
                      )}
                      {notification.type === "session" && (
                        <div className="bg-green-500/10 p-2 rounded-full text-green-500">
                          <Calendar size={16} />
                        </div>
                      )}
                      {notification.type === "connection" && (
                        <div className="bg-amber-500/10 p-2 rounded-full text-amber-500">
                          <Users size={16} />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <p className={notification.read ? "text-muted-foreground" : "font-medium"}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                        {notification.description && (
                          <p className="text-sm mt-1">{notification.description}</p>
                        )}
                      </div>
                      
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-skill-purple"></div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-muted rounded-lg">
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  You're all caught up! We'll notify you when there's activity.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProfileLayout>
  );
};

export default Dashboard;
