'use client'; // This component uses client-side state for the current year.

import { useState, useEffect } from 'react';
import { TwitterIcon, GithubIcon, LinkedinIcon } from 'lucide-react'; 

/**
 * AuthFooter component.
 * Displays copyright, a small message, and social media links for the developer.
 * @returns JSX.Element
 */
export function AuthFooter() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // This prevents hydration mismatch by ensuring the year is determined on the client-side.
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Array of developer's social media links for easy mapping.
  const developerLinks = [
    {
      href: "https://www.linkedin.com/in/omrakash24d/",
      icon: <LinkedinIcon className="h-5 w-5" />,
      label: "LinkedIn"
    },
    {
      href: "https://github.com/omprakash24d",
      icon: <GithubIcon className="h-5 w-5" />,
      label: "GitHub"
    },
    {
      href: "https://twitter.com/omprakash25d",
      icon: <TwitterIcon className="h-5 w-5" />,
      label: "Twitter"
    },
  ];

  return (
    <footer className="mt-12 text-center text-sm text-muted-foreground">
      <p className="font-semibold">&copy; {currentYear} AuthFlow. All rights reserved.</p>
      <p className="mt-1">
        Developed with <span className="text-accent">&hearts;</span> by Om Prakash.
      </p>
      <nav className="flex justify-center items-center space-x-3 mt-4 mb-3" aria-label="Connect with the developer">
        <span className="text-xs text-muted-foreground/80 font-body">Connect with the developer:</span>
        {developerLinks.map(({ href, icon, label }) => (
          <a
            key={label}
            href={href}
            target="_blank" // Opens link in a new tab
            rel="noopener noreferrer" // Security measure for external links
            aria-label={`Om Prakash on ${label}`} // Accessibility label
            className="text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1"
          >
            {icon}
            <span className="sr-only">{label}</span> {/* For screen readers if icon is primary content */}
          </a>
        ))}
      </nav>
    </footer>
  );
}
