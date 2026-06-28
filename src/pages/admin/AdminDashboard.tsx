import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { ArrowRight } from 'lucide-react';
import { Seo } from '../../components/Seo';
import { Card } from '../../components/ui/Card';
import { StatusBadge, RecurringBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/Spinner';
import { listBookings } from '../../lib/api';
import { SERVICE_LABELS, STATUS_LABELS } from '../../lib/constants';
import { formatDate, formatPrice } from '../../lib/format';
import type { BookingStatus } from '../../lib/types';

const FILTERS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

export function AdminDashboard() {
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bookings', filter],
    queryFn: () => listBookings(filter === 'all' ? undefined : filter),
  });

  const bookings = data?.bookings ?? [];

  const counts = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <Seo title="Dispatch board | Crystal Touch" noindex />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dispatch board</h1>
        <p className="text-sm text-slate-500">
          Review incoming requests, send quotes and assign cleaners.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={clsx(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              filter === f.value
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {f.label}
            {f.value !== 'all' && counts[f.value] ? (
              <span className="ml-1.5 text-xs opacity-80">{counts[f.value]}</span>
            ) : null}
          </button>
        ))}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={(error as Error).message} />}

      {data && bookings.length === 0 && (
        <EmptyState
          title="No bookings here"
          description="New requests submitted from the website will show up on this board."
        />
      )}

      {bookings.length > 0 && (
        <Card>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Requested</th>
                  <th className="px-5 py-3 font-medium">Cleaner</th>
                  <th className="px-5 py-3 font-medium">Quote</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{b.client_name}</p>
                      <p className="text-xs text-slate-500">{b.client_email}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <div className="flex flex-col items-start gap-1">
                        {SERVICE_LABELS[b.service_type]}
                        <RecurringBadge
                          frequency={b.frequency}
                          visitNumber={b.visit_number}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{b.city}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(b.created_at)}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {b.assigned_cleaner_name || (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatPrice(b.estimated_price)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/admin/bookings/${b.id}`}
                        className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
                      >
                        Manage <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {bookings.map((b) => (
              <Link
                key={b.id}
                to={`/admin/bookings/${b.id}`}
                className="block p-4 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">{b.client_name}</p>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span>
                    {SERVICE_LABELS[b.service_type]} · {b.city}
                  </span>
                  <RecurringBadge frequency={b.frequency} visitNumber={b.visit_number} />
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(b.created_at)} ·{' '}
                  {b.assigned_cleaner_name || 'Unassigned'} ·{' '}
                  {STATUS_LABELS[b.status]}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
