import clsx from 'clsx';
import type { BookingStatus } from '../../lib/types';
import { STATUS_LABELS, STATUS_STYLES } from '../../lib/constants';

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700',
        className,
      )}
    >
      {children}
    </span>
  );
}
