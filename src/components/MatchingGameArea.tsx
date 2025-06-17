'use client';

import { useState, useEffect, useMemo, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Questionnaire, Question as QuestionType, Answer as AnswerType, UserAnswers, User, GameAttempt } from '@/lib/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, CheckCircle, XCircle, Shuffle, RotateCcw, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateHints, GenerateHintsInput } from '@/ai/flows/generate-hints';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from "@/components/ui/progress";


interface MatchingGameAreaProps {
  questionnaire: Questionnaire;
  question: QuestionType;
}

interface DraggableAnswer extends AnswerType {
  originalUserId: string; // Keep track of who actually wrote it, for AI hints and scoring
  originalUserName: string;
}

interface UserDropTarget {
  id: string;
  name: string;
  matchedAnswerId: string | null;
}

export default function MatchingGameArea({ questionnaire, question }: MatchingGameAreaProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [allUserAnswers] = useLocalStorage<UserAnswers[]>('userAnswers', []);
  const [currentUser] = useLocalStorage<User | null>('currentUser', null);
  const [gameAttempts, setGameAttempts] = useLocalStorage<GameAttempt[]>('gameAttempts', []);

  const [shuffledAnswers, setShuffledAnswers] = useState<DraggableAnswer[]>([]);
  const [userTargets, setUserTargets] = useState<UserDropTarget[]>([]);
  const [draggedAnswer, setDraggedAnswer] = useState<DraggableAnswer | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [isLoadingHints, setIsLoadingHints] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [attemptSaved, setAttemptSaved] = useState(false);

  const relevantUserAnswers = useMemo(() => {
    return allUserAnswers.filter(ua => ua.questionnaireId === questionnaire.id);
  }, [allUserAnswers, questionnaire.id]);

  useEffect(() => {
    if (relevantUserAnswers.length < 2) return; // Need at least 2 players

    const answersForThisQuestion: DraggableAnswer[] = [];
    const usersInGame: UserDropTarget[] = [];
    const userSet = new Set<string>();

    relevantUserAnswers.forEach(ua => {
      const userAnswerForQuestion = ua.answers.find(ans => ans.questionId === question.id);
      if (userAnswerForQuestion) {
        answersForThisQuestion.push({
          id: ua.userId + '-' + question.id, // Create a unique ID for draggable answer instance
          questionId: question.id,
          userId: ua.userId, // This will be hidden from player initially
          text: userAnswerForQuestion.text,
          submittedAt: ua.submittedAt,
          originalUserId: ua.userId,
          originalUserName: ua.userName,
        });
        
        if (!userSet.has(ua.userId)) {
          usersInGame.push({ id: ua.userId, name: ua.userName, matchedAnswerId: null });
          userSet.add(ua.userId);
        }
      }
    });

    // Shuffle answers
    setShuffledAnswers([...answersForThisQuestion].sort(() => Math.random() - 0.5));
    // Shuffle user targets to make it non-obvious
    setUserTargets([...usersInGame].sort(() => Math.random() - 0.5));

  }, [relevantUserAnswers, question.id, question.text, questionnaire.id]);
  
  const handleDragStart = (e: DragEvent<HTMLDivElement>, answer: DraggableAnswer) => {
    setDraggedAnswer(answer);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add('opacity-50', 'ring-2', 'ring-primary');
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'ring-2', 'ring-primary');
    setDraggedAnswer(null);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add('bg-accent/20');
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-accent/20');
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetUser: UserDropTarget) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-accent/20');
    if (!draggedAnswer || gameOver) return;

    setUserTargets(prevTargets =>
      prevTargets.map(ut => {
        // If this answer was previously on another user, unassign it
        if (ut.matchedAnswerId === draggedAnswer.id) {
          return { ...ut, matchedAnswerId: null };
        }
        // Assign to new target user
        if (ut.id === targetUser.id) {
          return { ...ut, matchedAnswerId: draggedAnswer.id };
        }
        return ut;
      })
    );

    // Make the dropped answer un-draggable from the source list if desired, or simply visually indicate it's placed
    // For simplicity, we allow re-dragging. The main state is `userTargets`.
  };

  const availableAnswers = useMemo(() => {
    const matchedAnswerIds = new Set(userTargets.map(ut => ut.matchedAnswerId).filter(Boolean));
    return shuffledAnswers.filter(ans => !matchedAnswerIds.has(ans.id));
  }, [userTargets, shuffledAnswers]);

  const progress = useMemo(() => {
    const totalSlots = userTargets.length;
    const filledSlots = userTargets.filter(ut => ut.matchedAnswerId !== null).length;
    return totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0;
  }, [userTargets]);

  const handleSubmitGuesses = () => {
    if (gameOver) return;
    let currentScore = 0;
    userTargets.forEach(ut => {
      if (ut.matchedAnswerId) {
        const matchedAnswer = shuffledAnswers.find(ans => ans.id === ut.matchedAnswerId);
        if (matchedAnswer && matchedAnswer.originalUserId === ut.id) {
          currentScore++;
        }
      }
    });
    setScore(currentScore);
    setGameOver(true);

    if (currentUser && !attemptSaved) {
      const newAttempt: GameAttempt = {
        id: crypto.randomUUID(),
        questionnaireId: questionnaire.id,
        questionId: question.id,
        playerId: currentUser.id,
        playerName: currentUser.name,
        matches: userTargets.map(ut => ({
          answerId: ut.matchedAnswerId || '', // Store what answer was dragged to this user
          guessedUserId: ut.id, 
        })),
        score: currentScore,
        playedAt: new Date().toISOString(),
      };
      setGameAttempts([...gameAttempts, newAttempt]);
      setAttemptSaved(true);
      toast({title: "Game Over!", description: `Your score: ${currentScore}/${userTargets.length}. Results saved.`});
    } else if (!currentUser) {
       toast({title: "Game Over!", description: `Your score: ${currentScore}/${userTargets.length}. Sign in to save results.`});
    }
  };
  
  const handleGetHints = async () => {
    if (hints.length > 0 || isLoadingHints) {
      setShowHints(true);
      return;
    }
    setIsLoadingHints(true);
    setShowHints(false);

    const answersForAI: GenerateHintsInput['answers'] = shuffledAnswers.map(ans => ({
      userId: ans.originalUserId, // Use original user ID for AI
      answerText: ans.text,
    }));

    try {
      const result = await generateHints({
        question: question.text,
        answers: answersForAI,
        numHints: 2,
      });
      setHints(result.hints);
      setShowHints(true);
      toast({ title: "Hints Generated!", description: "Check the hints section." });
    } catch (error) {
      console.error("Error generating hints:", error);
      toast({ title: "Error", description: "Could not generate hints.", variant: "destructive" });
    } finally {
      setIsLoadingHints(false);
    }
  };

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setHints([]);
    setShowHints(false);
    setIsLoadingHints(false);
    setAttemptSaved(false);
    
    // Re-initialize game state (shuffle answers and targets)
    const answersForThisQuestion: DraggableAnswer[] = [];
    const usersInGame: UserDropTarget[] = [];
    const userSet = new Set<string>();

    relevantUserAnswers.forEach(ua => {
      const userAnswerForQuestion = ua.answers.find(ans => ans.questionId === question.id);
      if (userAnswerForQuestion) {
        answersForThisQuestion.push({
          id: ua.userId + '-' + question.id,
          questionId: question.id,
          userId: ua.userId,
          text: userAnswerForQuestion.text,
          submittedAt: ua.submittedAt,
          originalUserId: ua.userId,
          originalUserName: ua.userName,
        });
        if (!userSet.has(ua.userId)) {
          usersInGame.push({ id: ua.userId, name: ua.userName, matchedAnswerId: null });
          userSet.add(ua.userId);
        }
      }
    });
    setShuffledAnswers([...answersForThisQuestion].sort(() => Math.random() - 0.5));
    setUserTargets([...usersInGame].sort(() => Math.random() - 0.5));
  };

  if (relevantUserAnswers.length < 2) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-destructive">Not Enough Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <p>At least two people need to answer this questionnaire before you can play the matching game.</p>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">{question.text}</CardTitle>
          <CardDescription>Drag the answers to the person you think wrote them.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Draggable Answers Column */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><Shuffle className="h-5 w-5 text-accent"/> Shuffled Answers</CardTitle>
            <CardDescription>Drag these answers to the user profiles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 min-h-[200px] p-4 bg-secondary/20 rounded-md">
            {availableAnswers.map((answer) => (
              <div
                key={answer.id}
                draggable={!gameOver}
                onDragStart={(e) => handleDragStart(e, answer)}
                onDragEnd={handleDragEnd}
                className={`p-3 border rounded-md bg-card shadow-sm cursor-grab ${gameOver ? 'cursor-not-allowed' : ''} hover:shadow-md transition-shadow`}
              >
                <p className="text-sm text-foreground">{answer.text}</p>
              </div>
            ))}
            {availableAnswers.length === 0 && !gameOver && (
              <p className="text-sm text-muted-foreground text-center py-4">All answers placed! Ready to submit?</p>
            )}
             {gameOver && (
              <p className="text-sm text-muted-foreground text-center py-4">Game over. Check your results below or play again.</p>
            )}
          </CardContent>
        </Card>

        {/* User Drop Targets Column */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Who Said It?</CardTitle>
            <CardDescription>Drop answers onto the correct user.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="mb-4">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground text-right mt-1">{Math.round(progress)}% Matched</p>
            </div>
            {userTargets.map((user) => {
              const matchedAnswerInstance = user.matchedAnswerId ? shuffledAnswers.find(ans => ans.id === user.matchedAnswerId) : null;
              const isCorrect = gameOver && matchedAnswerInstance && matchedAnswerInstance.originalUserId === user.id;
              const isIncorrect = gameOver && matchedAnswerInstance && matchedAnswerInstance.originalUserId !== user.id;
              
              return (
                <div
                  key={user.id}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, user)}
                  className={`p-4 border rounded-md min-h-[80px] transition-colors flex flex-col justify-center items-center shadow-sm ${gameOver && matchedAnswerInstance ? (isCorrect ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500') : 'bg-card hover:bg-accent/10'}`}
                >
                  <p className="font-semibold text-lg text-primary mb-1">{user.name}</p>
                  {matchedAnswerInstance ? (
                    <div className={`w-full p-2 border rounded-md text-sm ${gameOver && isCorrect ? 'bg-green-200' : gameOver && isIncorrect ? 'bg-red-200' : 'bg-secondary/50'}`}>
                      <p className="italic line-clamp-2">{matchedAnswerInstance.text}</p>
                      {gameOver && (
                        <div className="flex items-center mt-1 text-xs">
                          {isCorrect ? <CheckCircle className="h-4 w-4 text-green-700 mr-1" /> : <XCircle className="h-4 w-4 text-red-700 mr-1" />}
                          {isCorrect ? "Correct!" : `Incorrect! (Answer by ${matchedAnswerInstance.originalUserName})`}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Drop an answer here</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
      
      {showHints && hints.length > 0 && (
        <Alert variant="default" className="bg-accent/10 border-accent/50 text-accent-foreground">
           <Lightbulb className="h-5 w-5 text-accent" />
          <AlertTitle className="text-accent">AI Hints</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1">
              {hints.map((hint, index) => <li key={index}>{hint}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t">
        {!gameOver && (
          <>
            <Button onClick={handleGetHints} variant="outline" disabled={isLoadingHints || gameOver}>
              <Lightbulb className="mr-2 h-4 w-4" /> {isLoadingHints ? "Getting Hints..." : hints.length > 0 ? "Show Hints" : "Get AI Hints"}
            </Button>
            <Button onClick={handleSubmitGuesses} disabled={availableAnswers.length > 0 || gameOver} className="bg-primary hover:bg-primary/90">
              <CheckCircle className="mr-2 h-4 w-4" /> Submit Guesses
            </Button>
          </>
        )}
        {gameOver && (
          <div className="text-center w-full space-y-4">
             <Alert className={score === userTargets.length ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700"}>
                <Trophy className="h-5 w-5" />
                <AlertTitle className="text-xl font-bold">Game Over! Your Score: {score} / {userTargets.length}</AlertTitle>
                <AlertDescription>
                    {score === userTargets.length ? "Perfect score! You know them well!" : "Nice try! Better luck next time."}
                </AlertDescription>
            </Alert>
            <div className="flex gap-4 justify-center">
                <Button onClick={resetGame} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" /> Play Again
                </Button>
                <Button onClick={() => router.push(`/q/${questionnaire.id}/play`)}>
                Choose Another Question
                </Button>
                <Button onClick={() => router.push(`/q/${questionnaire.id}/results`)} variant="secondary">
                View Overall Results
                </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
