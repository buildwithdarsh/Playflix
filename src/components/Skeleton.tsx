import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('rounded-lg animate-shimmer', className)}
      aria-hidden
    />
  );
}
