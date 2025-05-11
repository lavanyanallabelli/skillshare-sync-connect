
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Calendar, MessageSquare, Users, Book } from "lucide-react";

interface MainDashboardProps {
  userId: string;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sessions: 0,
    connections: 0,
    messages: 0,
    skills: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user stats in parallel
        const [sessionResult, connectionResult, messageResult, skillResult] = await Promise.all([
          // Count upcoming sessions
          supabase
            .from('sessions')
            .select('id', { count: 'exact' })
            .or(`teacher_id.eq.${userId},student_id.eq.${userId}`)
            .eq('status', 'accepted')
            .gte('scheduled_at', new Date().toISOString()),
            
          // Count connections
          supabase
            .from('connections')
            .select('id', { count: 'exact' })
            .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
            .eq('status', 'accepted'),
            
          // Count unread messages
          supabase.rpc('get_unread_message_count', { user_id: userId }),
            
          // Count teaching skills
          supabase
            .from('teaching_skills')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
        ]);
        
        setStats({
          sessions: sessionResult.count || 0,
          connections: connectionResult.count || 0,
          messages: messageResult.data || 0,
          skills: skillResult.count || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-1/3 mb-4" />
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-skill-purple" />
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{stats.sessions}</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/sessions">View Sessions</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-blue-500" />
              Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{stats.connections}</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/profile?tab=connections">View Connections</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-green-500" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">
              {stats.messages > 0 ? (
                <span className="flex items-center">
                  {stats.messages}
                  <span className="ml-2 h-2 w-2 rounded-full bg-red-500"></span>
                </span>
              ) : (
                '0'
              )}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/messages">View Messages</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Book className="h-5 w-5 text-amber-500" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{stats.skills}</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/skills">Manage Skills</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/explore">Find a Teacher</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/skills">Add Teaching Skills</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Suggested Teachers</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Explore our teacher directory to find skilled instructors</p>
            <Button asChild className="mt-4">
              <Link to="/explore">Browse Teachers</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
