
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  skill_id: string;
  created_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  answers: Record<string, string>;
  completed_at: string;
  created_at: string;
}

export const useQuizzes = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAttempts, setUserAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data, error } = await supabase
          .from('skill_quizzes')
          .select('*');
        
        if (error) throw error;
        setQuizzes(data || []);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const fetchQuizQuestions = async (quizId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId);

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz questions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserQuizAttempts = async () => {
    try {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('user_quiz_attempts')
        .select('*, skill_quizzes(*)')
        .eq('user_id', userId);

      if (error) throw error;
      setUserAttempts(data || []);
    } catch (error) {
      console.error('Error fetching user quiz attempts:', error);
    }
  };

  const submitQuizAttempt = async (quizId: string, score: number) => {
    try {
      if (!userId) return null;
      
      const proficiencyLevel = score <= 60 ? 'Beginner' : score <= 85 ? 'Intermediate' : 'Expert';
      
      const { data, error } = await supabase
        .from('user_quiz_attempts')
        .insert({
          user_id: userId,
          quiz_id: quizId,
          score,
          proficiency_level: proficiencyLevel
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh user attempts after submission
      await fetchUserQuizAttempts();
      
      return proficiencyLevel;
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your quiz results',
        variant: 'destructive'
      });
      return null;
    }
  };

  return {
    quizzes,
    currentQuiz,
    questions,
    userAttempts,
    loading,
    setCurrentQuiz,
    fetchQuizQuestions,
    submitQuizAttempt,
    fetchUserQuizAttempts
  };
};
