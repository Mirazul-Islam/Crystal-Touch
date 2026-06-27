import { CheckCircle2, Circle } from 'lucide-react';
import type { Report } from '../../lib/types';
import { formatDateTime } from '../../lib/format';
import { PhotoGrid } from './PhotoGrid';

export function ReportView({ report }: { report: Report }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Completed {formatDateTime(report.completed_at)}
        </div>
        <p className="mt-3 whitespace-pre-line text-slate-700">{report.summary}</p>
      </div>

      {report.checklist.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-900">Checklist</h4>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {report.checklist.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300" />
                )}
                <span className={item.done ? '' : 'text-slate-400 line-through'}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.before_photos.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-900">Before</h4>
          <PhotoGrid photos={report.before_photos} />
        </div>
      )}

      {report.after_photos.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-900">After</h4>
          <PhotoGrid photos={report.after_photos} />
        </div>
      )}
    </div>
  );
}
