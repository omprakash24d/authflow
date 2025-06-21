// src/components/auth/password-input.tsx
// This component provides a reusable password input field with a toggle
// to show or hide the password text. It is designed to integrate with react-hook-form.

'use client'; // Client component due to state for password visibility.

import { forwardRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock } from 'lucide-react'; // Icons for show/hide toggle and lock
import { cn } from '@/lib/utils';

/**
 * Props for the PasswordInput component.
 * It extends standard HTML input attributes, allowing it to accept props like `placeholder`, `disabled`, etc.
 */
export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * PasswordInput component.
 * A specialized input field for passwords with a show/hide toggle, using `forwardRef`
 * to pass the ref directly to the underlying input element. This allows seamless
 * integration with libraries like `react-hook-form`.
 * @param {PasswordInputProps} props - The component's props.
 * @param {React.Ref<HTMLInputElement>} ref - The forwarded ref.
 * @returns JSX.Element
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, disabled, ...props }, ref) => {
    // State to manage whether the password text is shown or hidden.
    const [showPassword, setShowPassword] = useState(false);

    // Toggles the password visibility state.
    const toggleShowPassword = () => setShowPassword(!showPassword);

    return (
      <div className="relative"> {/* Relative positioning for the icons and toggle button */}
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type={showPassword ? 'text' : 'password'} // Dynamically set input type
          className={cn('pl-10 pr-10', className)} // Padding for icon and toggle
          ref={ref} // Forward the ref to the actual input element
          disabled={disabled}
          {...props} // Spread other props like value, onChange, placeholder, etc.
        />
        <Button
          type="button" // Prevents form submission
          variant="ghost" // Minimal styling for the button
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" // Position inside the input field
          onClick={toggleShowPassword}
          aria-label={showPassword ? "Hide password" : "Show password"} // Accessibility
          disabled={disabled}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';
