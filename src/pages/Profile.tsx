import React, { lazy, Suspense, useEffect } from "react";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { useSearchParams } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfilePage } from "@/hooks/useProfilePage";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { supabase, checkSupabaseConnection } from "@/integrations/supabase/client";

const ProfileHeader = lazy(() => import("@/components/profile/ProfileHeader"));
const ConnectionList = lazy(() => import("@/components/profile/ConnectionList"));

const Profile: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const {
    isLoggedIn,
    userData,
    userId,
    experiences,
    setExperiences,
    educations,
    setEducations,
    skills,
    setSkills,
    teachingSkills,
    learningSkills,
    loading,
    activeTab,
    setActiveTab,
    bio,
    setBio,
    editingBio,
    setEditingBio,
    upcomingSessions,
    sessionRequests,
    setSessionRequests,
    handleUpdateProfile,
    editingExperience,
    setEditingExperience,
    editingEducation,
    setEditingEducation,
    editingSkills,
    setEditingSkills,
    newSkill,
    setNewSkill,
    reviews,
    setReviews,
    selectedTimes,
    setSelectedTimes,
    selectedDate,
    setSelectedDate,
    availabilityTimes,
  } = useProfilePage();

  const { createNotification } = useNotifications(userId);

  // Verify Supabase connection when profile loads
  useEffect(() => {
    if (userId) {
      checkSupabaseConnection().then(isConnected => {
        console.log(`[Profile] Supabase connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);
      });
    }
  }, [userId]);

  // Keep tab state and URL in sync
  React.useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  React.useEffect(() => {
    if (activeTab && tabFromUrl !== activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab]);

  // Test function to create a notification
  const testCreateNotification = async () => {
    if (!userId) return;
    
    try {
      console.log("[Profile] Testing notification creation");
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'test',
          title: 'Test Notification',
          description: 'This is a test notification created at ' + new Date().toLocaleTimeString(),
          action_url: '/profile',
          read: false,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error("[Profile] Error creating test notification:", error);
      } else {
        console.log("[Profile] Test notification created:", data);
      }
    } catch (err) {
      console.error("[Profile] Exception when creating test notification:", err);
    }
  };

  // Map props for each tab
  const tabProps = {
    profileTabProps: {
      userData,
      userId,
      bio,
      setBio,
      experiences,
      setExperiences,
      educations,
      setEducations,
      skills,
      setSkills,
      upcomingSessions,
      editingBio,
      setEditingBio,
      editingExperience,
      setEditingExperience,
      editingEducation,
      setEditingEducation,
      editingSkills,
      setEditingSkills,
      newSkill,
      setNewSkill,
    },
    scheduleTabProps: {
      selectedDate,
      setSelectedDate,
      selectedTimes,
      setSelectedTimes,
      availabilityTimes,
    },
    sessionsTabProps: {
      upcomingSessions,
    },
    availabilityTabProps: {
      selectedTimes,
      profileUserId: userId || "",
      onDelete: (date: string, time: string) => {
        const updatedTimes = { ...selectedTimes };
        if (updatedTimes[date]) {
          updatedTimes[date] = updatedTimes[date].filter((t) => t !== time);
          if (updatedTimes[date].length === 0) {
            delete updatedTimes[date];
          }
          setSelectedTimes(updatedTimes);
        }
      },
    },
    reviewsTabProps: {
      reviews,
    },
    requestsTabProps: {
      sessionRequests,
      setSessionRequests,
      userId,
    },
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

  return (
    <ProfileLayout>
      <div className="container max-w-6xl py-8">
        <ErrorBoundary>
          <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
            <ProfileHeader
              id={userData?.id}
              name={`${userData?.firstName || ""} ${userData?.lastName || ""}`}
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

        {/* Debug section - only visible in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 mb-4 p-4 border border-dashed border-red-300 rounded-md">
            <h4 className="text-sm font-semibold text-red-500">Debug Tools</h4>
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testCreateNotification}
                className="text-xs"
              >
                Test Create Notification
              </Button>
            </div>
          </div>
        )}

        <ProfileTabs
          tabProps={tabProps}
          activeTab={tabFromUrl || activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </ProfileLayout>
  );
};

export default Profile;
