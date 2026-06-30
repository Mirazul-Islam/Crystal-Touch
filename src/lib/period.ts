export type GroupBy = 'day' | 'week' | 'month';
export type RangePreset =
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'all';

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Returns an inclusive {from, to} date range (YYYY-MM-DD) for a preset. */
export function presetRange(p: RangePreset): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const day = now.getDate();

  if (p === 'today') {
    const t = iso(now);
    return { from: t, to: t };
  }
  if (p === 'this_week') {
    const dow = (now.getDay() + 6) % 7; // Monday = 0
    return {
      from: iso(new Date(y, m, day - dow)),
      to: iso(new Date(y, m, day - dow + 6)),
    };
  }
  if (p === 'this_month') {
    return { from: iso(new Date(y, m, 1)), to: iso(new Date(y, m + 1, 0)) };
  }
  if (p === 'last_month') {
    return { from: iso(new Date(y, m - 1, 1)), to: iso(new Date(y, m, 0)) };
  }
  return { from: '', to: '' }; // all time
}

export const RANGE_LABELS: Record<RangePreset, string> = {
  today: 'Today',
  this_week: 'This week',
  this_month: 'This month',
  last_month: 'Last month',
  all: 'All time',
};

/** The period bucket a date falls into, for grouping the work list. */
export function groupOf(dateStr: string, by: GroupBy): { key: string; label: string } {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { key: 'unknown', label: 'Undated' };

  if (by === 'day') {
    return {
      key: dateStr,
      label: d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  }
  if (by === 'month') {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      key,
      label: d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    };
  }
  // week — Monday start
  const dow = (d.getDay() + 6) % 7;
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow);
  return {
    key: iso(start),
    label: `Week of ${start.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`,
  };
}
