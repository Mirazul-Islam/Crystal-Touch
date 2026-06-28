import { MessageSquare } from 'lucide-react';
import type { JobUpdate } from '../../lib/types';
import { relativeTime } from '../../lib/format';
import { PhotoGrid } from './PhotoGrid';
import { EmptyState } from '../ui/Spinner';

export function JobUpdatesFeed({ updates }: { updates: JobUpdate[] }) {
  if (!updates.length) {
    return (
      <EmptyState
        title="No updates yet"
        description="Progress comments and photos from the cleaner will appear here."
      />
    );
  }

  return (
    <ul className="space-y-4">
      {updates.map((u) => (
        <li key={u.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
            <MessageSquare className="h-3.5 w-3.5" />
            {relativeTime(u.created_at)}
          </div>
          {u.comment && <p className="text-sm text-slate-700">{u.comment}</p>}
          {u.photo_urls.length > 0 && (
            <div className="mt-3">
              <PhotoGrid photos={u.photo_urls} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
