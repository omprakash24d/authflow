// src/components/auth/password-input.tsx
// This component provides a reusable password input field with a toggle
// to show or hide the password text. It integrates with react-hook-form.

'use client'; // Client component due to state for password visibility.

import type { ControllerRenderProps, FieldValues, FieldPath } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock } from 'lucide-react'; // Icons for show/hide toggle and lock
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the PasswordInput component.
 * Generic types TAppFieldValues and TFieldName allow it to be used with various react-hook-form structures.
 * @template TAppFieldValues - The shape of the form values.
 * @template TFieldName - The specific name of the password field in the form.
 * @property field - The field object provided by react-hook-form's `render` prop in `<FormField>`.
 * @property placeholder - Optional placeholder text for the input.
 * @property disabled - Optional boolean to disable the input.
 * @property inputClassName - Optional CSS class name to apply to the input element itself.
 * @property autoComplete - Optional autocomplete attribute value for the input.
 */
interface PasswordInputProps<
  TAppFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TAppFieldValues> = FieldPath<TAppFieldValues>
> {
  field: ControllerRenderProps<TAppFieldValues, TFieldName>;
  placeholder?: string;
  disabled?: boolean;
  inputClassName?: string;
  autoComplete?: string;
}

/**
 * PasswordInput component.
 * A specialized input field for passwords with a show/hide toggle.
 * @param {PasswordInputProps<TAppFieldValues, TFieldName>} props - The component's props.
 * @returns JSX.Element
 */
export function PasswordInput<
  TAppFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TAppFieldValues> = FieldPath<TAppFieldValues>
>({
  field,
  placeholder,
  disabled,
  inputClassName,
  autoComplete,
}: PasswordInputProps<TAppFieldValues, TFieldName>) {
  // State to manage whether the password text is shown or hidden.
  const [showPassword, setShowPassword] = useState(false);

  // Toggles the password visibility state.
  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="relative"> {/* Relative positioning for the icons and toggle button */}
      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type={showPassword ? 'text' : 'password'} // Dynamically set input type
        placeholder={placeholder}
        {...field} // Spread react-hook-form field props (name, value, onChange, onBlur, ref)
        disabled={disabled}
        className={cn('pl-10 pr-10', inputClassName)} // Padding for icon and toggle
        autoComplete={autoComplete} // Useful for password managers (e.g., "current-password", "new-password")
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
