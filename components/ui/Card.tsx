import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat';
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  const variants = {
    default: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm',
    elevated: 'bg-white dark:bg-zinc-900 shadow-md dark:shadow-zinc-950/50',
    flat: 'bg-zinc-50 dark:bg-zinc-800/50',
  };

  return (
    <div
      className={cn('rounded-2xl', variants[variant], className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pt-5 pb-3', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-5', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-semibold text-base text-zinc-900 dark:text-white', className)}
      {...props}
    />
  );
}
