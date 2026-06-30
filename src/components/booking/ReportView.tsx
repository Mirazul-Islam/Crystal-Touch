import { CheckCircle2, Circle, ShieldCheck, Coffee } from 'lucide-react';
import type { Report } from '../../lib/types';
import { formatDateTime } from '../../lib/format';
import { PhotoGrid } from './PhotoGrid';

function Checklist({ items }: { items: { label: string; done: boolean }[] }) {
  return (
    <ul className="grid gap-1.5 sm:grid-cols-2">
      {items.map((item, i) => (
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
  );
}

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
          <h4 className="mb-2 text-sm font-semibold text-slate-900">Cleaning checklist</h4>
          <Checklist items={report.checklist} />
        </div>
      )}

      {report.closing_checklist?.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-brand-600" /> Secured before leaving
          </h4>
          <Checklist items={report.closing_checklist} />
        </div>
      )}

      {report.supply_alerts?.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Coffee className="h-4 w-4 text-accent-600" /> Supplies to restock
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {report.supply_alerts.map((a, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                  a.status === 'out'
                    ? 'bg-red-50 text-red-700 ring-red-200'
                    : 'bg-amber-50 text-amber-700 ring-amber-200'
                }`}
              >
                {a.item}: {a.status === 'out' ? 'Out' : 'Low'}
              </span>
            ))}
          </div>
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
