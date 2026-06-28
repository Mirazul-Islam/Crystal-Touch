import { Link } from 'react-router-dom';
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
    <Link to={to} className={clsx('inline-flex items-center gap-2.5', className)}>
      <img
        src="/crystal-tile.svg"
        alt="Crystal Touch"
        width={36}
        height={36}
        className="h-9 w-9 rounded-lg shadow-sm"
      />
      <span className="flex flex-col leading-none">
        <span
          className={clsx(
            'text-lg font-extrabold tracking-tight',
            light ? 'text-white' : 'text-brand-900',
          )}
        >
          Crystal Touch
        </span>
        <span
          className={clsx(
            'mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]',
            light ? 'text-accent-300' : 'text-accent-500',
          )}
        >
          Cleaning Services
        </span>
      </span>
    </Link>
  );
}
