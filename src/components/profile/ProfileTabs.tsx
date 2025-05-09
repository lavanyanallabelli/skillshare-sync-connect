import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import TabLoadingPlaceholder from "./TabLoadingPlaceholder";

// Lazy tab components
const ProfileTab = lazy(() => import("./tabs/ProfileTab"));
const ScheduleTab = lazy(() => import("./tabs/ScheduleTab"));
const AvailabilityTab = lazy(() => import("./tabs/AvailabilityTab"));
const ReviewsTab = lazy(() => import("./tabs/ReviewsTab"));
const RequestsTab = lazy(() => import("./tabs/RequestsTab"));
const QuizTab = lazy(() => import("./tabs/QuizTab"));

interface ProfileTabsProps {
  tabProps: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ tabProps, activeTab, setActiveTab }) => {
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="availability">Availability</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="requests">Requests</TabsTrigger>
        <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
      </TabsList>

        <TabsContent value="profile">
          <Suspense fallback={<TabLoadingPlaceholder />}>
            <ProfileTab {...tabProps.profileTabProps} />
          </Suspense>
        </TabsContent>
        <TabsContent value="schedule">
          <Suspense fallback={<TabLoadingPlaceholder />}>
            <ScheduleTab {...tabProps.scheduleTabProps} />
          </Suspense>
        </TabsContent>
        <TabsContent value="availability">
          <Suspense fallback={<TabLoadingPlaceholder />}>
            <AvailabilityTab {...tabProps.availabilityTabProps} />
          </Suspense>
        </TabsContent>
        <TabsContent value="reviews">
          <Suspense fallback={<TabLoadingPlaceholder />}>
            <ReviewsTab {...tabProps.reviewsTabProps} />
          </Suspense>
        </TabsContent>
        <TabsContent value="requests">
          <Suspense fallback={<TabLoadingPlaceholder />}>
            <RequestsTab {...tabProps.requestsTabProps} />
          </Suspense>
        </TabsContent>
        <TabsContent value="quizzes">
          <Suspense fallback={<TabLoadingPlaceholder />}>
            <QuizTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
