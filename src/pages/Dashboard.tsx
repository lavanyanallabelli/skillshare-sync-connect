
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
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

// Sample data
const upcomingSessions = [
  {
    id: 1,
    title: "Photography Basics",
    with: "Sarah Williams",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    date: "Today",
    time: "3:00 PM - 4:00 PM",
    status: "upcoming",
  },
  {
    id: 2,
    title: "Coding Tutorial",
    with: "Alex Johnson",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "Tomorrow",
    time: "1:00 PM - 2:30 PM",
    status: "upcoming",
  },
];

const notifications = [
  {
    id: 1,
    type: "message",
    content: "New message from Sarah Williams",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "request",
    content: "New learning request for Guitar Fundamentals",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "session",
    content: "Upcoming session with Alex Johnson in 1 hour",
    time: "3 hours ago",
    read: true,
  },
];

const teachingSkills = [
  {
    id: 1,
    title: "Digital Photography",
    category: "Arts & Design",
    students: 4,
    rating: 4.8,
  },
  {
    id: 2,
    title: "Web Development",
    category: "Technology",
    students: 2,
    rating: 5.0,
  },
];

const learningSkills = [
  {
    id: 1,
    title: "Guitar Fundamentals",
    category: "Music",
    teacher: "Michael Chen",
    progress: 60,
  },
  {
    id: 2,
    title: "Yoga for Beginners",
    category: "Fitness",
    teacher: "Emily Davis",
    progress: 30,
  },
];

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <MainLayout>
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
                {upcomingSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="bg-muted p-3 rounded-full">
                        <Clock size={24} className="text-skill-purple" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{session.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <img 
                            src={session.avatar} 
                            alt={session.with} 
                            className="h-5 w-5 rounded-full object-cover" 
                          />
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
                ))}
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
                {notifications.slice(0, 3).map((notification) => (
                  <Card key={notification.id}>
                    <CardContent className="p-4 flex items-center gap-3">
                      {notification.type === "message" && (
                        <div className="bg-blue-500/10 p-2 rounded-full text-blue-500">
                          <MessageSquare size={16} />
                        </div>
                      )}
                      {notification.type === "request" && (
                        <div className="bg-amber-500/10 p-2 rounded-full text-amber-500">
                          <Users size={16} />
                        </div>
                      )}
                      {notification.type === "session" && (
                        <div className="bg-green-500/10 p-2 rounded-full text-green-500">
                          <Calendar size={16} />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <p className={notification.read ? "text-muted-foreground" : "font-medium"}>
                          {notification.content}
                        </p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-skill-purple"></div>
                      )}
                    </CardContent>
                  </Card>
                ))}
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
              <Button variant="outline" size="sm">
                Mark All as Read
              </Button>
            </div>
            
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card key={notification.id}>
                    <CardContent className="p-4 flex items-center gap-3">
                      {notification.type === "message" && (
                        <div className="bg-blue-500/10 p-2 rounded-full text-blue-500">
                          <MessageSquare size={16} />
                        </div>
                      )}
                      {notification.type === "request" && (
                        <div className="bg-amber-500/10 p-2 rounded-full text-amber-500">
                          <Users size={16} />
                        </div>
                      )}
                      {notification.type === "session" && (
                        <div className="bg-green-500/10 p-2 rounded-full text-green-500">
                          <Calendar size={16} />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <p className={notification.read ? "text-muted-foreground" : "font-medium"}>
                          {notification.content}
                        </p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
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
    </MainLayout>
  );
};

export default Dashboard;
