export default function AppFooter() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Who Said What? - A fun matching game.</p>
        <p className="text-xs mt-1">Powered by Next.js, Tailwind CSS, and Genkit AI.</p>
      </div>
    </footer>
  );
}
