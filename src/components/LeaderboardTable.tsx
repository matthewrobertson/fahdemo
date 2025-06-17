'use client';

import type { PlayerScore } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Award, UserCircle } from 'lucide-react';

interface LeaderboardTableProps {
  scores: PlayerScore[];
  questionnaireTitle: string;
}

export default function LeaderboardTable({ scores, questionnaireTitle }: LeaderboardTableProps) {
  if (scores.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No scores recorded yet for "{questionnaireTitle}". Be the first to play!
      </div>
    );
  }

  const sortedScores = [...scores].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <Table>
      <TableCaption>Leaderboard for questionnaire: "{questionnaireTitle}"</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px] text-center">Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="text-right">Total Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedScores.map((player, index) => (
          <TableRow key={player.playerId} className={index < 3 ? 'bg-accent/10' : ''}>
            <TableCell className="font-medium text-center">
              {index < 3 ? (
                <Award className={`inline-block h-6 w-6 ${
                  index === 0 ? 'text-yellow-500' : 
                  index === 1 ? 'text-gray-400' : 
                  'text-orange-400'
                }`} />
              ) : (
                index + 1
              )}
            </TableCell>
            <TableCell className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              {player.playerName}
            </TableCell>
            <TableCell className="text-right font-semibold text-primary">{player.totalScore}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
