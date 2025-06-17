import Link from 'next/link';
import type { Questionnaire } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Play, BarChart2 } from 'lucide-react';

interface QuestionnaireListItemProps {
  questionnaire: Questionnaire;
}

export default function QuestionnaireListItem({ questionnaire }: QuestionnaireListItemProps) {
  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <FileText className="h-6 w-6 text-accent" />
          {questionnaire.title}
        </CardTitle>
        <CardDescription>
          Created on: {new Date(questionnaire.createdAt).toLocaleDateString()} <br />
          {questionnaire.questions.length} Question{questionnaire.questions.length === 1 ? '' : 's'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          Challenge your friends to see who knows each other best! Answer the questions and then try to match the answers.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={`/q/${questionnaire.id}/answer`}>
            <MessageSquare className="mr-2 h-4 w-4" /> Answer
          </Link>
        </Button>
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/q/${questionnaire.id}`}>
            <Play className="mr-2 h-4 w-4" /> View & Play
          </Link>
        </Button>
         <Button asChild variant="secondary" className="w-full sm:w-auto">
          <Link href={`/q/${questionnaire.id}/results`}>
            <BarChart2 className="mr-2 h-4 w-4" /> Results
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
