import clsx from 'clsx';
import { Repeat } from 'lucide-react';
import type { BookingStatus, Frequency } from '../../lib/types';
import { FREQUENCY_LABELS, STATUS_LABELS, STATUS_STYLES } from '../../lib/constants';

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

/** Shown on recurring bookings (weekly/bi-weekly/monthly). */
export function RecurringBadge({
  frequency,
  visitNumber,
  className,
}: {
  frequency: Frequency;
  visitNumber?: number;
  className?: string;
}) {
  if (frequency === 'one_time') return null;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-700 ring-1 ring-inset ring-accent-200',
        className,
      )}
    >
      <Repeat className="h-3 w-3" />
      {FREQUENCY_LABELS[frequency]}
      {visitNumber && visitNumber > 1 ? ` · visit ${visitNumber}` : ''}
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
