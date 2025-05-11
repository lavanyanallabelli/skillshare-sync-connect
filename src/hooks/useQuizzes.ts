import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: any[];
  created_at: string;
}

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        if (!userId) {
          console.log("User not logged in");
          return;
        }

        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching quizzes:", error);
        }

        if (data) {
          setQuizzes(data);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [userId]);

  return { quizzes, loading };
};
