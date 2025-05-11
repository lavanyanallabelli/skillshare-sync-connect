
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useProfilePage = () => {
  const { userId: loggedInUserId } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [teachingSkills, setTeachingSkills] = useState<string[]>([]);
  const [learningSkills, setLearningSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [bio, setBio] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [sessionRequests, setSessionRequests] = useState<any[]>([]);
  const [editingExperience, setEditingExperience] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimes, setSelectedTimes] = useState<{ [key: string]: string[] }>({});
  const [availabilityTimes, setAvailabilityTimes] = useState<{ [key: string]: string[] }>({});

  const profileUserId = loggedInUserId;
  const userId = profileUserId;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchProfileData = async () => {
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        setUserData(profileData);
        setBio(profileData?.bio || '');

        // Fetch experiences
        const { data: experiencesData, error: experiencesError } = await supabase
          .from('user_experiences')
          .select('*')
          .eq('user_id', userId)
          .order('start_date', { ascending: false });

        if (experiencesError) throw experiencesError;
        setExperiences(experiencesData || []);

        // Fetch educations
        const { data: educationsData, error: educationsError } = await supabase
          .from('user_education')
          .select('*')
          .eq('user_id', userId)
          .order('start_date', { ascending: false });

        if (educationsError) throw educationsError;
        setEducations(educationsData || []);

        // Fetch skills - note there's no user_skills table, using teaching_skills instead
        const { data: skillsData, error: skillsError } = await supabase
          .from('teaching_skills')
          .select('*')
          .eq('user_id', userId);

        if (skillsError) throw skillsError;
        setSkills(skillsData?.map(item => item.skill) || []);

        // Fetch teaching skills
        const { data: teachingSkillsData, error: teachingSkillsError } = await supabase
          .from('teaching_skills')
          .select('*')
          .eq('user_id', userId);

        if (teachingSkillsError) throw teachingSkillsError;
        setTeachingSkills(teachingSkillsData?.map(item => item.skill) || []);

        // Fetch learning skills
         const { data: learningSkillsData, error: learningSkillsError } = await supabase
          .from('learning_skills')
          .select('*')
          .eq('user_id', userId);

        if (learningSkillsError) throw learningSkillsError;
        setLearningSkills(learningSkillsData?.map(item => item.skill) || []);

        // Fetch upcoming sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select(`
            *,
            student:profiles!sessions_student_id_fkey(first_name, last_name),
            teacher:profiles!sessions_teacher_id_fkey(first_name, last_name)
          `)
          .or(`teacher_id.eq.${userId},student_id.eq.${userId}`)
          .in("status", ["accepted"])
          .order("created_at", { ascending: false });

        if (sessionsError) throw sessionsError;

        const transformedSessionsData = sessionsData?.map(session => {
          let partnerName = "";
          if (userId === session.teacher_id && session.student) {
            partnerName = `${session.student.first_name} ${session.student.last_name}`;
          } else if (userId === session.student_id && session.teacher) {
            partnerName = `${session.teacher.first_name} ${session.teacher.last_name}`;
          }

          return {
            ...session,
            day: session.day,
            from: partnerName
          };
        }) || [];

        setUpcomingSessions(transformedSessionsData);

        // Fetch session requests - skip this since session_requests doesn't exist
        // Use sessions table with status filter instead
        const { data: requestsData, error: requestsError } = await supabase
          .from('sessions')
          .select('*')
          .eq('teacher_id', userId)
          .eq('status', 'pending');

        if (requestsError) throw requestsError;
        setSessionRequests(requestsData || []);

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('recipient_id', userId);

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);

        // Fetch availability times
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('user_availability')
          .select('*')
          .eq('user_id', userId);

        if (availabilityError) throw availabilityError;

        const formattedAvailability = availabilityData?.reduce((acc: { [key: string]: string[] }, item) => {
          if (!acc[item.day]) {
            acc[item.day] = [];
          }
          acc[item.day].push(item.time_slot);
          return acc;
        }, {}) || {};

        setAvailabilityTimes(formattedAvailability);
        setSelectedTimes(formattedAvailability);

      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleUpdateProfile = async (profileData: any) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);

      if (error) throw error;

      setUserData(prevData => ({ ...prevData, ...profileData }));
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoggedIn: !!loggedInUserId,
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
  };
};
