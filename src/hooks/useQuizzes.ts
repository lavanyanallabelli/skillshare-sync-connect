import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuth } from "@/contexts/AuthContext";

interface Quiz {
  id: string;
  skill_name: string;
  title: string;
  description: string;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
}

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAttempts, setUserAttempts] = useState<any[]>([]);
  const { userId } = useAuth();
  const { toast } = useToast();

  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from('skill_quizzes')
      .select('*');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch quizzes",
        variant: "destructive"
      });
      return;
    }
    setQuizzes(data || []);
  };

  const fetchQuizQuestions = async (quizId: string) => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch quiz questions",
        variant: "destructive"
      });
      return;
    }
    
    // Transform the data to ensure options is a string array
    const formattedData = data?.map(item => ({
      id: item.id,
      question_text: item.question_text,
      options: Array.isArray(item.options) ? item.options : JSON.parse(item.options as string),
      correct_answer: item.correct_answer
    })) || [];
    
    setQuestions(formattedData);
  };

  const submitQuizAttempt = async (quizId: string, score: number) => {
    if (!userId) return;

    const proficiencyLevel = 
      score <= 60 ? 'Beginner' : 
      score <= 85 ? 'Average' : 
      'Expert';

    const { error } = await supabase
      .from('user_quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        score,
        proficiency_level: proficiencyLevel
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit quiz attempt",
        variant: "destructive"
      });
      return null;
    }

    toast({
      title: "Quiz Completed",
      description: `Your score: ${score}%. Proficiency: ${proficiencyLevel}`
    });

    return proficiencyLevel;
  };

  const fetchUserQuizAttempts = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('user_quiz_attempts')
      .select('*, skill_quizzes(skill_name)')
      .eq('user_id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch quiz attempts",
        variant: "destructive"
      });
      return;
    }
    setUserAttempts(data || []);
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  return {
    quizzes,
    currentQuiz,
    questions,
    userAttempts,
    setCurrentQuiz,
    fetchQuizQuestions,
    submitQuizAttempt,
    fetchUserQuizAttempts
  };
}
