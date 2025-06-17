'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Questionnaire, SubmittedAnswer, UserAnswers, User } from '@/lib/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnswerSubmissionFormProps {
  questionnaire: Questionnaire;
}

const answerSchema = z.object({
  text: z.string().min(1, 'Answer cannot be empty.'),
});

const answerSubmissionFormSchema = z.object({
  userName: z.string().min(2, 'Name must be at least 2 characters long.'),
  answers: z.array(answerSchema),
});

type AnswerSubmissionFormData = z.infer<typeof answerSubmissionFormSchema>;

export default function AnswerSubmissionForm({ questionnaire }: AnswerSubmissionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [userAnswers, setUserAnswers] = useLocalStorage<UserAnswers[]>('userAnswers', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  
  const form = useForm<AnswerSubmissionFormData>({
    resolver: zodResolver(answerSubmissionFormSchema),
    defaultValues: {
      userName: '',
      answers: questionnaire.questions.map(() => ({ text: '' })),
    },
  });
  
  useEffect(() => {
    if (currentUser) {
      form.setValue('userName', currentUser.name);
    }
  }, [currentUser, form]);

  const alreadyAnswered = currentUser && userAnswers.some(ua => ua.userId === currentUser.id && ua.questionnaireId === questionnaire.id);

  const onSubmit = (data: AnswerSubmissionFormData) => {
    let userId = currentUser?.id;
    if (!currentUser || currentUser.name !== data.userName) {
      userId = crypto.randomUUID();
      setCurrentUser({ id: userId, name: data.userName });
    }

    if (!userId) { // Should not happen if logic above is correct
        toast({ title: "Error", description: "User ID could not be determined.", variant: "destructive"});
        return;
    }
    
    // Filter out previous answers for this user and questionnaire
    const otherUserAnswers = userAnswers.filter(ua => !(ua.userId === userId && ua.questionnaireId === questionnaire.id));

    const newAnswers: UserAnswers = {
      userId: userId,
      userName: data.userName,
      questionnaireId: questionnaire.id,
      answers: data.answers.map((ans, index) => ({
        questionId: questionnaire.questions.sort((a,b) => a.order - b.order)[index].id,
        text: ans.text,
      })),
      submittedAt: new Date().toISOString(),
    };

    setUserAnswers([...otherUserAnswers, newAnswers]);
    toast({
      title: "Answers Submitted!",
      description: `Your answers for "${questionnaire.title}" have been saved.`,
    });
    router.push(`/q/${questionnaire.id}`);
  };

  if (alreadyAnswered) {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl text-primary">Answers Submitted</CardTitle>
                <CardDescription>You have already submitted answers for this questionnaire as {currentUser?.name}.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You can now proceed to play the game or view results if available.</p>
            </CardContent>
            <CardFooter>
                <Button onClick={() => router.push(`/q/${questionnaire.id}`)} className="w-full">
                    Back to Questionnaire
                </Button>
            </CardFooter>
        </Card>
    );
  }


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Answer: {questionnaire.title}</CardTitle>
        <CardDescription>Provide your answers to the questions below. Your name will be associated with your answers.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userName" className="text-lg flex items-center">
              <UserCircle className="mr-2 h-5 w-5 text-accent" /> Your Name
            </Label>
            <Input
              id="userName"
              {...form.register('userName')}
              placeholder="Enter your name"
              className="text-base"
            />
            {form.formState.errors.userName && (
              <p className="text-sm text-destructive">{form.formState.errors.userName.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-lg">Your Answers</Label>
            {questionnaire.questions.sort((a,b) => a.order - b.order).map((question, index) => (
              <div key={question.id} className="space-y-2 p-4 border rounded-md shadow-sm bg-background/50">
                <Label htmlFor={`answers.${index}.text`} className="font-medium text-foreground/80">
                  {index + 1}. {question.text}
                </Label>
                <Controller
                  name={`answers.${index}.text`}
                  control={form.control}
                  render={({ field }) => (
                    <Textarea
                      id={`answers.${index}.text`}
                      {...field}
                      placeholder="Your answer here..."
                      rows={3}
                      className="text-base"
                    />
                  )}
                />
                {form.formState.errors.answers?.[index]?.text && (
                  <p className="text-sm text-destructive">{form.formState.errors.answers[index]?.text?.message}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <Send className="mr-2 h-5 w-5" /> Submit Answers
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
