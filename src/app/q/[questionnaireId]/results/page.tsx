'use client';

import { useParams, useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Questionnaire, GameAttempt, PlayerScore, UserAnswers } from '@/lib/types';
import LeaderboardTable from '@/components/LeaderboardTable';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = params.questionnaireId as string;

  const [questionnaires] = useLocalStorage<Questionnaire[]>('questionnaires', []);
  const [gameAttempts] = useLocalStorage<GameAttempt[]>('gameAttempts', []);
  const [allUserAnswers] = useLocalStorage<UserAnswers[]>('userAnswers', []);


  const questionnaire = questionnaires.find(q => q.id === questionnaireId);

  const leaderboardScores = useMemo(() => {
    if (!questionnaire) return [];

    const attemptsForThisQ = gameAttempts.filter(attempt => attempt.questionnaireId === questionnaire.id);
    const playerScoresMap = new Map<string, { totalScore: number; gamesPlayed: number; playerName: string }>();

    attemptsForThisQ.forEach(attempt => {
      const playerEntry = playerScoresMap.get(attempt.playerId) || { totalScore: 0, gamesPlayed: 0, playerName: attempt.playerName || 'Anonymous' };
      playerEntry.totalScore += attempt.score;
      playerEntry.gamesPlayed += 1; // Could be useful later
      playerEntry.playerName = attempt.playerName || playerEntry.playerName; // Update name if available
      playerScoresMap.set(attempt.playerId, playerEntry);
    });
    
    const scores: PlayerScore[] = [];
    playerScoresMap.forEach((data, playerId) => {
      scores.push({
        playerId,
        playerName: data.playerName,
        totalScore: data.totalScore,
      });
    });

    return scores.sort((a, b) => b.totalScore - a.totalScore);
  }, [gameAttempts, questionnaire]);

  if (!questionnaire) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Questionnaire Not Found</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="mt-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
    );
  }

  const totalQuestions = questionnaire.questions.length;
  const uniqueParticipants = new Set(allUserAnswers.filter(ua => ua.questionnaireId === questionnaireId).map(ua => ua.userId)).size;
  const uniquePlayers = new Set(gameAttempts.filter(ga => ga.questionnaireId === questionnaireId).map(ga => ga.playerId)).size;

  return (
    <div className="space-y-8">
      <Button onClick={() => router.push(`/q/${questionnaireId}`)} variant="outline" size="sm" className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Questionnaire
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <BarChart2 className="h-8 w-8 text-accent" />
            Results: {questionnaire.title}
          </CardTitle>
          <CardDescription>
            See how everyone performed in this questionnaire. The leaderboard shows total scores across all questions played.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-secondary/30 rounded-lg">
                <div className="p-3 bg-card rounded shadow">
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                    <p className="text-2xl font-bold text-primary">{totalQuestions}</p>
                </div>
                <div className="p-3 bg-card rounded shadow">
                    <p className="text-sm text-muted-foreground">Participants (Answered)</p>
                    <p className="text-2xl font-bold text-primary">{uniqueParticipants}</p>
                </div>
                <div className="p-3 bg-card rounded shadow">
                    <p className="text-sm text-muted-foreground">Players (Played Game)</p>
                    <p className="text-2xl font-bold text-primary">{uniquePlayers}</p>
                </div>
            </div>
          <LeaderboardTable scores={leaderboardScores} questionnaireTitle={questionnaire.title} />
        </CardContent>
      </Card>
    </div>
  );
}
