import React, { forwardRef } from 'react';
import { cn } from '../lib/utils';

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  required?: boolean;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    containerClassName,
    labelClassName,
    inputClassName,
    id,
    required,
    className,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-white',
              required && "after:content-['*'] after:ml-1 after:text-red-500",
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#71727A]" aria-hidden="true">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-12 px-4 text-white bg-[#2C2D32] rounded-xl border-2 transition-colors',
              'placeholder:text-[#71727A] focus:outline-none focus:ring-2 focus:ring-[#CBAB58] focus:ring-offset-2 focus:ring-offset-[#1F2024]',
              error 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-[#2C2D32] focus:border-[#CBAB58]',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              props.disabled && 'opacity-50 cursor-not-allowed',
              inputClassName
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            aria-required={required}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#71727A]" aria-hidden="true">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p
            id={errorId}
            className="text-sm text-red-500 flex items-center"
            role="alert"
            aria-live="polite"
          >
            <span className="mr-1" aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p
            id={helperId}
            className="text-sm text-[#71727A]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';