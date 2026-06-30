import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Search } from 'lucide-react';
import { Seo } from '../../components/Seo';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Field';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/Spinner';
import { listClients } from '../../lib/api';
import { formatDate, formatPrice } from '../../lib/format';

export function AdminClients() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['clients'],
    queryFn: listClients,
  });

  const term = search.trim().toLowerCase();
  const clients = (data?.clients ?? []).filter(
    (c) =>
      !term ||
      (c.name ?? '').toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term),
  );

  return (
    <>
      <Seo title="Clients | Crystal Touch" noindex />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-sm text-slate-500">
          Everyone who’s booked with you. Open a client to see their work history and
          generate an invoice.
        </p>
      </div>

      <div className="mb-5 max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={(error as Error).message} />}
      {data && clients.length === 0 && (
        <EmptyState
          title="No clients yet"
          description="Bookings submitted from the website will list their clients here."
        />
      )}

      {clients.length > 0 && (
        <Card>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Bookings</th>
                  <th className="px-5 py-3 font-medium">Completed</th>
                  <th className="px-5 py-3 font-medium">Billed</th>
                  <th className="px-5 py-3 font-medium">Last booking</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c) => (
                  <tr key={c.email} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{c.name || '—'}</p>
                      <p className="text-xs text-slate-500">{c.email}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{c.phone || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{c.bookings}</td>
                    <td className="px-5 py-3 text-slate-600">{c.completed}</td>
                    <td className="px-5 py-3 text-slate-600">{formatPrice(c.total)}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDate(c.last_booking_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/admin/clients/${encodeURIComponent(c.email)}`}
                        className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
                      >
                        Open <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {clients.map((c) => (
              <Link
                key={c.email}
                to={`/admin/clients/${encodeURIComponent(c.email)}`}
                className="block p-4 hover:bg-slate-50"
              >
                <p className="font-semibold text-slate-800">{c.name || c.email}</p>
                <p className="text-xs text-slate-500">{c.email}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {c.bookings} bookings · {c.completed} completed · {formatPrice(c.total)}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
