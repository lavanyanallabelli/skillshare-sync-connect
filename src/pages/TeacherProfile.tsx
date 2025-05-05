
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase, createNotification } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Star, MapPin, Briefcase, GraduationCap, Clock } from "lucide-react";
import ProfileLayout from "@/components/layout/ProfileLayout";
import ReviewCard from "@/components/profile/ReviewCard";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";

const TeacherProfile = () => {
  const { id: teacherId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuth();
  const { toast } = useToast();

  const {
    teacherData,
    teachingSkills,
    reviews,
    availabilityByDate,
    loading,
    error,
  } = useTeacherProfile(teacherId || "");

  const [step, setStep] = useState(1);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (selectedDate && availabilityByDate) {
      setAvailableTimeSlots(availabilityByDate[selectedDate] || []);
      setSelectedTimeSlot(null);
    }
  }, [selectedDate, availabilityByDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setSelectedDate(formattedDate);
    }
  };

  const bookSession = async () => {
    if (!teacherId || !userId || !selectedSkill) return;

    try {
      setIsBooking(true);

      // Existing code to create a session
      const { data: session, error } = await supabase
        .from("sessions")
        .insert({
          teacher_id: teacherId,
          student_id: userId,
          skill: selectedSkill,
          day: selectedDate,
          time_slot: selectedTimeSlot,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Error booking session:", error);
        toast({
          title: "Booking Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Add notification for the teacher
      await createNotification(
        teacherId,
        'session',
        'New Session Request',
        `You have a new session request for ${selectedSkill} on ${format(new Date(selectedDate), 'MMMM d')} at ${selectedTimeSlot}`,
        '/profile?tab=requests'
      );

      console.log("Session booked successfully:", session);
      toast({
        title: "Session Booked",
        description: "Your session has been requested. You'll be notified when confirmed.",
      });

      // Rest of the existing code...
      setStep(3);
    } catch (error) {
      console.error("Error in bookSession:", error);
      toast({
        title: "Booking Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <ProfileLayout>
        <div className="container max-w-6xl py-8">
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-60 w-full rounded-lg" />
          </div>
        </div>
      </ProfileLayout>
    );
  }

  if (error || !teacherData) {
    return (
      <ProfileLayout>
        <div className="container max-w-6xl py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Error</h2>
            <p className="text-muted-foreground">
              Failed to load teacher profile. Please try again later.
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate("/search")}
              variant="outline"
            >
              Back to Search
            </Button>
          </div>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="container max-w-6xl py-8">
        {/* Teacher Header */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={teacherData.avatar_url || "/placeholder.svg"}
                  alt={`${teacherData.first_name} ${teacherData.last_name}`}
                />
                <AvatarFallback>
                  {teacherData.first_name?.[0]}
                  {teacherData.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div>
                  <h1 className="text-2xl font-bold">
                    {teacherData.first_name} {teacherData.last_name}
                  </h1>
                  <p className="text-muted-foreground">
                    {teacherData.headline || "SkillSync Teacher"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {reviews && reviews.length > 0
                      ? (
                          reviews.reduce(
                            (acc, review) => acc + review.rating,
                            0
                          ) / reviews.length
                        ).toFixed(1)
                      : "New"}
                  </span>
                  <span className="text-muted-foreground">
                    ({reviews ? reviews.length : 0})
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {teachingSkills && teachingSkills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.skill}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {teacherData.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{teacherData.location}</span>
                  </div>
                )}
                {teacherData.occupation && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{teacherData.occupation}</span>
                  </div>
                )}
                {teacherData.education && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{teacherData.education}</span>
                  </div>
                )}
              </div>

              {teacherData.bio && (
                <div className="mt-4">
                  <p className="text-sm">{teacherData.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left Column - Book Session */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book a Session</CardTitle>
              </CardHeader>
              <CardContent>
                {!isLoggedIn ? (
                  <div className="text-center py-6">
                    <p className="mb-4">
                      Please log in to book a session with this teacher.
                    </p>
                    <Button onClick={() => navigate("/login")}>Log In</Button>
                  </div>
                ) : step === 1 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 font-medium">Select a Skill</h3>
                      <Select
                        value={selectedSkill || ""}
                        onValueChange={(value) => setSelectedSkill(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a skill" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachingSkills && teachingSkills.map((skill) => (
                            <SelectItem key={skill.id} value={skill.skill}>
                              {skill.skill}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setStep(2)}
                        disabled={!selectedSkill}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : step === 2 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 font-medium">Select Date & Time</h3>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <Calendar
                            mode="single"
                            selected={
                              selectedDate
                                ? new Date(selectedDate)
                                : undefined
                            }
                            onSelect={handleDateSelect}
                            disabled={(date) => {
                              const formattedDate = format(date, "yyyy-MM-dd");
                              return (
                                !availabilityByDate[formattedDate] ||
                                availabilityByDate[formattedDate].length === 0 ||
                                date < new Date()
                              );
                            }}
                            className="rounded-md border"
                          />
                        </div>
                        <div>
                          {selectedDate ? (
                            availableTimeSlots.length > 0 ? (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">
                                  Available Times
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {availableTimeSlots.map((timeSlot) => (
                                    <Button
                                      key={timeSlot}
                                      variant={
                                        selectedTimeSlot === timeSlot
                                          ? "default"
                                          : "outline"
                                      }
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        setSelectedTimeSlot(timeSlot)
                                      }
                                    >
                                      <Clock className="h-4 w-4" />
                                      {timeSlot}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <p className="text-center text-muted-foreground">
                                  No available times for this date
                                </p>
                              </div>
                            )
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <p className="text-center text-muted-foreground">
                                Select a date to see available times
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button
                        onClick={bookSession}
                        disabled={!selectedTimeSlot || isBooking}
                      >
                        {isBooking ? "Booking..." : "Book Session"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <h3 className="mb-4 text-xl font-medium text-green-600">
                      Session Requested!
                    </h3>
                    <p className="mb-6">
                      Your session request has been sent to{" "}
                      {teacherData.first_name}. You'll receive a notification
                      when they accept or decline.
                    </p>
                    <Button onClick={() => navigate("/sessions")}>
                      View My Sessions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Reviews */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                    {reviews.length > 3 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          const reviewsTab = document.getElementById(
                            "reviews-tab"
                          );
                          if (reviewsTab) {
                            reviewsTab.click();
                          }
                        }}
                      >
                        View All Reviews
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="py-4 text-center text-muted-foreground">
                    No reviews yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8">
          <Tabs defaultValue="about">
            <TabsList className="mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger id="reviews-tab" value="reviews">
                Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="about">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-lg font-medium">Bio</h3>
                      <p className="text-muted-foreground">
                        {teacherData.bio || "No bio provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-medium">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {teachingSkills && teachingSkills.map((skill) => (
                          <Badge key={skill.id} variant="secondary">
                            {skill.skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="availability">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">
                      Available Time Slots
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {availabilityByDate && Object.entries(availabilityByDate).map(
                        ([date, timeSlots]) => (
                          <Card key={date}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">
                                {format(new Date(date), "EEEE, MMMM d")}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {timeSlots.map((timeSlot) => (
                                  <Badge key={timeSlot} variant="outline">
                                    {timeSlot}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">
                      Student Reviews ({reviews ? reviews.length : 0})
                    </h3>
                    {reviews && reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-muted-foreground">
                        No reviews yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default TeacherProfile;
