import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { FileText, CalendarClock } from 'lucide-react';
import type { SeriesVisit } from '../../lib/types';
import { StatusBadge } from '../ui/Badge';
import { formatDate } from '../../lib/format';

/**
 * Lists every visit in a recurring series (schedule + history). `hrefFor`
 * returns the link for a visit (by token for clients, by id for staff); pass
 * null to render rows without links.
 */
export function SeriesTimeline({
  series,
  currentId,
  hrefFor,
}: {
  series: SeriesVisit[];
  currentId: string;
  hrefFor: ((visit: SeriesVisit) => string) | null;
}) {
  const ordered = [...series].sort((a, b) => a.visit_number - b.visit_number);

  return (
    <ol className="space-y-2">
      {ordered.map((v) => {
        const isCurrent = v.id === currentId;
        const inner = (
          <div
            className={clsx(
              'flex items-center justify-between rounded-lg border px-3 py-2.5 transition',
              isCurrent
                ? 'border-brand-300 bg-brand-50'
                : 'border-slate-200 bg-white hover:bg-slate-50',
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={clsx(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  isCurrent ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600',
                )}
              >
                {v.visit_number}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Visit {v.visit_number}
                  {isCurrent && (
                    <span className="ml-2 text-xs font-normal text-brand-600">
                      (this one)
                    </span>
                  )}
                </p>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <CalendarClock className="h-3 w-3" />
                  {v.preferred_date ? formatDate(v.preferred_date) : 'Date TBC'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {v.has_report && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <FileText className="h-3.5 w-3.5" /> Report
                </span>
              )}
              <StatusBadge status={v.status} />
            </div>
          </div>
        );

        return (
          <li key={v.id}>
            {hrefFor && !isCurrent ? (
              <Link to={hrefFor(v)} className="block">
                {inner}
              </Link>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ol>
  );
}
