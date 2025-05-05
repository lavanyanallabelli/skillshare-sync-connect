
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTeacherProfile = (teacherId: string) => {
  const [teacherData, setTeacherData] = useState<any>(null);
  const [teachingSkills, setTeachingSkills] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [availabilityByDate, setAvailabilityByDate] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      if (!teacherId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get teacher profile
        const { data: teacherProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", teacherId)
          .single();

        if (profileError) throw profileError;
        
        // Get teaching skills
        const { data: skills, error: skillsError } = await supabase
          .from("teaching_skills")
          .select("*")
          .eq("user_id", teacherId);

        if (skillsError) throw skillsError;
        
        // Get reviews for this teacher
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select(`
            *,
            reviewer:reviewer_id (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq("recipient_id", teacherId);

        if (reviewsError) throw reviewsError;
        
        // Get availability
        const { data: availability, error: availabilityError } = await supabase
          .from("user_availability")
          .select("*")
          .eq("user_id", teacherId)
          .gte("day", new Date().toISOString().split("T")[0]);

        if (availabilityError) throw availabilityError;
        
        // Process availability by date
        const availabilityMap: Record<string, string[]> = {};
        if (availability && availability.length > 0) {
          availability.forEach((slot) => {
            const dateStr = slot.day;
            if (!availabilityMap[dateStr]) {
              availabilityMap[dateStr] = [];
            }
            availabilityMap[dateStr].push(slot.time_slot);
          });
        }

        // Format reviews data
        const formattedReviews = reviewsData?.map((review) => {
          return {
            ...review,
            reviewer_name: review.reviewer ? `${review.reviewer.first_name} ${review.reviewer.last_name}` : "Anonymous",
            reviewer_avatar: review.reviewer?.avatar_url || null
          };
        }) || [];

        setTeacherData(teacherProfile);
        setTeachingSkills(skills || []);
        setReviews(formattedReviews);
        setAvailabilityByDate(availabilityMap);
        
      } catch (err: any) {
        console.error("Error fetching teacher profile:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, [teacherId]);

  return {
    teacherData,
    teachingSkills,
    reviews,
    availabilityByDate,
    loading,
    error
  };
};
