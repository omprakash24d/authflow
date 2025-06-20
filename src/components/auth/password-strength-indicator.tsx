'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password?: string;
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
  { label: 'At least one special character (!"#$%&\'()*+,-./:;<=>?@[]^_{|}~`)', regex: /[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~]/ },
];

export function PasswordStrengthIndicator({ password = '' }: PasswordStrengthIndicatorProps) {
  return (
    <div className="mt-2 space-y-1">
      {criteria.map((criterion) => {
        const isValid = criterion.regex.test(password);
        return (
          <div key={criterion.label} className={`flex items-center text-xs ${isValid ? 'text-green-600' : 'text-destructive'}`}>
            {isValid ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
            <span>{criterion.label}</span>
          </div>
        );
      })}
    </div>
  );
}
