'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Questionnaire, UserAnswers } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, FileText, MessageSquare, Play, BarChart2, Users, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = params.questionnaireId as string;

  const [questionnaires] = useLocalStorage<Questionnaire[]>('questionnaires', []);
  const [allUserAnswers] = useLocalStorage<UserAnswers[]>('userAnswers', []);

  const questionnaire = questionnaires.find(q => q.id === questionnaireId);

  if (!questionnaire) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Questionnaire Not Found</h1>
        <p className="text-muted-foreground mb-6">The questionnaire you are looking for does not exist or may have been removed.</p>
        <Button onClick={() => router.push('/')} variant="outline">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
    );
  }
  
  const answersForThisQuestionnaire = allUserAnswers.filter(ua => ua.questionnaireId === questionnaire.id);
  const uniqueUserCount = new Set(answersForThisQuestionnaire.map(ua => ua.userId)).size;


  return (
    <div className="space-y-8">
      <Button onClick={() => router.push('/')} variant="outline" size="sm" className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> All Questionnaires
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl text-primary flex items-center gap-3">
              <FileText className="h-8 w-8 text-accent" />
              {questionnaire.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
                <Users className="h-4 w-4" />
                <span>{uniqueUserCount} Participant{uniqueUserCount === 1 ? '' : 's'}</span>
            </div>
           </div>
          <CardDescription>
            Created on: {new Date(questionnaire.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Questions ({questionnaire.questions.length}):</h3>
            <ul className="space-y-3 list-decimal list-inside bg-secondary/30 p-4 rounded-md">
              {questionnaire.questions.sort((a, b) => a.order - b.order).map((question, index) => (
                <li key={question.id} className="text-foreground/90">
                  {question.text}
                </li>
              ))}
            </ul>
          </div>
          
          <Alert className="bg-accent/10 border-accent/50">
            <HelpCircle className="h-5 w-5 text-accent" />
            <AlertTitle className="text-accent">How to Play?</AlertTitle>
            <AlertDescription className="text-accent/80">
              1. <Link href={`/q/${questionnaire.id}/answer`} className="font-semibold hover:underline">Submit your answers</Link> to all questions.
              <br />
              2. Once enough people have answered, <Link href={`/q/${questionnaire.id}/play`} className="font-semibold hover:underline">play the matching game</Link> to guess who said what!
              <br />
              3. Check the <Link href={`/q/${questionnaire.id}/results`} className="font-semibold hover:underline">results</Link> to see scores and leaderboards.
            </AlertDescription>
          </Alert>

        </CardContent>
        <CardFooter className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
          <Button size="lg" asChild className="w-full">
            <Link href={`/q/${questionnaire.id}/answer`}>
              <MessageSquare className="mr-2 h-5 w-5" /> Answer Questions
            </Link>
          </Button>
          <Button size="lg" asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 hover:text-primary">
            <Link href={`/q/${questionnaire.id}/play`}>
              <Play className="mr-2 h-5 w-5" /> Play Matching Game
            </Link>
          </Button>
          <Button size="lg" asChild variant="secondary" className="w-full">
            <Link href={`/q/${questionnaire.id}/results`}>
              <BarChart2 className="mr-2 h-5 w-5" /> View Results
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
