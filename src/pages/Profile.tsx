
import React, { useState, useEffect } from "react";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTab from "@/components/profile/tabs/ProfileTab";
import ScheduleTab from "@/components/profile/tabs/ScheduleTab";
import AvailabilityTab from "@/components/profile/tabs/AvailabilityTab";
import ReviewsTab from "@/components/profile/tabs/ReviewsTab";
import RequestsTab from "@/components/profile/tabs/RequestsTab";
import { useProfileData } from "@/hooks/useProfileData";
import { supabase } from "@/integrations/supabase/client"; // Added missing import

const Profile: React.FC = () => {
  const { toast } = useToast();
  const { isLoggedIn, userId } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "profile");
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(new Date());
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [editingExperience, setEditingExperience] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const {
    userData,
    setUserData,
    experiences,
    setExperiences,
    educations,
    setEducations,
    skills,
    setSkills,
    teachingSkills,
    learningSkills,
    loading
  } = useProfileData(userId);

  const [sessionRequests, setSessionRequests] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<Record<string, string[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (userData) {
      setBio(userData.bio || "");
    }
  }, [userData]);

  const availabilityTimes = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "5:00 PM - 6:00 PM",
  ];

  const handleUpdateProfile = async (profileData: any) => {
    if (userData && userId) {
      try {
        const [firstName, lastName] = profileData.name?.split(' ') || [userData.firstName, userData.lastName];

        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: firstName || userData.firstName,
            last_name: lastName || userData.lastName,
            location: profileData.location || userData.location,
            occupation: profileData.company || userData.occupation,
            bio: profileData.bio || userData.bio
          })
          .eq('id', userId);
          
        if (error) throw error;

        const updatedUserData = {
          ...userData,
          firstName: firstName || userData.firstName,
          lastName: lastName || userData.lastName,
          location: profileData.location || userData.location,
          occupation: profileData.company || userData.occupation,
          bio: profileData.bio || userData.bio
        };

        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        setUserData(updatedUserData);

        if (profileData.bio) {
          setBio(profileData.bio);
        }

        const event = new CustomEvent('profileUpdated', {
          detail: {
            name: profileData.name,
            location: profileData.location,
            company: profileData.company,
            bio: profileData.bio
          }
        });
        window.dispatchEvent(event);

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error updating profile",
          description: "Failed to update your profile. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <ProfileLayout>
        <div className="container max-w-6xl py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-40 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-20 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-60 rounded-lg"></div>
          </div>
        </div>
      </ProfileLayout>
    );
  }

  const profileData = userData ? {
    id: userData.id,
    name: `${userData.firstName} ${userData.lastName}`,
    avatar: userData.avatar || "/placeholder.svg",
    rating: 4.8,
    location: userData.location,
    company: userData.occupation,
    education: userData.education,
    achievements: ["New Member"],
    bio: userData.bio
  } : {
    name: "User",
    avatar: "/placeholder.svg",
    rating: 4.8,
    location: "",
    company: "",
    education: "",
    achievements: ["New Member"]
  };

  return (
    <ProfileLayout>
      <div className="container max-w-6xl py-8">
        <ErrorBoundary>
          <ProfileHeader
            id={userData?.id}
            name={`${userData?.firstName || ''} ${userData?.lastName || ''}`}
            avatar={userData?.avatar || "/placeholder.svg"}
            rating={4.8}
            location={userData?.location || ""}
            company={userData?.occupation || ""}
            education={userData?.education || ""}
            achievements={["New Member"]}
            bio={userData?.bio}
            isOwnProfile={true}
            onUpdateProfile={handleUpdateProfile}
            teachingSkills={teachingSkills}
            learningSkills={learningSkills}
            upcomingSessions={upcomingSessions}
            setActiveTab={setActiveTab}
          />
        </ErrorBoundary>

        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 w-full justify-start overflow-x-auto">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileTab 
                userData={userData}
                userId={userId}
                bio={bio}
                setBio={setBio}
                editingBio={editingBio}
                setEditingBio={setEditingBio}
                experiences={experiences}
                setExperiences={setExperiences}
                educations={educations}
                setEducations={setEducations}
                skills={skills}
                setSkills={setSkills}
                upcomingSessions={upcomingSessions}
                editingExperience={editingExperience}
                setEditingExperience={setEditingExperience}
                editingEducation={editingEducation}
                setEditingEducation={setEditingEducation}
                editingSkills={editingSkills}
                setEditingSkills={setEditingSkills}
                newSkill={newSkill}
                setNewSkill={setNewSkill}
              />
            </TabsContent>

            <TabsContent value="schedule">
              <ScheduleTab 
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTimes={selectedTimes}
                setSelectedTimes={setSelectedTimes}
                availabilityTimes={availabilityTimes}
              />
            </TabsContent>

            <TabsContent value="availability">
              <AvailabilityTab selectedTimes={selectedTimes} />
            </TabsContent>

            <TabsContent value="reviews">
              <ReviewsTab reviews={reviews} />
            </TabsContent>

            <TabsContent value="requests">
              <RequestsTab 
                sessionRequests={sessionRequests}
                setSessionRequests={setSessionRequests}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Profile;
