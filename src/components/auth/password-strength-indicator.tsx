
// src/components/auth/password-strength-indicator.tsx
// This component provides visual feedback on the strength of a password
// based on a set of predefined criteria (length, character types).

'use client'; // Client component due to password processing and state.

import * as React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react'; // Icons for criteria status

/**
 * Props for the PasswordStrengthIndicator component.
 * @property password - The password string to evaluate.
 */
interface PasswordStrengthIndicatorProps {
  password: string; // The password input is required for this component to function.
}

/**
 * Interface defining a password strength criterion.
 * @property label - User-friendly label for the criterion (e.g., "At least 8 characters").
 * @property regex - Regular expression used to test the password against this criterion.
 */
interface StrengthCriterion {
  label: string;
  regex: RegExp;
}

// Array of criteria used to evaluate password strength.
const criteria: StrengthCriterion[] = [
  { label: 'At least 8 characters', regex: /.{8,}/ },
  { label: 'At least one lowercase letter (a-z)', regex: /[a-z]/ },
  { label: 'At least one uppercase letter (A-Z)', regex: /[A-Z]/ },
  { label: 'At least one number (0-9)', regex: /[0-9]/ },
  { label: 'At least one special character (!"#$%&\'()*+,-./:;<=>?@[]^_{|}~`)', regex: /[!"#$%&'()*+,-./:;<=>?@\[\]\^_{|}~\`]/ },
];

/**
 * PasswordStrengthIndicator component.
 * Displays a list of password criteria and indicates whether the provided password meets them.
 * Also shows an overall strength label (Weak, Moderate, Strong).
 * @param {PasswordStrengthIndicatorProps} props - The component's props.
 * @returns JSX.Element | null - Renders the strength indicator or null if the password is empty.
 */
export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  // Memoize the strength calculation to avoid re-computation on every render if `password` hasn't changed.
  const strengthResult = React.useMemo(() => {
    let score = 0; // Score based on how many criteria are met.
    // Check each criterion against the password.
    const checks = criteria.map((criterion) => {
      const isValid = criterion.regex.test(password);
      if (isValid) {
        score++;
      }
      return { label: criterion.label, isValid };
    });

    // Determine overall strength label and color based on the score.
    let strengthLabel = 'Weak';
    let strengthColor = 'text-destructive'; // Default to weak (uses CSS var for dark mode)

    if (password.length > 0) { // Only determine strength if there's a password
        if (score >= 5) { // All criteria met
        strengthLabel = 'Strong';
        strengthColor = 'text-green-600 dark:text-green-400';
        } else if (score >= 3) { // 3 or 4 criteria met
        strengthLabel = 'Moderate';
        strengthColor = 'text-yellow-500 dark:text-yellow-400';
        }
        // If score < 3, it remains 'Weak' with 'text-destructive'
    } else { // No password or empty password
        strengthLabel = ''; // Or 'Very Weak' / 'Too Short' if preferred for empty state
        strengthColor = 'text-muted-foreground'; // Neutral color for empty state if shown
    }

    return { checks, score, strengthLabel, strengthColor };
  }, [password]); // Recalculate only when `password` changes.

  // The parent component (SignUpForm) usually controls visibility,
  // ensuring this component is only rendered when password.length > 0.
  // This check is a safeguard.
  if (password.length === 0) {
    return null; // Don't render anything if the password string is empty.
  }

  return (
    <div className="mt-2 space-y-1" aria-live="polite"> {/* aria-live for screen reader updates */}
      <div className="flex justify-between items-center mb-1 text-xs">
        <span className="font-semibold">Password Strength:</span>
        {strengthResult.strengthLabel && ( // Display strength label if available
          <span className={`font-bold ${strengthResult.strengthColor}`}>
            {strengthResult.strengthLabel}
          </span>
        )}
      </div>
      <ul className="space-y-1">
        {strengthResult.checks.map((criterion) => ( // List each criterion and its status
          <li
            key={criterion.label}
            className={`flex items-center text-xs ${
              criterion.isValid ? 'text-green-600 dark:text-green-400' : 'text-destructive' // Dynamic color
            }`}
          >
            {criterion.isValid ? (
              <CheckCircle2 aria-hidden="true" className="mr-2 h-4 w-4" /> // Check icon for met criteria
            ) : (
              <XCircle aria-hidden="true" className="mr-2 h-4 w-4" /> // X icon for unmet criteria
            )}
            <span>{criterion.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
