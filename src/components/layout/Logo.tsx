import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import clsx from 'clsx';

export function Logo({
  className,
  to = '/',
  light = false,
}: {
  className?: string;
  to?: string;
  light?: boolean;
}) {
  return (
    <Link to={to} className={clsx('inline-flex items-center gap-2', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
        <Sparkles className="h-5 w-5" />
      </span>
      <span
        className={clsx(
          'text-lg font-extrabold tracking-tight',
          light ? 'text-white' : 'text-slate-900',
        )}
      >
        Crystal<span className="text-brand-500">Touch</span>
      </span>
    </Link>
  );
}
