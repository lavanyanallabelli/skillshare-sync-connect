
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export const useProfilePage = () => {
  const { userId, isLoggedIn } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [teachingSkills, setTeachingSkills] = useState<string[]>([]);
  const [learningSkills, setLearningSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [sessionRequests, setSessionRequests] = useState<any[]>([]);
  const [editingExperience, setEditingExperience] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimes, setSelectedTimes] = useState<Record<string, string[]>>({});
  const [availabilityTimes, setAvailabilityTimes] = useState<Record<string, string[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        setUserData(profileData);
        setBio(profileData?.bio || "");

        // Fetch experiences
        const { data: experiencesData, error: experiencesError } = await supabase
          .from("user_experiences")
          .select("*")
          .eq("user_id", userId)
          .order("start_date", { ascending: false });

        if (experiencesError) throw experiencesError;
        setExperiences(experiencesData || []);

        // Fetch educations
        const { data: educationsData, error: educationsError } = await supabase
          .from("user_education")
          .select("*")
          .eq("user_id", userId)
          .order("start_date", { ascending: false });

        if (educationsError) throw educationsError;
        setEducations(educationsData || []);

        // Fetch teaching skills
        const { data: teachingSkillsData, error: teachingSkillsError } = await supabase
          .from("teaching_skills")
          .select("skill")
          .eq("user_id", userId);

        if (teachingSkillsError) throw teachingSkillsError;
        setTeachingSkills(teachingSkillsData?.map((item) => item.skill) || []);
        // Use teaching skills as the primary skills list
        setSkills(teachingSkillsData?.map((item) => item.skill) || []);

        // Fetch learning skills
        const { data: learningSkillsData, error: learningSkillsError } = await supabase
          .from("learning_skills")
          .select("skill")
          .eq("user_id", userId);

        if (learningSkillsError) throw learningSkillsError;
        setLearningSkills(learningSkillsData?.map((item) => item.skill) || []);
        
        // Fetch upcoming sessions - use explicit typing to avoid infinite type instantiation
        const { data: sessionsData, error: sessionsError } = await supabase
          .from("sessions")
          .select(`
            id, day, time_slot, skill, status, meeting_link, created_at, updated_at, 
            teacher_id, student_id,
            student:profiles!sessions_student_id_fkey(first_name, last_name),
            teacher:profiles!sessions_teacher_id_fkey(first_name, last_name)
          `)
          .or(`teacher_id.eq.${userId},student_id.eq.${userId}`)
          .in("status", ["accepted"])
          .order("created_at", { ascending: false });

        if (sessionsError) throw sessionsError;

        // Transform the data to ensure consistent date formatting and names
        const transformedSessionsData = sessionsData?.map((session) => {
          let partnerName = "";
          if (userId === session.teacher_id && session.student) {
            partnerName = `${session.student.first_name} ${session.student.last_name}`;
          } else if (userId === session.student_id && session.teacher) {
            partnerName = `${session.teacher.first_name} ${session.teacher.last_name}`;
          }

          return {
            ...session,
            day: session.day,
            from: partnerName,
          };
        }) || [];

        setUpcomingSessions(transformedSessionsData);

        // Fetch session requests with explicit type selection
        const { data: requestsData, error: requestsError } = await supabase
          .from("sessions")
          .select(`
            id, day, time_slot, skill, status, meeting_link, created_at, updated_at,
            teacher_id, student_id,
            student:profiles!sessions_student_id_fkey(first_name, last_name),
            teacher:profiles!sessions_teacher_id_fkey(first_name, last_name)
          `)
          .or(`teacher_id.eq.${userId},student_id.eq.${userId}`)
          .in("status", ["pending"])
          .order("created_at", { ascending: false });

        if (requestsError) throw requestsError;

        const transformedRequestsData = requestsData?.map((session) => {
          let partnerName = "";
          if (userId === session.teacher_id && session.student) {
            partnerName = `${session.student.first_name} ${session.student.last_name}`;
          } else if (userId === session.student_id && session.teacher) {
            partnerName = `${session.teacher.first_name} ${session.teacher.last_name}`;
          }

          return {
            ...session,
            day: session.day,
            from: partnerName,
          };
        }) || [];

        setSessionRequests(transformedRequestsData);

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*")
          .eq("teacher_id", userId);

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);
      } catch (error: any) {
        console.error("Error fetching profile data:", error.message);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, toast]);

  const handleUpdateProfile = async (profileData: any) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", userId);

      if (error) throw error;

      setUserData((prevUserData: any) => ({
        ...prevUserData,
        ...profileData,
      }));

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setEditingBio(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const fetchAvailability = async () => {
      console.log("Fetching availability for user:", userId);

      const { data, error } = await supabase
        .from("user_availability")
        .select("day, time_slot")
        .eq("user_id", userId)
        .eq("is_available", true);

      if (error) {
        console.error("Error fetching availability:", error);
        return;
      }

      console.log("Availability data from database:", data);

      const availabilityMap = data?.reduce((acc: Record<string, string[]>, curr) => {
        const dateKey = curr.day;
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(curr.time_slot);
        return acc;
      }, {}) || {};

      console.log("Processed availability map:", availabilityMap);

      setAvailabilityTimes(availabilityMap);
    };

    fetchAvailability();
  }, [userId]);

  return {
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
    selectedDate,
    setSelectedDate,
    selectedTimes,
    setSelectedTimes,
    availabilityTimes,
  };
};
