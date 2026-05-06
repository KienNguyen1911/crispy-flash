'use client';

import Link from "next/link";
import { Github, Twitter } from "lucide-react";
import { useEffect, useState } from "react";

export function Footer() {
  const [year] = useState(() => new Date().getFullYear());

  return (
    <footer className="w-full bg-card/50 border-t border-border mt-auto" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background font-bold font-headline">L</div>
            <span className="text-xl font-bold font-headline">Lingofy</span>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/guide" className="hover:text-primary transition-colors">Guide</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>

          <div className="flex gap-4">
            <a href="https://twitter.com" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://github.com" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="w-5 h-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
          
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground opacity-60" suppressHydrationWarning>
          &copy; {year || new Date().getFullYear()} Lingofy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
