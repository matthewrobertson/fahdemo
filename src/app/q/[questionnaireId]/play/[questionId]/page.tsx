'use client';

import { useParams, useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Questionnaire, Question as QuestionType } from '@/lib/types';
import MatchingGameArea from '@/components/MatchingGameArea';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function PlayGamePage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = params.questionnaireId as string;
  const questionId = params.questionId as string;

  const [questionnaires] = useLocalStorage<Questionnaire[]>('questionnaires', []);
  const questionnaire = questionnaires.find(q => q.id === questionnaireId);
  const question = questionnaire?.questions.find(q => q.id === questionId);

  if (!questionnaire || !question) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Game Data Not Found</h1>
        <p className="text-muted-foreground">Could not load the questionnaire or question.</p>
        <Button onClick={() => router.push(`/q/${questionnaireId}/play`)} variant="outline" className="mt-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Question Selection
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
       <Button onClick={() => router.push(`/q/${questionnaireId}/play`)} variant="outline" size="sm" className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Select Different Question
      </Button>
      <MatchingGameArea questionnaire={questionnaire} question={question} />
    </div>
  );
}
