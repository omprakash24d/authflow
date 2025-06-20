
'use client';

import type { ControllerRenderProps, FieldValues, FieldPath } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

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
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        {...field}
        disabled={disabled}
        className={inputClassName}
        autoComplete={autoComplete}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={toggleShowPassword}
        aria-label={showPassword ? "Hide password" : "Show password"}
        disabled={disabled}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}
