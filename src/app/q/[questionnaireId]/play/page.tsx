'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Questionnaire, UserAnswers } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, HelpCircle, ListChecks, Play } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SelectQuestionToPlayPage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = params.questionnaireId as string;

  const [questionnaires] = useLocalStorage<Questionnaire[]>('questionnaires', []);
  const [allUserAnswers] = useLocalStorage<UserAnswers[]>('userAnswers', []);
  const questionnaire = questionnaires.find(q => q.id === questionnaireId);

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
  
  const answersForThisQuestionnaire = allUserAnswers.filter(ua => ua.questionnaireId === questionnaire.id);
  const uniqueUserCount = new Set(answersForThisQuestionnaire.map(ua => ua.userId)).size;

  if (uniqueUserCount < 2) {
     return (
      <div className="space-y-8">
        <Button onClick={() => router.push(`/q/${questionnaireId}`)} variant="outline" size="sm" className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Questionnaire
        </Button>
        <Card className="w-full max-w-lg mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Not Enough Players</CardTitle>
            <CardDescription>The matching game requires at least two participants to have answered the questions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertTitle>Waiting for more answers!</AlertTitle>
              <AlertDescription>
                Currently, {uniqueUserCount} participant(s) have answered. Please ask more friends to answer the questions in <span className="font-semibold">"{questionnaire.title}"</span>.
                You can share the link to <Link href={`/q/${questionnaire.id}/answer`} className="text-primary hover:underline">this questionnaire's answer page</Link>.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <Button onClick={() => router.push(`/q/${questionnaireId}`)} variant="outline" size="sm" className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Questionnaire
      </Button>

      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <ListChecks className="h-8 w-8 text-accent" />
            Play: {questionnaire.title}
          </CardTitle>
          <CardDescription>Select a question below to start the matching game. Try to guess who wrote each answer!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questionnaire.questions.sort((a, b) => a.order - b.order).map((question, index) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Question {index + 1}</p>
                  <p className="text-muted-foreground truncate max-w-md">{question.text}</p>
                </div>
                <Button asChild>
                  <Link href={`/q/${questionnaireId}/play/${question.id}`}>
                    <Play className="mr-2 h-4 w-4" /> Play
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
