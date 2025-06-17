
'use client';

import React from 'react'; // Explicitly import React
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListChecks } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Questionnaire } from '@/lib/types';
import QuestionnaireListItem from '@/components/QuestionnaireListItem';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [questionnaires] = useLocalStorage<Questionnaire[]>('questionnaires', []);

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-card rounded-xl shadow-lg">
        <div className="container mx-auto px-4">
          <Image 
            src="https://picsum.photos/seed/whosaidwhat/600/300" 
            alt="Group of people talking" 
            width={600} 
            height={300} 
            className="mx-auto rounded-lg mb-8 shadow-md"
            data-ai-hint="people discussion"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Welcome to Who Said What?
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create questionnaires, share them with friends, and then test your knowledge by guessing who gave which answer. It's a fun way to see how well you know each other!
          </p>
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/create">
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Questionnaire
            </Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold flex items-center gap-3 text-primary border-b pb-2">
          <ListChecks className="h-8 w-8 text-accent" />
          Available Questionnaires
        </h2>
        {questionnaires.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questionnaires.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((q) => (
              <QuestionnaireListItem key={q.id} questionnaire={q} />
            ))}
          </div>
        ) : (
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                No questionnaires created yet. Why not <Link href="/create" className="text-primary hover:underline">create one now</Link>?
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
