import React from 'react';
import { cn } from '../lib/utils';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
}

const buttonVariants = {
  primary: 'bg-[#CBAB58] text-[#1F2024] hover:bg-[#b69843] focus:ring-[#CBAB58]/50',
  secondary: 'bg-[#2C2D32] text-white hover:bg-[#3C3D42] focus:ring-[#2C2D32]/50',
  outline: 'border-2 border-[#CBAB58] text-[#CBAB58] bg-transparent hover:bg-[#CBAB58]/10 focus:ring-[#CBAB58]/50',
  ghost: 'text-white hover:bg-white/10 focus:ring-white/20',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50'
};

const buttonSizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-lg'
};

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = 'Loading...',
  leftIcon,
  rightIcon,
  ariaLabel,
  ariaDescribedBy,
  className,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1F2024]',
        'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        // Variant styles
        buttonVariants[variant],
        // Size styles
        buttonSizes[size],
        className
      )}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <div 
          className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"
          aria-hidden="true"
        />
      )}
      {!loading && leftIcon && (
        <span className="mr-2" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span>
        {loading ? loadingText : children}
      </span>
      {!loading && rightIcon && (
        <span className="ml-2" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};