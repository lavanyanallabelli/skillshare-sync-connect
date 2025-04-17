import React, { useState, useEffect, lazy, Suspense } from "react";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-loaded components for better initial load time
const ProfileHeader = lazy(() => import("@/components/profile/ProfileHeader"));
const ProfileTab = lazy(() => import("@/components/profile/tabs/ProfileTab"));
const ScheduleTab = lazy(() => import("@/components/profile/tabs/ScheduleTab"));
const AvailabilityTab = lazy(() => import("@/components/profile/tabs/AvailabilityTab"));
const ReviewsTab = lazy(() => import("@/components/profile/tabs/ReviewsTab"));
const RequestsTab = lazy(() => import("@/components/profile/tabs/RequestsTab"));
const ConnectionList = lazy(() => import("@/components/profile/ConnectionList"));

// Import hook
import { useProfileData } from "@/hooks/useProfileData";

// Loading placeholder
const TabLoadingPlaceholder = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-60 w-full" />
  </div>
);

const Profile: React.FC = () => {
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
    loading,
    refreshUserData
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
      } catch (error) {
        console.error('Error updating profile:', error);
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
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-60 w-full rounded-lg" />
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
          <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
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
          </Suspense>
        </ErrorBoundary>

        <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
          <ConnectionList />
        </Suspense>

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
              <Suspense fallback={<TabLoadingPlaceholder />}>
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
              </Suspense>
            </TabsContent>

            <TabsContent value="schedule">
              <Suspense fallback={<TabLoadingPlaceholder />}>
                <ScheduleTab
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTimes={selectedTimes}
                  setSelectedTimes={setSelectedTimes}
                  availabilityTimes={availabilityTimes}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="availability">
              <Suspense fallback={<TabLoadingPlaceholder />}>
                <AvailabilityTab selectedTimes={selectedTimes} />
              </Suspense>
            </TabsContent>

            <TabsContent value="reviews">
              <Suspense fallback={<TabLoadingPlaceholder />}>
                <ReviewsTab reviews={reviews} />
              </Suspense>
            </TabsContent>

            <TabsContent value="requests">
              <Suspense fallback={<TabLoadingPlaceholder />}>
                <RequestsTab
                  sessionRequests={sessionRequests}
                  setSessionRequests={setSessionRequests}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Profile;
