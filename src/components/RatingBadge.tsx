import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingBadgeProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function RatingBadge({ rating, size = 'md', showIcon = true }: RatingBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs gap-0.5',
    md: 'text-sm gap-1',
    lg: 'text-base gap-1.5',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <div
      className={cn(
        'inline-flex items-center font-bold text-imdb',
        sizeClasses[size]
      )}
    >
      {showIcon && <Star className="fill-imdb" size={iconSizes[size]} />}
      <span>{rating.toFixed(1)}</span>
    </div>
  );
}
