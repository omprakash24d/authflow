
'use client';

import * as React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string; // Made required, parent component (SignUpForm) controls visibility
}

interface StrengthCriterion {
  label: string;
  regex: RegExp;
}

const criteria: StrengthCriterion[] = [
  { label: 'At least 8 characters', regex: /.{8,}/ },
  { label: 'At least one lowercase letter (a-z)', regex: /[a-z]/ },
  { label: 'At least one uppercase letter (A-Z)', regex: /[A-Z]/ },
  { label: 'At least one number (0-9)', regex: /[0-9]/ },
  { label: 'At least one special character (!"#$%&\'()*+,-./:;<=>?@[]^_{|}~`)', regex: /[!"#$%&'()*+,-./:;<=>?@[\]^_{|}~]/ },
];

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strengthResult = React.useMemo(() => {
    let score = 0;
    const checks = criteria.map((criterion) => {
      const isValid = criterion.regex.test(password);
      if (isValid) {
        score++;
      }
      return { label: criterion.label, isValid };
    });

    let strengthLabel = 'Weak';
    let strengthColor = 'text-destructive'; // Default to weak (uses CSS var for dark mode)

    if (password.length > 0) { // Only determine strength if there's a password
        if (score >= 5) {
        strengthLabel = 'Strong';
        strengthColor = 'text-green-600 dark:text-green-400';
        } else if (score >= 3) {
        strengthLabel = 'Moderate';
        strengthColor = 'text-yellow-500 dark:text-yellow-400';
        }
    } else { // No password or empty password
        strengthLabel = ''; // Or 'Very Weak' / 'Too Short'
        strengthColor = 'text-muted-foreground'; // Neutral color for empty state if shown
    }


    return { checks, score, strengthLabel, strengthColor };
  }, [password]);

  // The parent SignUpForm already ensures this component is only rendered when password.length > 0
  // So, the internal 'password.length > 0' check for rendering the summary is mostly for self-containment.
  if (password.length === 0) {
    return null; // Don't render anything if password is empty (parent should prevent this anyway)
  }

  return (
    <div className="mt-2 space-y-1" aria-live="polite">
      <div className="flex justify-between items-center mb-1 text-xs">
        <span className="font-semibold">Password Strength:</span>
        {strengthResult.strengthLabel && (
          <span className={`font-bold ${strengthResult.strengthColor}`}>
            {strengthResult.strengthLabel}
          </span>
        )}
      </div>
      <ul className="space-y-1">
        {strengthResult.checks.map((criterion) => (
          <li
            key={criterion.label}
            className={`flex items-center text-xs ${
              criterion.isValid ? 'text-green-600 dark:text-green-400' : 'text-destructive'
            }`}
          >
            {criterion.isValid ? (
              <CheckCircle2 aria-hidden="true" className="mr-2 h-4 w-4" />
            ) : (
              <XCircle aria-hidden="true" className="mr-2 h-4 w-4" />
            )}
            <span>{criterion.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
