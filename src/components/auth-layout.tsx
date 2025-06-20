import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Instagram, Twitter, Linkedin, Github } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const developerLinks = [
    {
      href: "https://www.linkedin.com/in/omrakash24d/",
      icon: <Linkedin className="h-5 w-5" />,
      label: "LinkedIn"
    },
    {
      href: "https://github.com/omprakash24d",
      icon: <Github className="h-5 w-5" />,
      label: "GitHub"
    },
    {
      href: "https://twitter.com/omprakash25d",
      icon: <Twitter className="h-5 w-5" />,
      label: "Twitter"
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 sm:p-8 lg:p-10">
      <div className="mb-10">
        <Logo />
      </div>
      <main className="w-full max-w-md ">
        {children}
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p className="font-semibold">&copy; {new Date().getFullYear()} AuthFlow. All rights reserved.</p>
        <p className="mt-1">
          Developed with <span className="text-accent">&hearts;</span> by Om Prakash.
        </p>
        <div className="flex justify-center items-center space-x-3 mt-4 mb-3">
          <span className="text-xs text-muted-foreground/80 font-body">Connect with the developer:</span>
          {developerLinks.map(({ href, icon, label }) => (
            <a 
              key={label} 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              title={`Om Prakash on ${label}`} 
              className="text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1"
            >
              {icon}
              <span className="sr-only">{label}</span>
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
