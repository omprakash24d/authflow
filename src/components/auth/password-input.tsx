
'use client';

import type { ControllerRenderProps, FieldValues, FieldPath } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps<
  TAppFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TAppFieldValues> = FieldPath<TAppFieldValues>
> {
  field: ControllerRenderProps<TAppFieldValues, TFieldName>;
  placeholder?: string;
  disabled?: boolean;
  showPasswordState: boolean;
  toggleShowPasswordState: () => void;
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
  showPasswordState,
  toggleShowPasswordState,
  inputClassName,
  autoComplete,
}: PasswordInputProps<TAppFieldValues, TFieldName>) {
  return (
    <div className="relative">
      <Input
        type={showPasswordState ? 'text' : 'password'}
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
        onClick={toggleShowPasswordState}
        aria-label={showPasswordState ? "Hide password" : "Show password"}
        disabled={disabled}
      >
        {showPasswordState ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}
