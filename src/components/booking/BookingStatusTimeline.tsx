import clsx from 'clsx';
import { Check } from 'lucide-react';
import type { BookingStatus } from '../../lib/types';
import { PIPELINE, STATUS_LABELS } from '../../lib/constants';

export function BookingStatusTimeline({ status }: { status: BookingStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600">
        This booking was cancelled.
      </div>
    );
  }

  const currentIndex = PIPELINE.indexOf(status);

  return (
    <ol className="flex items-center">
      {PIPELINE.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  done && 'bg-brand-600 text-white',
                  current && 'bg-brand-600 text-white ring-4 ring-brand-100',
                  !done && !current && 'bg-slate-200 text-slate-500',
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={clsx(
                  'mt-1.5 whitespace-nowrap text-xs font-medium',
                  current ? 'text-brand-700' : 'text-slate-500',
                )}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {i < PIPELINE.length - 1 && (
              <div
                className={clsx(
                  'mx-2 h-0.5 flex-1',
                  i < currentIndex ? 'bg-brand-600' : 'bg-slate-200',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
