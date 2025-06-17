'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Questionnaire, Question } from '@/lib/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const questionSchema = z.object({
  text: z.string().min(5, 'Question must be at least 5 characters long.'),
});

const questionnaireFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  questions: z.array(questionSchema).min(1, 'Add at least one question.'),
});

type QuestionnaireFormData = z.infer<typeof questionnaireFormSchema>;

export default function CreateQuestionnaireForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [questionnaires, setQuestionnaires] = useLocalStorage<Questionnaire[]>('questionnaires', []);
  
  const form = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireFormSchema),
    defaultValues: {
      title: '',
      questions: [{ text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const onSubmit = (data: QuestionnaireFormData) => {
    const newQuestionnaire: Questionnaire = {
      id: crypto.randomUUID(),
      title: data.title,
      questions: data.questions.map((q, index) => ({
        id: crypto.randomUUID(),
        text: q.text,
        order: index,
      })),
      createdAt: new Date().toISOString(),
    };
    setQuestionnaires([...questionnaires, newQuestionnaire]);
    toast({
      title: "Questionnaire Created!",
      description: `"${data.title}" has been saved.`,
      variant: "default"
    });
    router.push(`/q/${newQuestionnaire.id}`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Create New Questionnaire</CardTitle>
        <CardDescription>Fill in the details below to create your questionnaire. Add as many questions as you like!</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-lg">Questionnaire Title</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="e.g., Team Building Fun, Friends Trivia"
              className="text-base"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-lg">Questions</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2 p-4 border rounded-md shadow-sm bg-background/50">
                <Label htmlFor={`questions.${index}.text`}>Question {index + 1}</Label>
                <Textarea
                  id={`questions.${index}.text`}
                  {...form.register(`questions.${index}.text`)}
                  placeholder="e.g., What's your favorite movie?"
                  rows={3}
                  className="text-base"
                />
                {form.formState.errors.questions?.[index]?.text && (
                  <p className="text-sm text-destructive">{form.formState.errors.questions[index]?.text?.message}</p>
                )}
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                    className="mt-2"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Remove Question
                  </Button>
                )}
              </div>
            ))}
            {form.formState.errors.questions && typeof form.formState.errors.questions.message === 'string' && (
                <p className="text-sm text-destructive">{form.formState.errors.questions.message}</p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ text: '' })}
              className="w-full border-dashed border-primary text-primary hover:bg-primary/10"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <Save className="mr-2 h-5 w-5" /> Save Questionnaire
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
