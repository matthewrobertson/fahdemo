import Link from 'next/link';
import { Home, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppHeader() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary hover:text-primary/80 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-accent">
            <path d="M17 10c.1-.<seg_14>.1-.6.1-.9a5.42 5.42 0 0 0-2.9-4.9A5 5 0 0 0 10 4c-2.8 0-5 2.2-5 5a5.4 5.4 0 0 0 .1.9"/>
            <path d="M17.6 13.5c-.2 0-.4.1-.5.2l-1.9 1.9c-.2.2-.2.6 0 .8l1.9 1.9c.2.2.6.2.8 0l1.9-1.9c.2-.2.2-.6 0-.8l-1.9-1.9c-.1-.1-.3-.2-.4-.2z"/>
            <path d="M6.4 13.5c-.2 0-.4.1-.5.2l-1.9 1.9c-.2.2-.2.6 0 .8l1.9 1.9c.2.2.6.2.8 0l1.9-1.9c.2-.2.2-.6 0-.8l-1.9-1.9c-.1-.1-.3-.2-.4-.2z"/>
            <path d="M12 17.5c-.2 0-.4.1-.5.2l-1.9 1.9c-.2.2-.2.6 0 .8l1.9 1.9c.2.2.6.2.8 0l1.9-1.9c.2-.2.2-.6 0-.8l-1.9-1.9c-.1-.1-.3-.2-.4-.2z"/>
            <path d="M7.1 10.1A4.19 4.19 0 0 1 10 9a4.19 4.19 0 0 1 2.9 1.1"/>
          </svg>
          Who Said What?
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="bg-primary/10 hover:bg-primary/20 border-primary/50 text-primary hover:text-primary">
            <Link href="/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Questionnaire
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
