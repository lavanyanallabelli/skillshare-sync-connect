import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfileData } from "@/hooks/useProfileData";
import { useAuth } from "@/contexts/AuthContext";

export type AvailabilityTimes = string[];

export function useProfilePage() {
  const { isLoggedIn, userId } = useAuth();
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

  const [activeTab, setActiveTab] = useState("profile");
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(new Date());
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [editingExperience, setEditingExperience] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [sessionRequests, setSessionRequests] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<Record<string, string[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const availabilityTimes: AvailabilityTimes = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "5:00 PM - 6:00 PM",
  ];

  // Session request and sessions fetching
  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    try {
      // Fetch pending session requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('sessions')
        .select('*')
        .or(`teacher_id.eq.${userId},student_id.eq.${userId}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setSessionRequests(requestsData || []);

      // Fetch accepted sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .or(`teacher_id.eq.${userId},student_id.eq.${userId}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;
      setUpcomingSessions(sessionsData || []);
    } catch (error) {
      console.error('Error in fetchSessions:', error);
    }
  }, [userId]);

  // Listen for accepted sessions event
  useEffect(() => {
    function handleSessionAccepted(event: any) {
      console.log("Session accepted event received:", event.detail);
      const session = event.detail;
      setUpcomingSessions(prev => {
        // Avoid duplicates
        if (prev.some(s => s.id === session.id)) {
          return prev;
        }
        return [session, ...prev];
      });
      
      // Remove from requests if it was there
      setSessionRequests(prev => prev.filter(req => req.id !== session.id));
    }
    
    window.addEventListener('sessionAccepted', handleSessionAccepted);
    return () => window.removeEventListener('sessionAccepted', handleSessionAccepted);
  }, []);

  // Initial data fetches
  useEffect(() => {
    if (!userId) return;
    fetchSessions();

    // Set up real-time subscription to session changes
    const channel = supabase
      .channel('sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `teacher_id=eq.${userId}`
        },
        () => {
          fetchSessions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `student_id=eq.${userId}`
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchSessions]);

  useEffect(() => {
    if (userData) {
      setBio(userData.bio || "");
    }
  }, [userData]);

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

  return {
    isLoggedIn,
    userId,
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
    refreshUserData,
    activeTab,
    setActiveTab,
    availabilityDate,
    setAvailabilityDate,
    editingBio,
    setEditingBio,
    bio,
    setBio,
    dialogOpen,
    setDialogOpen,
    selectedSession,
    setSelectedSession,
    editingExperience,
    setEditingExperience,
    editingEducation,
    setEditingEducation,
    editingSkills,
    setEditingSkills,
    newSkill,
    setNewSkill,
    sessionRequests,
    setSessionRequests,
    upcomingSessions,
    setUpcomingSessions,
    reviews,
    setReviews,
    selectedTimes,
    setSelectedTimes,
    selectedDate,
    setSelectedDate,
    availabilityTimes,
    handleUpdateProfile,
  };
}
