
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import {
  Clock,
  Calendar as CalendarIcon,
  Star,
  MessageSquare,
  UserPlus,
  UserCheck,
  Clock as PendingIcon
} from "lucide-react";
import MessageDialog from "@/components/messages/MessageDialog";

const TeacherProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { isLoggedIn, userId } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availabilityTimes, setAvailabilityTimes] = useState<string[]>([]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!id) return;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (profileError) throw profileError;

        const { data: teachingSkills, error: skillsError } = await supabase
          .from('teaching_skills')
          .select('*')
          .eq('user_id', id);

        if (skillsError) throw skillsError;

        const { data: learningSkills, error: learningError } = await supabase
          .from('learning_skills')
          .select('*')
          .eq('user_id', id);

        if (learningError) throw learningError;

        // Fetch review data with proper join
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            reviewer_id
          `)
          .eq('recipient_id', id);
          
        if (reviewsError) throw reviewsError;

        // Separately fetch reviewer profiles
        let formattedReviews: any[] = [];
        if (reviewsData && reviewsData.length > 0) {
          // Get unique reviewer IDs
          const reviewerIds = [...new Set(reviewsData.map(review => review.reviewer_id))];
          
          // Fetch all reviewer profiles in one query
          const { data: reviewerProfiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url')
            .in('id', reviewerIds);
          
          // Create a map of profiles for faster lookup
          const profileMap = new Map();
          if (reviewerProfiles) {
            reviewerProfiles.forEach(profile => {
              profileMap.set(profile.id, profile);
            });
          }
          
          // Format reviews with profile data
          formattedReviews = reviewsData.map(review => {
            const profile = profileMap.get(review.reviewer_id);
            return {
              id: review.id,
              name: profile ? `${profile.first_name} ${profile.last_name}` : 'User',
              avatar: profile?.avatar_url || '/placeholder.svg',
              rating: review.rating,
              date: format(new Date(review.created_at), 'MMMM d, yyyy'),
              comment: review.comment
            };
          });
        }
        
        setReviews(formattedReviews);

        const formattedTeacher = {
          id: profileData.id,
          name: `${profileData.first_name} ${profileData.last_name}`,
          avatar: profileData.avatar_url || "/placeholder.svg",
          rating: 4.8,
          location: profileData.location || "",
          company: profileData.occupation || "",
          education: profileData.education || "",
          achievements: ["New Member"],
          bio: profileData.bio || "",
          teachingSkills: teachingSkills?.map(skill => skill.skill) || [],
          learningSkills: learningSkills?.map(skill => skill.skill) || []
        };

        setTeacher(formattedTeacher);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        toast({
          title: "Error",
          description: "Failed to load teacher profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, [id, toast]);

  useEffect(() => {
    const checkConnectionStatus = async () => {
      if (!isLoggedIn || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('connections')
          .select('*')
          .or(`and(requester_id.eq.${userId},recipient_id.eq.${id}),and(requester_id.eq.${id},recipient_id.eq.${userId})`)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setConnectionStatus(data.status);
        } else {
          setConnectionStatus(null);
        }
      } catch (error) {
        console.error("Error checking connection status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnectionStatus();
  }, [id, isLoggedIn, userId]);

  useEffect(() => {
    if (!selectedDate || !id) return;

    const fetchAvailability = async () => {
      try {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('user_availability')
          .select('time_slot')
          .eq('user_id', id)
          .eq('day', formattedDate)
          .eq('is_available', true);

        if (error) throw error;

        if (data && data.length > 0) {
          const available = data.map(slot => slot.time_slot);
          setAvailabilityTimes(available);
        } else {
          setAvailabilityTimes([
            "9:00 AM - 10:00 AM",
            "10:30 AM - 11:30 AM",
            "1:00 PM - 2:00 PM",
            "3:30 PM - 4:30 PM",
            "5:00 PM - 6:00 PM",
          ]);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        toast({
          title: "Error",
          description: "Failed to load teacher's availability",
          variant: "destructive",
        });
      }
    };

    fetchAvailability();
  }, [selectedDate, id, toast]);

  const handleConnect = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to connect with teachers",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: userId,
          recipient_id: id,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Connected",
            description: "You have already sent a connection request to this teacher",
          });
        } else {
          throw error;
        }
      } else {
        setConnectionStatus('pending');

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

  const handleBookSession = async () => {
    if (!selectedSkill) {
      toast({
        title: "Skill Required",
        description: "Please select a skill you want to learn",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTimeSlot || !selectedDate) {
      toast({
        title: "Time Slot Required",
        description: "Please select a time slot for your session",
        variant: "destructive",
      });
      return;
    }

    if (!isLoggedIn || !userId) {
      toast({
        title: "Login Required",
        description: "Please log in to book a session",
        variant: "destructive",
      });
      return;
    }

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const { data: availabilityCheck, error: availabilityError } = await supabase
        .from('user_availability')
        .select('id')
        .eq('user_id', id)
        .eq('day', formattedDate)
        .eq('time_slot', selectedTimeSlot)
        .eq('is_available', true);

      if (availabilityError) throw availabilityError;

      if (!availabilityCheck || availabilityCheck.length === 0) {
        toast({
          title: "Time Slot Unavailable",
          description: "This time slot is no longer available. Please select another time.",
          variant: "destructive",
        });
        return;
      }

      const { data: existingSession, error: sessionCheckError } = await supabase
        .from('sessions')
        .select('id')
        .eq('teacher_id', id)
        .eq('day', formattedDate)
        .eq('time_slot', selectedTimeSlot)
        .in('status', ['pending', 'accepted']);

      if (sessionCheckError) throw sessionCheckError;

      if (existingSession && existingSession.length > 0) {
        toast({
          title: "Session Unavailable",
          description: "This time slot has already been booked. Please select another time.",
          variant: "destructive",
        });
        return;
      }

      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          teacher_id: id,
          student_id: userId,
          skill: selectedSkill,
          day: formattedDate,
          time_slot: selectedTimeSlot,
          status: 'pending'
        });

      if (sessionError) throw sessionError;

      toast({
        title: "Session Requested",
        description: `Your learning request has been sent to ${teacher?.name}`,
      });

      setDialogOpen(false);
      setSelectedSkill("");
      setSelectedTimeSlot("");
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Error",
        description: "Failed to book session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMessageClick = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to send messages",
        variant: "destructive",
      });
      return;
    }

    setMessageDialogOpen(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-6xl py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-skill-purple"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!teacher) {
    return (
      <MainLayout>
        <div className="container max-w-6xl py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Teacher not found</h2>
            <p className="mt-2 text-gray-600">The teacher profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-6xl py-8">
        <ProfileHeader
          {...teacher}
          isOwnProfile={false}
          onMessageClick={handleMessageClick}
          onBookSessionClick={() => setDialogOpen(true)}
          actionButton={null}
        />

        <MessageDialog
          isOpen={messageDialogOpen}
          onClose={() => setMessageDialogOpen(false)}
          receiverId={teacher?.id}
          receiverName={teacher?.name}
          receiverAvatar={teacher?.avatar}
        />

        <div className="mt-8">
          <Tabs defaultValue="skills" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="skills">Skills & Expertise</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>

            <TabsContent value="skills">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills I Teach</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {teacher?.teachingSkills?.map((skill) => (
                        <Badge key={skill} className="py-2 px-3">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-6">
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-skill-purple hover:bg-skill-purple-dark">
                            Book a Learning Session
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Book a Learning Session</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div>
                              <Label>Select a skill you want to learn</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {teacher?.teachingSkills?.map((skill) => (
                                  <Badge
                                    key={skill}
                                    variant={selectedSkill === skill ? "default" : "outline"}
                                    className="py-2 px-3 cursor-pointer transition-colors"
                                    onClick={() => setSelectedSkill(skill)}
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label>Select a date</Label>
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border mt-2"
                                disabled={(date) =>
                                  date < new Date() ||
                                  date > new Date(new Date().setDate(new Date().getDate() + 30))
                                }
                              />
                            </div>

                            <div>
                              <Label>
                                Available times for {selectedDate && format(selectedDate, "MMMM d, yyyy")}
                              </Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {availabilityTimes.length > 0 ? (
                                  availabilityTimes.map((time) => (
                                    <Badge
                                      key={time}
                                      variant={selectedTimeSlot === time ? "default" : "outline"}
                                      className="py-2 px-3 cursor-pointer text-center"
                                      onClick={() => setSelectedTimeSlot(time)}
                                    >
                                      {time}
                                    </Badge>
                                  ))
                                ) : (
                                  <p className="col-span-2 text-center text-muted-foreground py-4">
                                    No time slots available for this date
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleBookSession} className="bg-skill-purple">
                                Send Request
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills I'm Learning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {teacher?.learningSkills?.map((skill) => (
                        <Badge key={skill} variant="secondary" className="py-2 px-3">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-6">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={handleMessageClick}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={review.avatar} alt={review.name} />
                                <AvatarFallback>
                                  {review.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{review.name}</h4>
                                <div className="flex items-center mt-1">
                                  {Array(5).fill(0).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                        }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <p className="mt-3">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No reviews yet</p>
                        <p className="text-sm mt-2">Be the first to review this teacher after your session</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>Teaching Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="date">Select date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border mt-2"
                        disabled={(date) =>
                          date < new Date() ||
                          date > new Date(new Date().setDate(new Date().getDate() + 30))
                        }
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">
                        Available times for {selectedDate && format(selectedDate, "MMMM d, yyyy")}
                      </h3>
                      {availabilityTimes.length > 0 ? (
                        <div className="space-y-2">
                          {availabilityTimes.map((time, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{time}</span>
                              <Button
                                className="ml-auto bg-skill-purple hover:bg-skill-purple-dark"
                                size="sm"
                                onClick={() => {
                                  setSelectedTimeSlot(time);
                                  setDialogOpen(true);
                                }}
                              >
                                Book
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 border rounded-md">
                          <div className="text-center text-muted-foreground">
                            <p>No available times</p>
                            <p className="text-sm mt-2">Try selecting another date</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeacherProfile;
