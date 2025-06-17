'use client';

import { useParams, useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Questionnaire } from '@/lib/types';
import AnswerSubmissionForm from '@/components/AnswerSubmissionForm';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function AnswerQuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = params.questionnaireId as string;
  const [questionnaires] = useLocalStorage<Questionnaire[]>('questionnaires', []);
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

  return (
    <div className="container mx-auto py-8">
      <Button onClick={() => router.push(`/q/${questionnaireId}`)} variant="outline" size="sm" className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Questionnaire
      </Button>
      <AnswerSubmissionForm questionnaire={questionnaire} />
    </div>
  );
}
