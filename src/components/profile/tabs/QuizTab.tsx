
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useQuizzes } from '@/hooks/useQuizzes';
import { Book, Award } from "lucide-react";

const QuizTab: React.FC = () => {
  const { 
    quizzes, 
    currentQuiz, 
    questions, 
    userAttempts, 
    setCurrentQuiz, 
    fetchQuizQuestions, 
    submitQuizAttempt,
    fetchUserQuizAttempts 
  } = useQuizzes();

  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    fetchUserQuizAttempts();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      const quiz = quizzes.find(q => q.id === selectedQuiz);
      setCurrentQuiz(quiz || null);
      fetchQuizQuestions(selectedQuiz);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setQuizCompleted(false);
    }
  }, [selectedQuiz]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestionIndex].correct_answer) {
      setScore(prev => prev + 20);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    if (currentQuiz) {
      const proficiencyLevel = await submitQuizAttempt(currentQuiz.id, score);
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted && currentQuiz) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex justify-center mb-4">
            <Award className="h-16 w-16 text-yellow-500" />
          </div>
          <p>Your Score: {score}%</p>
          <p>Proficiency Level: 
            {score <= 60 ? 'Beginner' : score <= 85 ? 'Average' : 'Expert'}
          </p>
          <Button onClick={resetQuiz} className="mt-4">Take Another Quiz</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedQuiz && (
        <Card>
          <CardHeader>
            <CardTitle>Available Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {quizzes.map(quiz => (
                <Button 
                  key={quiz.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setSelectedQuiz(quiz.id)}
                >
                  <Book className="mr-2 h-4 w-4" />
                  {quiz.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedQuiz && questions.length > 0 && !quizCompleted && (
        <Card>
          <CardHeader>
            <CardTitle>{currentQuiz?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <h3 className="text-lg font-semibold">
                {questions[currentQuestionIndex].question_text}
              </h3>
              
              <RadioGroup 
                onValueChange={handleAnswerSelect} 
                value={selectedAnswer || undefined}
              >
                {JSON.parse(questions[currentQuestionIndex].options).map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between">
                <Button variant="outline" onClick={resetQuiz}>
                  Cancel Quiz
                </Button>
                <Button 
                  onClick={handleNextQuestion} 
                  disabled={!selectedAnswer}
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {userAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Quiz History</CardTitle>
          </CardHeader>
          <CardContent>
            {userAttempts.map((attempt, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-3 border-b"
              >
                <span>{attempt.skill_quizzes.skill_name} Quiz</span>
                <div className="flex items-center space-x-2">
                  <span>Score: {attempt.score}%</span>
                  <Badge variant="outline">{attempt.proficiency_level}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizTab;
